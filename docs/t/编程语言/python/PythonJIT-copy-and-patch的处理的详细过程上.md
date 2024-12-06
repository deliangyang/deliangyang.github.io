
Python JIT（Just In Time）是通过 copy-and-patch 编译技术实现的。copy-andpatch 是什么，其实现原理是什么？

> In computing, copy-and-patch compilation is a simple compiler technique intended for just-in-time compilation (JIT compilation) that uses pattern matching to match pre-generated templates to parts of an abstract syntax tree (AST) or bytecode stream, and emit corresponding pre-written machine code fragments that are then patched to insert memory addresses, register addresses, constants and other parameters to produce executable code. Code not matched by templates can be either be interpreted in the normal way, or code created to directly call interpreter code.  
>  
> 在计算中，复制和修补编译是一种简单的编译器技术，旨在用于即时编译，它使用模式匹配将预生成的模板与抽象语法树或字节码流的部分进行匹配，并发出相应的预编写机器然后修补代码片段以插入内存地址、寄存器地址、常量和其他参数以生成可执行代码。与模板不匹配的代码可以以正常方式解释，也可以创建代码来直接调用解释器代码。

### 使用 docker 搭建研究环境

Python JIT 目前还在实验阶段，编译条件依赖 llvm 和 clang-19，导致 Python-3.14.0a 的编译过程变得异常复杂。接下来研究的环境继续使用 docker。可以执行如下 shell 进入镜像：

```bash
sudo docker run -it \
    -v /home/yourhome/Python-3.14.0a2:/home/yourhome/Python-3.14.0a2 \
    "silkeh/clang:19"
```

### 执行脚本生成 jit_stencils.h

这里再详细的描述一下 jit_stencils.h 的生成过程。我们将如下 shell 的输出重定向到 output.txt。

```bash
python3 ./Tools/jit/build.py x86_64-pc-linux-gnu \
    --debug -v -f > output.txt

# x86_64-pc-linux-gnu 是编译工具链
# --debug 开启 debug 模式
# -v 输出调试信息，也就是脚本中的执行命令，主要包括
# -f 强制执行，输出文件 jit_stencils.h
```

通过 awk 和 uniq 命令可以统计生成过程中调用了哪些命令行工具，根据输出结果，我们也可以推断出程序对 268 个指令进行了转换和机器代码提取。

```bash
cat 1.txt | grep -v version | awk '{print $1}' | sort | uniq -c
#    268 clang
#    268 llvm-objdump
#    268 llvm-readobj
```

通过执行命令 `cat jit_stencils.h |grep -oP '{emit_' | uniq -c` 验证了我们的推断是正确的，但是其中有一个指令是 `emit_shim`。


### clang 做了什么？

```bash
clang --target=x86_64-pc-linux-gnu \
    -DPy_BUILD_CORE_MODULE -D_DEBUG -D_JIT_OPCODE=_BINARY_OP -D_PyJIT_ACTIVE -D_Py_JIT \
    -I. -I/home/yourhome/Python-3.14.0a2/Include \
    -I/home/yourhome/Python-3.14.0a2/Include/internal \
    -I/home/yourhome/Python-3.14.0a2/Include/internal/mimalloc \
    -I/home/yourhome/Python-3.14.0a2/Python \
    -I/home/yourhome/Python-3.14.0a2/Tools/jit \
    -O3 \
    -c -fno-asynchronous-unwind-tables -fno-builtin -fno-plt -fno-stack-protector -std=c11 \
    -o /tmp/tmp1u5tn8__/_BINARY_OP.o \
    /tmp/tmp1u5tn8__/_BINARY_OP.c -fpic
```

- --taget 就是编译工具链
- D 宏的定义
    >   \<macro>=\<value>  
    >   Define \<macro> to \<value> (or 1 if \<value> omitted)  
    >   Disable control flow integrity (CFI) checks for cross-DSO calls.  
    >   Enable control flow integrity (CFI) checks for cross-DSO calls.  

- -03 很好理解，就是使用最佳性能优化
    > '-O3' to enable only conforming optimizations  
- -I 引入头文件
- -c 只运行预处理、编译和装配步骤
    > Only run preprocess, compile, and assemble steps

