
Python 源码目前最新的版本是 3.14.0a2。为了研究一下 Python JIT，不得不自己手动编译下源代码，目标机器是 `Linux ydl-ubuntu 6.8.0-48-generic #48~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC Mon Oct  7 11:24:13 UTC 2 x86_64 x86_64 x86_64 GNU/Linux`。Python 源码编译其实很简单，如果想编译带上 JIT，就需要额外的添加参数，可以通过这个命令 `./configure -h |grep jit` 来获取 JIT 相关的参数。

```bash
./configure --enable-experimental-jit # 开启实验性的 JIT
make && make install
```

Python-3.14.0a2 依赖 Python-3.11，以及 clang-19。clang-19 算是比较新的版本，一般的机器上不会安装这个，机器目前版本是 `Ubuntu clang version 14.0.0-1ubuntu1.1`，要从 clang-14 升级到 clang-19 不是一件容易的事情（这是后话，安装过程遇到了太多的坑，甚至想过要放弃）。

### 为什么需要安装 clang-19？
其实通过报错信息我们看到，make 过程中需要执行一个命令来生成文件 `jit_stencils.h`:

```bash
/usr/bin/python3.11 ./Tools/jit/build.py x86_64-pc-linux-gnu
```

这里我想提前揭秘 `jit_stencils.h` 是做什么的，编译成功之后文件的内容包含如下代码。你会发现其实就是 JIT 指令和机器码的映射表。这里我就不一一列举了，机器代码和机器相关，所以需要 llvm 来生成当前机器的映射关系。

