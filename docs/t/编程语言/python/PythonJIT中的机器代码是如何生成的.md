
为了研究 Python JIT 是如何运行的，我们需要将源码编译成 DEBUG 模式的二进制文件，Python 源码编译需要增加参数 `--enable-experimental-jit --with-pydebug --with-trace-refs`。依旧使用 VSCode 对源码进行调试。之前有一篇文章介绍 [Python 内核源码解析：使用 VS Code 调试 Python 内核代码](https://mp.weixin.qq.com/s/oVYkxo6UOqJwhOxD2RN7CA)。需要注意的是，我们使用 docker 编译生成 Python 二进制程序，在目录映射上需要保持一致，也就是 volumes 的映射路径一致。这样，在断点调试的时候，VSCode 就能够找到对应文件的行号。

Python JIT 的核心文件是 `jit_stencils.h`，该文件存储了 Python 指令与机器代码的映射关系。该文件是编译过程中生成的，因为 CPU 的架构不同，机器代码也不同，Python 3.1.4 JIT 支持如下编译工具链：

- aarch64-apple-darwin/clang
- aarch64-pc-windows/msvc
- aarch64-unknown-linux-gnu/clang
- aarch64-unknown-linux-gnu/gcc
- i686-pc-windows-msvc/msvc
- x86_64-apple-darwin/clang
- x86_64-pc-windows-msvc/msvc
- x86_64-unknown-linux-gnu/clang
- x86_64-unknown-linux-gnu/gcc

这里简单的介绍一下 `编译工具链三元组格式介绍`，格式如：`{arch}-{vendor}-{sys}-{abi}`，明明有四个变量，为什么叫三元组格式呢？因为 vendor 或者 abi 可以省略。

> - 架构（architecture）：arm。  
> - 供应商（vendor）：unknown。这里 unknown 就是未指定供应商或者是不重要。  
> - 系统（system）：linux。  
> - ABI：gnueabihf。gnueabihf 表示系统使用 glibc 作为其 C 标准库 libc 实现，并且具有硬件加速浮点算法。  

Python JIT 的相关设计文档可以参考 PEP 744 – JIT Compilation。机器代码通过 LLVM 生成，所以编译前需要安装好 Clang-19，之前的文件已经讲解了如何安装 Python-3.14。接下来讲讲编译过程中是如何生成 `jit_stencils.h` 的。`Tools/jit` 目录下是生成该文件的脚本，`Tools/jit/build.py` 是生成的入口文件，target 参数就是编译工具链，也就是上面支持的列表。


首先脚本会读取文件 Python/executor_cases.c.h 的内容（这个文件的内容也是通过其它的脚本生成的，不得不感叹脚本和生成的强大），然后获取所有的 case，对其进行排序。循环这些 case，调用 `self._compile(.., .., ..)` 进行编译

```python
async def _build_stencils(self) -> dict[str, _stencils.StencilGroup]:
    generated_cases = PYTHON_EXECUTOR_CASES_C_H.read_text()
    cases_and_opnames = sorted(
        re.findall(
            r"\n {8}(case (\w+): \{\n.*?\n {8}\})", generated_cases, flags=re.DOTALL
        )
    )
    tasks = []
    with tempfile.TemporaryDirectory() as tempdir:
        work = pathlib.Path(tempdir).resolve()
        async with asyncio.TaskGroup() as group:
            coro = self._compile("shim", TOOLS_JIT / "shim.c", work)
            tasks.append(group.create_task(coro, name="shim"))
            template = TOOLS_JIT_TEMPLATE_C.read_text()
            for case, opname in cases_and_opnames:
                # Write out a copy of the template with *only* this case
                # inserted. This is about twice as fast as #include'ing all
                # of executor_cases.c.h each time we compile (since the C
                # compiler wastes a bunch of time parsing the dead code for
                # all of the other cases):
                c = work / f"{opname}.c"
                c.write_text(template.replace("CASE", case))
                coro = self._compile(opname, c, work)
                tasks.append(group.create_task(coro, name=opname))
    return {task.get_name(): task.result() for task in tasks}
```

self._compile 代码如下，构建 clang 的参数，调用 clang 命令行工具，生成对应的 .o 文件。self._parse(o) 会调用 llvm-object-dump 获取到相关二进制代码和汇编代码。然后构造一个  _stencils.StencilGroup 的对象，添加到 tasks 数组中。最后遍历这个数组，将所有的机器代码和汇编代码（注释）写入到 `jit_stencils.h` 中。

```python
async def _compile(
    self, opname: str, c: pathlib.Path, tempdir: pathlib.Path
) -> _stencils.StencilGroup:
    o = tempdir / f"{opname}.o"
    args = [
        f"--target={self.triple}",
        "-DPy_BUILD_CORE_MODULE",
        "-D_DEBUG" if self.debug else "-DNDEBUG",
        f"-D_JIT_OPCODE={opname}",
        "-D_PyJIT_ACTIVE",
        "-D_Py_JIT",
        "-I.",
        f"-I{CPYTHON / 'Include'}",
        f"-I{CPYTHON / 'Include' / 'internal'}",
        f"-I{CPYTHON / 'Include' / 'internal' / 'mimalloc'}",
        f"-I{CPYTHON / 'Python'}",
        f"-I{CPYTHON / 'Tools' / 'jit'}",
        "-O3",
        "-c",
        # This debug info isn't necessary, and bloats out the JIT'ed code.
        # We *may* be able to re-enable this, process it, and JIT it for a
        # nicer debugging experience... but that needs a lot more research:
        "-fno-asynchronous-unwind-tables",
        # Don't call built-in functions that we can't find or patch:
        "-fno-builtin",
        # Emit relaxable 64-bit calls/jumps, so we don't have to worry about
        # about emitting in-range trampolines for out-of-range targets.
        # We can probably remove this and emit trampolines in the future:
        "-fno-plt",
        # Don't call stack-smashing canaries that we can't find or patch:
        "-fno-stack-protector",
        "-std=c11",
        "-o",
        f"{o}",
        f"{c}",
        *self.args,
    ]
    await _llvm.run("clang", args, echo=self.verbose)
    return await self._parse(o)
```