clang 命令行工具的参数太多了，全部介绍意义不大，我将上面几个比较重要的做了一下说明。-o 后面的值是生成的 object 文件路径，临时文件 /tmp/tmp1u5tn8__/_BINARY_OP.c 是将 Python/executor_cases.c.h 中 case _BINARY_OP 的代码块拷贝插入模版文件后生成的 c 文件。我们稍微调整一下 Python 的代码，读取 c 文件，然后将 /tmp/tmp1u5tn8__/_BINARY_OP.c 的内容打印出来。

```python
# Tools/jit/_targets.py+143
    with open(c) as file:
        print('=' * 80)
        print(file.read())
        print('=' * 80)

    await _llvm.run("clang", args, echo=self.verbose)
```

如下 c 代码是指令 _BINARY_OP 模版嵌套后生成的代码。从代码可以看出，该文件引入了大量的头文件，添加了一堆预处理定义，对照其它指令生成的 c 文件，你会发现文件大部分的内容都是相同的，不同之处就是 case 的代码块，而这个 case 的代码块是从文件 Python/executor_cases.c.h 对应的 case 复制过来的。

```c
#include "Python.h"

#include "pycore_backoff.h"
#include "pycore_call.h"
#include "pycore_ceval.h"
#include "pycore_cell.h"
#include "pycore_dict.h"
#include "pycore_emscripten_signal.h"
#include "pycore_intrinsics.h"
#include "pycore_jit.h"
#include "pycore_long.h"
#include "pycore_opcode_metadata.h"
#include "pycore_opcode_utils.h"
#include "pycore_optimizer.h"
#include "pycore_pyatomic_ft_wrappers.h"
#include "pycore_range.h"
#include "pycore_setobject.h"
#include "pycore_sliceobject.h"
#include "pycore_descrobject.h"
#include "pycore_stackref.h"

#include "ceval_macros.h"

#include "jit.h"

#undef CURRENT_OPARG
#define CURRENT_OPARG() (_oparg)

#undef CURRENT_OPERAND0
#define CURRENT_OPERAND0() (_operand0)

#undef CURRENT_OPERAND1
#define CURRENT_OPERAND1() (_operand1)

#undef DEOPT_IF
#define DEOPT_IF(COND, INSTNAME) \
    do {                         \
        if ((COND)) {            \
            goto deoptimize;     \
        }                        \
    } while (0)

#undef ENABLE_SPECIALIZATION
#define ENABLE_SPECIALIZATION (0)

#undef GOTO_ERROR
#define GOTO_ERROR(LABEL)        \
    do {                         \
        goto LABEL ## _tier_two; \
    } while (0)

#undef GOTO_TIER_TWO
#define GOTO_TIER_TWO(EXECUTOR) \
do {  \
    OPT_STAT_INC(traces_executed);                \
    __attribute__((musttail))                     \
    return ((jit_func_preserve_none)((EXECUTOR)->jit_side_entry))(frame, stack_pointer, tstate); \
} while (0)

#undef GOTO_TIER_ONE
#define GOTO_TIER_ONE(TARGET) \
do {  \
    _PyFrame_SetStackPointer(frame, stack_pointer); \
    return TARGET; \
} while (0)

#undef LOAD_IP
#define LOAD_IP(UNUSED) \
    do {                \
    } while (0)

#define PATCH_VALUE(TYPE, NAME, ALIAS)  \
    PyAPI_DATA(void) ALIAS;             \
    TYPE NAME = (TYPE)(uintptr_t)&ALIAS;

#define PATCH_JUMP(ALIAS)                                    \
do {                                                         \
    PyAPI_DATA(void) ALIAS;                                  \
    __attribute__((musttail))                                \
    return ((jit_func_preserve_none)&ALIAS)(frame, stack_pointer, tstate); \
} while (0)

#undef JUMP_TO_JUMP_TARGET
#define JUMP_TO_JUMP_TARGET() PATCH_JUMP(_JIT_JUMP_TARGET)

#undef JUMP_TO_ERROR
#define JUMP_TO_ERROR() PATCH_JUMP(_JIT_ERROR_TARGET)

#undef WITHIN_STACK_BOUNDS
#define WITHIN_STACK_BOUNDS() 1

#define TIER_TWO 2

__attribute__((preserve_none)) _Py_CODEUNIT *
_JIT_ENTRY(_PyInterpreterFrame *frame, _PyStackRef *stack_pointer, PyThreadState *tstate)
{
    // Locals that the instruction implementations expect to exist:
    PATCH_VALUE(_PyExecutorObject *, current_executor, _JIT_EXECUTOR)
    int oparg;
    int uopcode = _JIT_OPCODE;
    _Py_CODEUNIT *next_instr;
    // Other stuff we need handy:
    PATCH_VALUE(uint16_t, _oparg, _JIT_OPARG)
#if SIZEOF_VOID_P == 8
    PATCH_VALUE(uint64_t, _operand0, _JIT_OPERAND0)
    PATCH_VALUE(uint64_t, _operand1, _JIT_OPERAND1)
#else
    assert(SIZEOF_VOID_P == 4);
    PATCH_VALUE(uint32_t, _operand0_hi, _JIT_OPERAND0_HI)
    PATCH_VALUE(uint32_t, _operand0_lo, _JIT_OPERAND0_LO)
    uint64_t _operand0 = ((uint64_t)_operand0_hi << 32) | _operand0_lo;

    PATCH_VALUE(uint32_t, _operand1_hi, _JIT_OPERAND1_HI)
    PATCH_VALUE(uint32_t, _operand1_lo, _JIT_OPERAND1_LO)
    uint64_t _operand1 = ((uint64_t)_operand1_hi << 32) | _operand1_lo;
#endif
    PATCH_VALUE(uint32_t, _target, _JIT_TARGET)

    OPT_STAT_INC(uops_executed);
    UOP_STAT_INC(uopcode, execution_count);

    switch (uopcode) {
        // The actual instruction definition gets inserted here:
        case _BINARY_OP: {
            _PyStackRef rhs;
            _PyStackRef lhs;
            _PyStackRef res;
            oparg = CURRENT_OPARG();
            rhs = stack_pointer[-1];
            lhs = stack_pointer[-2];
            PyObject *lhs_o = PyStackRef_AsPyObjectBorrow(lhs);
            PyObject *rhs_o = PyStackRef_AsPyObjectBorrow(rhs);
            assert(_PyEval_BinaryOps[oparg]);
            _PyFrame_SetStackPointer(frame, stack_pointer);
            PyObject *res_o = _PyEval_BinaryOps[oparg](lhs_o, rhs_o);
            stack_pointer = _PyFrame_GetStackPointer(frame);
            PyStackRef_CLOSE(lhs);
            PyStackRef_CLOSE(rhs);
            if (res_o == NULL) JUMP_TO_ERROR();
            res = PyStackRef_FromPyObjectSteal(res_o);
            stack_pointer[-2] = res;
            stack_pointer += -1;
            assert(WITHIN_STACK_BOUNDS());
            break;
        }
        default:
            Py_UNREACHABLE();
    }
    PATCH_JUMP(_JIT_CONTINUE);
    // Labels that the instruction implementations expect to exist:

error_tier_two:
    tstate->previous_executor = (PyObject *)current_executor;
    GOTO_TIER_ONE(NULL);
exit_to_tier1:
    tstate->previous_executor = (PyObject *)current_executor;
    GOTO_TIER_ONE(_PyCode_CODE(_PyFrame_GetCode(frame)) + _target);
exit_to_tier1_dynamic:
    tstate->previous_executor = (PyObject *)current_executor;
    GOTO_TIER_ONE(frame->instr_ptr);
}
```