```c

void
emit__BINARY_OP(
    unsigned char *code, unsigned char *data, _PyExecutorObject *executor,
    const _PyUOpInstruction *instruction, jit_state *state)
{
    // 
    // /tmp/tmp_s7bqlsz/_BINARY_OP.o:  file format elf64-x86-64
    // 
    // Disassembly of section .text:
    // 
    // 0000000000000000 <_JIT_ENTRY>:
    // 0: 55                            pushq   %rbp
    // 1: 49 8b 6d f0                   movq    -0x10(%r13), %rbp
    // 5: 49 8b 5d f8                   movq    -0x8(%r13), %rbx
    // 9: 4d 89 6c 24 40                movq    %r13, 0x40(%r12)
    // e: 0f b7 05 00 00 00 00          movzwl  (%rip), %eax            # 0x15 <_JIT_ENTRY+0x15>
    // 0000000000000011:  R_X86_64_GOTPCREL    _JIT_OPARG-0x4
    // 15: 48 8b 0d 00 00 00 00          movq    (%rip), %rcx            # 0x1c <_JIT_ENTRY+0x1c>
    // 0000000000000018:  R_X86_64_REX_GOTPCRELX       _PyEval_BinaryOps-0x4
    // 1c: 48 89 ef                      movq    %rbp, %rdi
    // 1f: 48 89 de                      movq    %rbx, %rsi
    // 22: ff 14 c1                      callq   *(%rcx,%rax,8)
    // 25: 49 89 c7                      movq    %rax, %r15
    // 28: 4d 8b 6c 24 40                movq    0x40(%r12), %r13
    // 2d: 49 c7 44 24 40 00 00 00 00    movq    $0x0, 0x40(%r12)
    // 36: 48 8b 45 00                   movq    (%rbp), %rax
    // 3a: 85 c0                         testl   %eax, %eax
    // 3c: 78 09                         js      0x47 <_JIT_ENTRY+0x47>
    // 3e: 48 ff c8                      decq    %rax
    // 41: 48 89 45 00                   movq    %rax, (%rbp)
    // 45: 74 1a                         je      0x61 <_JIT_ENTRY+0x61>
    // 47: 48 8b 03                      movq    (%rbx), %rax
    // 4a: 85 c0                         testl   %eax, %eax
    // 4c: 78 23                         js      0x71 <_JIT_ENTRY+0x71>
    // 4e: 48 ff c8                      decq    %rax
    // 51: 48 89 03                      movq    %rax, (%rbx)
    // 54: 75 1b                         jne     0x71 <_JIT_ENTRY+0x71>
    // 56: 48 89 df                      movq    %rbx, %rdi
    // 59: ff 15 00 00 00 00             callq   *(%rip)                 # 0x5f <_JIT_ENTRY+0x5f>
    // 000000000000005b:  R_X86_64_GOTPCRELX   _Py_Dealloc-0x4
    // 5f: eb 10                         jmp     0x71 <_JIT_ENTRY+0x71>
    // 61: 48 89 ef                      movq    %rbp, %rdi
    // 64: ff 15 00 00 00 00             callq   *(%rip)                 # 0x6a <_JIT_ENTRY+0x6a>
    // 0000000000000066:  R_X86_64_GOTPCRELX   _Py_Dealloc-0x4
    // 6a: 48 8b 03                      movq    (%rbx), %rax
    // 6d: 85 c0                         testl   %eax, %eax
    // 6f: 79 dd                         jns     0x4e <_JIT_ENTRY+0x4e>
    // 71: 4d 85 ff                      testq   %r15, %r15
    // 74: 74 0f                         je      0x85 <_JIT_ENTRY+0x85>
    // 76: 4d 89 7d f0                   movq    %r15, -0x10(%r13)
    // 7a: 49 83 c5 f8                   addq    $-0x8, %r13
    // 7e: 5d                            popq    %rbp
    // 7f: ff 25 00 00 00 00             jmpq    *(%rip)                 # 0x85 <_JIT_ENTRY+0x85>
    // 0000000000000081:  R_X86_64_GOTPCRELX   _JIT_CONTINUE-0x4
    // 85: 5d                            popq    %rbp
    // 86: ff 25 00 00 00 00             jmpq    *(%rip)                 # 0x8c <_JIT_ENTRY+0x8c>
    // 0000000000000088:  R_X86_64_GOTPCRELX   _JIT_ERROR_TARGET-0x4
    // 8c: 
    const unsigned char code_body[140] = {
        0x55, 0x49, 0x8b, 0x6d, 0xf0, 0x49, 0x8b, 0x5d,
        0xf8, 0x4d, 0x89, 0x6c, 0x24, 0x40, 0x0f, 0xb7,
        0x05, 0x00, 0x00, 0x00, 0x00, 0x48, 0x8b, 0x0d,
        0x00, 0x00, 0x00, 0x00, 0x48, 0x89, 0xef, 0x48,
        0x89, 0xde, 0xff, 0x14, 0xc1, 0x49, 0x89, 0xc7,
        0x4d, 0x8b, 0x6c, 0x24, 0x40, 0x49, 0xc7, 0x44,
        0x24, 0x40, 0x00, 0x00, 0x00, 0x00, 0x48, 0x8b,
        0x45, 0x00, 0x85, 0xc0, 0x78, 0x09, 0x48, 0xff,
        0xc8, 0x48, 0x89, 0x45, 0x00, 0x74, 0x1a, 0x48,
        0x8b, 0x03, 0x85, 0xc0, 0x78, 0x23, 0x48, 0xff,
        0xc8, 0x48, 0x89, 0x03, 0x75, 0x1b, 0x48, 0x89,
        0xdf, 0xff, 0x15, 0x00, 0x00, 0x00, 0x00, 0xeb,
        0x10, 0x48, 0x89, 0xef, 0xff, 0x15, 0x00, 0x00,
        0x00, 0x00, 0x48, 0x8b, 0x03, 0x85, 0xc0, 0x79,
        0xdd, 0x4d, 0x85, 0xff, 0x74, 0x0f, 0x4d, 0x89,
        0x7d, 0xf0, 0x49, 0x83, 0xc5, 0xf8, 0x5d, 0xff,
        0x25, 0x00, 0x00, 0x00, 0x00, 0x5d, 0xff, 0x25,
        0x00, 0x00, 0x00, 0x00,
    };
    // 0: 
    // 0: OPARG
    // 8: &_PyEval_BinaryOps+0x0
    // 10: &_Py_Dealloc+0x0
    // 18: CONTINUE
    // 20: ERROR_TARGET
    const unsigned char data_body[40] = {
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    };
    memcpy(data, data_body, sizeof(data_body));
    patch_64(data + 0x0, instruction->oparg);
    patch_64(data + 0x8, (uintptr_t)&_PyEval_BinaryOps);
    patch_64(data + 0x10, (uintptr_t)&_Py_Dealloc);
    patch_64(data + 0x18, (uintptr_t)code + sizeof(code_body));
    patch_64(data + 0x20, state->instruction_starts[instruction->error_target]);
    memcpy(code, code_body, sizeof(code_body));
    patch_32r(code + 0x11, (uintptr_t)data + -0x4);
    patch_x86_64_32rx(code + 0x18, (uintptr_t)data + 0x4);
    patch_x86_64_32rx(code + 0x5b, (uintptr_t)data + 0xc);
    patch_x86_64_32rx(code + 0x66, (uintptr_t)data + 0xc);
    patch_x86_64_32rx(code + 0x81, (uintptr_t)data + 0x14);
    patch_x86_64_32rx(code + 0x88, (uintptr_t)data + 0x1c);
}

static const StencilGroup stencil_groups[MAX_UOP_ID + 1] = {
    [_BINARY_OP] = {emit__BINARY_OP, 140, 40, {0}},
    [_BINARY_OP_ADD_FLOAT] = {emit__BINARY_OP_ADD_FLOAT, 52, 24, {0}},
    [_BINARY_OP_ADD_INT] = {emit__BINARY_OP_ADD_INT, 182, 40, {0}},
    [_BINARY_OP_ADD_UNICODE] = {emit__BINARY_OP_ADD_UNICODE, 182, 40, {0}},
    [_BINARY_OP_INPLACE_ADD_UNICODE] = {emit__BINARY_OP_INPLACE_ADD_UNICODE, 173, 64, {0}},
    [_BINARY_OP_MULTIPLY_FLOAT] = {emit__BINARY_OP_MULTIPLY_FLOAT, 52, 24, {0}},
    [_BINARY_OP_MULTIPLY_INT] = {emit__BINARY_OP_MULTIPLY_INT, 182, 40, {0}},
    [_BINARY_OP_SUBTRACT_FLOAT] = {emit__BINARY_OP_SUBTRACT_FLOAT, 52, 24, {0}},
    ...
}
```


