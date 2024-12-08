
Python 编译时生成的文件 jit_stencils.h，在这个文件中前面两个数组的定义其实很好理解，我们也可以很容易的知道它们是怎么生成。copy-and-patch 最难的过程不是 copy，而是 patch，因为我们不知道如何打补丁，具体在哪个位置对机器码和数据块修改打补丁。

看到生成的文件，你应该会好奇这些函数是 patch_64，patch_32r，patch_x86_64_32rx 等等是做什么用的，然后他们的参数为什么这么奇怪，有些是 data 加一个偏移量，有些是 code 加一个十六进制的偏移量，第二个参数有些是 Python 的变量，另一部是 data 的指针位置加一个偏移量。

### JIT emit_* 函数最终生成形态

如下代码便是操作码 BINARY_OP 生成的 jit 函数。

```c
void
emit__BINARY_OP(
    unsigned char *code, unsigned char *data, _PyExecutorObject *executor,
    const _PyUOpInstruction *instruction, jit_state *state)
{
    const unsigned char code_body[221] = {};

    const unsigned char data_body[88] = {};

    memcpy(data, data_body, sizeof(data_body));
    patch_64(data + 0x20, instruction->oparg);
    patch_64(data + 0x28, (uintptr_t)&_PyEval_BinaryOps);
    patch_64(data + 0x30, (uintptr_t)&_Py_NegativeRefcount);
    patch_64(data + 0x38, (uintptr_t)&_Py_DECREF_DecRefTotal);
    patch_64(data + 0x40, (uintptr_t)&_Py_Dealloc);
    patch_64(data + 0x48, (uintptr_t)code + sizeof(code_body));
    patch_64(data + 0x50, state->instruction_starts[instruction->error_target]);
    memcpy(code, code_body, sizeof(code_body));
    patch_32r(code + 0x11, (uintptr_t)data + 0x1c);
    patch_x86_64_32rx(code + 0x18, (uintptr_t)data + 0x24);
    patch_32r(code + 0x48, (uintptr_t)data + -0x4);
    patch_x86_64_32rx(code + 0x56, (uintptr_t)data + 0x2c);
    patch_x86_64_32rx(code + 0x64, (uintptr_t)data + 0x34);
    patch_x86_64_32rx(code + 0x81, (uintptr_t)data + 0x3c);
    patch_32r(code + 0x90, (uintptr_t)data + -0x4);
    patch_x86_64_32rx(code + 0x9e, (uintptr_t)data + 0x2c);
    patch_x86_64_32rx(code + 0xab, (uintptr_t)data + 0x34);
    patch_x86_64_32rx(code + 0xc4, (uintptr_t)data + 0x44);
    patch_x86_64_32rx(code + 0xcd, (uintptr_t)data + 0x3c);
    patch_x86_64_32rx(code + 0xd9, (uintptr_t)data + 0x4c);
}
```

看代码找规律，代码分为两个部分一部分是 data，一部分是 code，分别由 memcpy 领头。紧随其后的是不同的 patch 参数，有两个参数，data 部分的第一个参数是 data 加上偏移量，第二个参数是具体的变量，没有偏移量。而 code 部分第一个参数是 data 加上偏移量，第二个参数都是 `(uintptr_t)data` 加上一个十六进制的数值。要分析就需要从代码中找出这些规律来，以便我们更好的推进分析。

memcpy 的作用很好理解，就是内存拷贝。`memcpy(data, data_body, sizeof(data_body))` 是将 data_body 的内存拷贝到 data 中；同理 `memcpy(code, code_body, sizeof(code_body))` 将 code_body 的内存拷贝到 code。

随便找个函数，在目录 `Tools/jit` 下进行搜索，可以找到这个补丁函数的映射关系。`x86_64-unknown-linux-gnu` 对应的补丁函数较少，本着学习研究的目的，由简入繁，决定先找个比较轻松的 target（x86_64-unknown-linux-gnu）的研究。

### Tools/jit 下各个文件作用

- Tools/jit/_llvm.py。构造并执行 llvm 相关命令
- Tools/jit/_schema.py。Section 的定义，如：ELFSection
- Tools/jit/_stencils.py。将 JSON 文件的内容转换为我们需要的数据结构
- Tools/jit/_targets.py。不同平台的可执行程序二进制文件的数据结构，如 _ELF，_MachO 等
- Tools/jit/_writer.py。dump 数据，按照固定的模版，将活动的数据嵌入模版中，并写入到文件中


如下是 Python 生成 `emit_*` 函数相关的代码。我们可以不用了解每个 Python 类和函数的具体实现。但是需要简单知道它们的作用。