### llvm-objdump 做了什么？

<b>llvm-objdump 用来生成 code_body 的注释</b>。光看代码，不自己实践一下，很难加深理解（如果命令执行失败，试着去掉 \ 和换行，让命令保持一行执行）。将上面的 c 代码拷贝到一个文件中，然后替换一下 clang 命令中的 c 文件名称，执行命令生成 .o 文件。拿到文件之后，我们就可以执行 llvm-objdump 输出 object dump 了，如果你对这些比较敏感的话，就会发现，输出内容其实就是 jit_stencils.h 每个 emit 函数的注释。

```bash
llvm-objdump --disassemble --reloc \
    /tmp/tmp1u5tn8__/_BINARY_OP.o
```

object dump 如下：

```s
llvm-objdump --disassemble --reloc /tmp/_BINARY_OP.o

/tmp/_BINARY_OP.o:	file format elf64-x86-64

Disassembly of section .text:

0000000000000000 <_JIT_ENTRY>:
       0: 55                           	pushq	%rbp
       1: 0f b7 05 00 00 00 00         	movzwl	(%rip), %eax            # 0x8 <_JIT_ENTRY+0x8>
		0000000000000004:  R_X86_64_GOTPCREL	_JIT_OPARG-0x4
       8: 48 8b 0d 00 00 00 00         	movq	(%rip), %rcx            # 0xf <_JIT_ENTRY+0xf>
		000000000000000b:  R_X86_64_REX_GOTPCRELX	_PyEval_BinaryOps-0x4
       f: 48 8b 04 c1                  	movq	(%rcx,%rax,8), %rax
      13: 48 85 c0                     	testq	%rax, %rax
      16: 0f 84 e2 00 00 00            	je	0xfe <_JIT_ENTRY+0xfe>
      1c: 49 83 7c 24 40 00            	cmpq	$0x0, 0x40(%r12)
      22: 0f 85 f6 00 00 00            	jne	0x11e <_JIT_ENTRY+0x11e>
      28: 49 8b 6d f0                  	movq	-0x10(%r13), %rbp
      2c: 4d 8b 7d f8                  	movq	-0x8(%r13), %r15
      30: 4d 89 6c 24 40               	movq	%r13, 0x40(%r12)
      35: 48 89 ef                     	movq	%rbp, %rdi
      38: 4c 89 fe                     	movq	%r15, %rsi
      3b: ff d0                        	callq	*%rax
      3d: 4d 8b 6c 24 40               	movq	0x40(%r12), %r13
      42: 4d 85 ed                     	testq	%r13, %r13
      45: 0f 84 f3 00 00 00            	je	0x13e <_JIT_ENTRY+0x13e>
      4b: 48 89 c3                     	movq	%rax, %rbx
      4e: 49 c7 44 24 40 00 00 00 00   	movq	$0x0, 0x40(%r12)
      57: 48 8b 45 00                  	movq	(%rbp), %rax
      5b: 48 85 c0                     	testq	%rax, %rax
      5e: 7e 06                        	jle	0x66 <_JIT_ENTRY+0x66>
      60: 85 c0                        	testl	%eax, %eax
      62: 79 1f                        	jns	0x83 <_JIT_ENTRY+0x83>
      64: eb 29                        	jmp	0x8f <_JIT_ENTRY+0x8f>
      66: 48 8d 3d 00 00 00 00         	leaq	(%rip), %rdi            # 0x6d <_JIT_ENTRY+0x6d>
		0000000000000069:  R_X86_64_PC32	.L.str.1-0x4
      6d: be 89 00 00 00               	movl	$0x89, %esi
      72: 48 89 ea                     	movq	%rbp, %rdx
      75: ff 15 00 00 00 00            	callq	*(%rip)                 # 0x7b <_JIT_ENTRY+0x7b>
		0000000000000077:  R_X86_64_GOTPCRELX	_Py_NegativeRefcount-0x4
      7b: 48 8b 45 00                  	movq	(%rbp), %rax
      7f: 85 c0                        	testl	%eax, %eax
      81: 78 0c                        	js	0x8f <_JIT_ENTRY+0x8f>
      83: ff 15 00 00 00 00            	callq	*(%rip)                 # 0x89 <_JIT_ENTRY+0x89>
		0000000000000085:  R_X86_64_GOTPCRELX	_Py_DECREF_DecRefTotal-0x4
      89: 48 ff 4d 00                  	decq	(%rbp)
      8d: 74 0e                        	je	0x9d <_JIT_ENTRY+0x9d>
      8f: 49 8b 07                     	movq	(%r15), %rax
      92: 48 85 c0                     	testq	%rax, %rax
      95: 7e 17                        	jle	0xae <_JIT_ENTRY+0xae>
      97: 85 c0                        	testl	%eax, %eax
      99: 79 2f                        	jns	0xca <_JIT_ENTRY+0xca>
      9b: eb 38                        	jmp	0xd5 <_JIT_ENTRY+0xd5>
      9d: 48 89 ef                     	movq	%rbp, %rdi
      a0: ff 15 00 00 00 00            	callq	*(%rip)                 # 0xa6 <_JIT_ENTRY+0xa6>
		00000000000000a2:  R_X86_64_GOTPCRELX	_Py_Dealloc-0x4
      a6: 49 8b 07                     	movq	(%r15), %rax
      a9: 48 85 c0                     	testq	%rax, %rax
      ac: 7f e9                        	jg	0x97 <_JIT_ENTRY+0x97>
      ae: 48 8d 3d 00 00 00 00         	leaq	(%rip), %rdi            # 0xb5 <_JIT_ENTRY+0xb5>
		00000000000000b1:  R_X86_64_PC32	.L.str.1-0x4
      b5: be 8a 00 00 00               	movl	$0x8a, %esi
      ba: 4c 89 fa                     	movq	%r15, %rdx
      bd: ff 15 00 00 00 00            	callq	*(%rip)                 # 0xc3 <_JIT_ENTRY+0xc3>
		00000000000000bf:  R_X86_64_GOTPCRELX	_Py_NegativeRefcount-0x4
      c3: 49 8b 07                     	movq	(%r15), %rax
      c6: 85 c0                        	testl	%eax, %eax
      c8: 78 0b                        	js	0xd5 <_JIT_ENTRY+0xd5>
      ca: ff 15 00 00 00 00            	callq	*(%rip)                 # 0xd0 <_JIT_ENTRY+0xd0>
		00000000000000cc:  R_X86_64_GOTPCRELX	_Py_DECREF_DecRefTotal-0x4
      d0: 49 ff 0f                     	decq	(%r15)
      d3: 74 14                        	je	0xe9 <_JIT_ENTRY+0xe9>
      d5: 48 85 db                     	testq	%rbx, %rbx
      d8: 74 1d                        	je	0xf7 <_JIT_ENTRY+0xf7>
      da: 49 89 5d f0                  	movq	%rbx, -0x10(%r13)
      de: 49 83 c5 f8                  	addq	$-0x8, %r13
      e2: 5d                           	popq	%rbp
      e3: ff 25 00 00 00 00            	jmpq	*(%rip)                 # 0xe9 <_JIT_ENTRY+0xe9>
		00000000000000e5:  R_X86_64_GOTPCRELX	_JIT_CONTINUE-0x4
      e9: 4c 89 ff                     	movq	%r15, %rdi
      ec: ff 15 00 00 00 00            	callq	*(%rip)                 # 0xf2 <_JIT_ENTRY+0xf2>
		00000000000000ee:  R_X86_64_GOTPCRELX	_Py_Dealloc-0x4
      f2: 48 85 db                     	testq	%rbx, %rbx
      f5: 75 e3                        	jne	0xda <_JIT_ENTRY+0xda>
      f7: 5d                           	popq	%rbp
      f8: ff 25 00 00 00 00            	jmpq	*(%rip)                 # 0xfe <_JIT_ENTRY+0xfe>
		00000000000000fa:  R_X86_64_GOTPCRELX	_JIT_ERROR_TARGET-0x4
      fe: 48 8d 3d 00 00 00 00         	leaq	(%rip), %rdi            # 0x105 <_JIT_ENTRY+0x105>
		0000000000000101:  R_X86_64_PC32	.L.str-0x4
     105: 48 8d 35 00 00 00 00         	leaq	(%rip), %rsi            # 0x10c <_JIT_ENTRY+0x10c>
		0000000000000108:  R_X86_64_PC32	.L.str.1-0x4
     10c: 48 8d 0d 00 00 00 00         	leaq	(%rip), %rcx            # 0x113 <_JIT_ENTRY+0x113>
		000000000000010f:  R_X86_64_PC32	.L__PRETTY_FUNCTION__._JIT_ENTRY-0x4
     113: ba 85 00 00 00               	movl	$0x85, %edx
     118: ff 15 00 00 00 00            	callq	*(%rip)                 # 0x11e <_JIT_ENTRY+0x11e>
		000000000000011a:  R_X86_64_GOTPCRELX	__assert_fail-0x4
     11e: 48 8d 3d 00 00 00 00         	leaq	(%rip), %rdi            # 0x125 <_JIT_ENTRY+0x125>
		0000000000000121:  R_X86_64_PC32	.L.str.3-0x4
     125: 48 8d 35 00 00 00 00         	leaq	(%rip), %rsi            # 0x12c <_JIT_ENTRY+0x12c>
		0000000000000128:  R_X86_64_PC32	.L.str.4-0x4
     12c: 48 8d 0d 00 00 00 00         	leaq	(%rip), %rcx            # 0x133 <_JIT_ENTRY+0x133>
		000000000000012f:  R_X86_64_PC32	.L__PRETTY_FUNCTION__._PyFrame_SetStackPointer-0x4
     133: ba fa 00 00 00               	movl	$0xfa, %edx
     138: ff 15 00 00 00 00            	callq	*(%rip)                 # 0x13e <_JIT_ENTRY+0x13e>
		000000000000013a:  R_X86_64_GOTPCRELX	__assert_fail-0x4
     13e: 48 8d 3d 00 00 00 00         	leaq	(%rip), %rdi            # 0x145 <_JIT_ENTRY+0x145>
		0000000000000141:  R_X86_64_PC32	.L.str.5-0x4
     145: 48 8d 35 00 00 00 00         	leaq	(%rip), %rsi            # 0x14c <_JIT_ENTRY+0x14c>
		0000000000000148:  R_X86_64_PC32	.L.str.4-0x4
     14c: 48 8d 0d 00 00 00 00         	leaq	(%rip), %rcx            # 0x153 <_JIT_ENTRY+0x153>
		000000000000014f:  R_X86_64_PC32	.L__PRETTY_FUNCTION__._PyFrame_GetStackPointer-0x4
     153: ba f1 00 00 00               	movl	$0xf1, %edx
     158: ff 15 00 00 00 00            	callq	*(%rip)                 # 0x15e <_JIT_ENTRY+0x15e>
		000000000000015a:  R_X86_64_GOTPCRELX	__assert_fail-0x4
```