官方提供了两种安装方式，一种是通过 apt 源来安装；另一种是通过官方提供的 shell 脚本来执行安装。

### 通过官方提供的源来安装 clang-19

编辑 `sudo vim /etc/apt/sources.list.d/llvm.list` 文件，将如下文本粘贴至文件中，保存后执行 `sudo apt update`，然后就可以去执行 `sudo apt install clang-19`。方法很简单，但是事与愿违，执行脚本后，输出内容会告诉你缺少各种依赖，看着就头大。

```
Noble (24.04) - Last update : Sun, 24 Nov 2024 12:29:55 UTC / Revision: 20241124082213+eb4d2f24a724
deb http://apt.llvm.org/noble/ llvm-toolchain-noble main
deb-src http://apt.llvm.org/noble/ llvm-toolchain-noble main
# 18
deb http://apt.llvm.org/noble/ llvm-toolchain-noble-18 main
deb-src http://apt.llvm.org/noble/ llvm-toolchain-noble-18 main
# 19
deb http://apt.llvm.org/noble/ llvm-toolchain-noble-19 main
deb-src http://apt.llvm.org/noble/ llvm-toolchain-noble-19 main
```

### sudo ./llvm.sh 19 all

如下 shell 是官方提供的一个简易的安装方式，把 shell 下载下来，添加可执行权限，然后用 root 权限执行安装。同样的你会发现执行不下去，安装失败。

```bash
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
sudo ./llvm.sh <version number> all
# or
sudo ./llvm.sh all
```

周五反复折腾了几次这两种方法，然后正好遇到周末休息一下，也就没有继续折腾了。这会儿突然来了一个点子，既然编译环境安装这么麻烦，我们不是有 docker 这种编译好的现成的环境吗？于是抱着试一试的心态继续折腾一下，皇天不负有心人，我在 docker 的 hub 中搜到了 `docker pull silkeh/clang:19`。有个这个不就好办了吗，之前 Python 的源码已经下载好了，我只需要制作一个 docker-compose.yml 文件即可。

```bash
version: '3.7'
services: 
  python314:
    image: silkeh/clang:19
    volumes:
      - .:/src
    working_dir: /src
    command: 
      - /bin/bash
      - -c
      - |
        ./configure --enable-experimental-jit
        make
```

将文件 docker-compose.yml 放置在 Python 源码的根目录下，我只需要执行一下 `sudo docker-compose up` 就可以进入编译。很快就在 Python 的根目录下生成了 Python 的可执行文件，比较幸运的是 docker 编译的二进制文件在物理机上也可以执行。

```bash
./python
Python 3.14.0a2 (main, Nov 24 2024, 16:11:20) [Clang 19.1.4 (++20241112103742+d174e2a55389-1~exp1~20241112103841.63)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```