### object JSON 文件解析，以及生成 Hode 结构

```python
# Map relocation types to our JIT's patch functions. "r" suffixes indicate that
# the patch function is relative. "x" suffixes indicate that they are "relaxing"
# (see comments in jit.c for more info):
_PATCH_FUNCS = {
    # aarch64-apple-darwin:
    "ARM64_RELOC_BRANCH26": "patch_aarch64_26r",
    ...
    # x86_64-unknown-linux-gnu:
    "R_X86_64_64": "patch_64",
    "R_X86_64_GOTPCREL": "patch_32r",
    "R_X86_64_GOTPCRELX": "patch_x86_64_32rx",
    "R_X86_64_PC32": "patch_32r",
    "R_X86_64_REX_GOTPCRELX": "patch_x86_64_32rx",
    ...
}
```

接下来我们反向去推断 patch 的生成过程。找到 Tools/jit/_writer.py 的 `def _dump_stencil(opname: str, group: _stencils.StencilGroup) -> typing.Iterator[str]:` 函数，打印输出 `hole.as_c(part)` 和 hode。
  
```c
patch_x86_64_32rx(code + 0x13, (uintptr_t)data + 0x4);

Hole(
    offset=19, 
    kind='R_X86_64_GOTPCRELX', 
    value=<HoleValue.DATA: 3>, symbol=None, addend=18446744073709551620, 
    need_state=False, 
    func='patch_x86_64_32rx'
)
```
  
offset=19 是偏移量，换算成 16 进制就是 0x13，0x4 是什么呢？查看代码知道这个值是通过调用 `_signed(self.addend)` 得到的，也就是：18446744073709551620 % (1 << 64) = 0x4。
  
```python
def _signed(value: int) -> int:
    value %= 1 << 64
    if value & (1 << 63):
        value -= 1 << 64
    return value
```
  
如何找到 addend 和 `kind = 'R_X86_64_GOTPCRELX'`？在上一篇文章中，我们通过 `llvm-readobj` 打印出了一个 JSON，从 JSON 中我们就可以找到。在 Linux 下二进制可执行文件的结构为 ELF，所有我们只需要关注 _targets.py 文件的 `class _ELF():`，它便是将 JSON 转化为我们需要的 Hold 结构的关键逻辑所在。
  
```json
{
    "Relocation": {
        "Offset": 335,
        "Type": {
            "Name": "R_X86_64_PC32",
            "Value": 2
        },
        "Symbol": {
            "Name": ".L__PRETTY_FUNCTION__._PyFrame_GetStackPointer",
            "Value": 9
        },
        "Addend": 18446744073709552000
    }
}
```
  
value 映射关系，每个 HodeValues 有一个对应的 C 表达式，作为 patch 的第二个参数或者参数的一部分。
  
```python
# Translate HoleValues to C expressions:
_HOLE_EXPRS = {
    HoleValue.CODE: "(uintptr_t)code",
    HoleValue.CONTINUE: "(uintptr_t)code + sizeof(code_body)",
    HoleValue.DATA: "(uintptr_t)data",
    HoleValue.EXECUTOR: "(uintptr_t)executor",
    # These should all have been turned into DATA values by process_relocations:
    # HoleValue.GOT: "",
    HoleValue.OPARG: "instruction->oparg",
    HoleValue.OPERAND0: "instruction->operand0",
    HoleValue.OPERAND0_HI: "(instruction->operand0 >> 32)",
    HoleValue.OPERAND0_LO: "(instruction->operand0 & UINT32_MAX)",
    HoleValue.OPERAND1: "instruction->operand1",
    HoleValue.OPERAND1_HI: "(instruction->operand1 >> 32)",
    HoleValue.OPERAND1_LO: "(instruction->operand1 & UINT32_MAX)",
    HoleValue.TARGET: "instruction->target",
    HoleValue.JUMP_TARGET: "state->instruction_starts[instruction->jump_target]",
    HoleValue.ERROR_TARGET: "state->instruction_starts[instruction->error_target]",
    HoleValue.ZERO: "",
}
```

### 最终通过 _writer.py 生成 jit_stencils.h
  
在 _targets.py 和 _stencils.py 处理之后，拿到我们需要的 Hole 数组后，_writer.py 的处理逻辑会遍历这个数组，按照模版数据填充的方式将这些 patch 写入到 jit_stencils.h 中。这样整个字节码转化为 JIT 机器代码的工作就结束了。

### 思考

patch 之后是 Python 源码的继续编译。我们接下来的疑问是：这些 patch 代码是如果工作的？这个 patch 在 Python runtime 如何被运行？带着这些问题我们将继续探索。