### llvm-readobj 做了什么？

```bash
llvm-readobj --elf-output-style=JSON \
    --expand-relocs \
    --section-data \
    --section-relocations \
    --section-symbols \
    --sections /tmp/tmp1u5tn8__/_BINARY_OP.o
```

<b>llvm-readobj 会输出 JSON 内容，解析这个 JSON，可以获取指令对应的机器代码</b>。将 llvm-readobj 的 .o 文件替换为前面两个步骤使用的 .o 文件。执行上面被替换的命名输出 JSON，由于输出内容较多，就不全部展示，具体内容可以自己动手实践输出试试。`const unsigned char code_body[350]` 和 `const unsigned char data_body[448]` 中 16 进制 shellcode 都可以在这个 JSON 中找到，不过其内容是 10 进制的数组。JSON 主要由 FileSummary 和 数组 Sections 组成。

```json
[
    {
        "FileSummary": {
            "File": "/tmp/_BINARY_OP.o",
            "Format": "elf64-x86-64",
            "Arch": "x86_64",
            "AddressSize": "64bit",
            "LoadName": "<Not found>"
        },
        "Sections": [
            {
                "Section": {
                    "Index": 0,
                    "Name": {
                        "Name": "",
                        "Value": 0
                    },
                    ...
                }
            }
        ]
    }
]
```

也许你会好奇 JSON 里面有些什么。将 JSON 保存到文件内，使用命令行工具 jq（需要自己安装）查看：

```bash
cat binary_op.json | \ 
    jq .[0].Sections[].Section.Name.Name | \ 
    sed 's/"//g'
```

- .strtab
- .text
- .rela.text
- .rodata.str1.1
- .comment
- .note.GNU-stack
- .llvm_addrsig
- .symtab

code_body 的字节码可以通过如下命令查出：

```bash
cat binary_op.json | \
    jq '.[0].Sections[].Section | select(.Name.Name== ".text") | .SectionData' | \ 
    head
```

data_body 的字节码可以通过如下命令查出：

```bash
cat binary_op.json | \
    jq '.[0].Sections[].Section | select(.Name.Name== ".rodata.str1.1") | .SectionData' | \ 
    head
```

至于 jit_stencils.h 每个 emit__* 函数后面的函数调用，如 memcpy，patch_64，patch_32r，patch_x86_64_32rx 等等，就是一些内存拷贝，替换相应位置机器代码的操作，这里涉及的内容比较复杂，我会在后面的文章中详细分析。