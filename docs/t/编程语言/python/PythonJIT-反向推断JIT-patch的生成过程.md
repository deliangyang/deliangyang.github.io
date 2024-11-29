
jit_stencils.h 前面两个数组的定义其实很好理解，可以很容易的知道是怎么生成。copy-and-patch 最难的过程应该是 patch，因为不知道在哪个位置对机器码和数据块打补丁。

同时，你应该也会好奇这些函数是 patch_64，patch_32r，patch_x86_64_32rx 等等是做什么用的。

```
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
```

memcpy(data, data_body, sizeof(data_body)); 是将 data_body 的内存拷贝到 data 中，同理 memcpy(code, code_body, sizeof(code_body)); 将 code_body 的内存拷贝到 code。

随便找个函数在 Tools/jit 进行搜索可以找到补丁函数的映射关系，x86_64-unknown-linux-gnu 对应的补丁函数较少，大大减轻了我们研究的成本。


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

接下来我们反向去推断 patch 的生成过程。找到 Tools/jit/_writer.py 的 `def _dump_stencil(opname: str, group: _stencils.StencilGroup) -> typing.Iterator[str]:` 函数，打印输出 hole.as_c(part) 和 hode。
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

如何找到 addend 和 kind = 'R_X86_64_GOTPCRELX'？在上一篇文章中，我们通过 llvm-readobj 打印出了一个 JSON，从 JSON 中我们就可以找到。
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

value 映射

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