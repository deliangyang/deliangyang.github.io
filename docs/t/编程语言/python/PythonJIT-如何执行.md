前面介绍那么多只是为了做一些铺垫，每个操作码对应一个 emit 函数。什么时候调用这些函数就是我们接下来需要研究的。

### 回顾

- [如何在 Ubuntu2404 上编译 PythonJIT](https://mp.weixin.qq.com/s/vReIpLQXLMlA8Pvi2dps0A)
- [PythonJIT 中的机器代码是如何生成的](https://mp.weixin.qq.com/s/isYS5PxtRjjjW97ET122LQ)
- [PythonJIT-copy-and-patch 的处理的详细过程](https://mp.weixin.qq.com/s/DMvtti3U9HYwXMtlFVp2FQ)
- [PythonJIT 反向推断 patch 的生成过程](https://mp.weixin.qq.com/s/DMaZYgnBlVfzWxSj2kDAlQ)


> // Compile the shim, which handles converting between the native  
> // calling convention and the calling convention used by jitted code  
> // (which may be different for efficiency reasons).  

在项目代码内搜索 stencil_groups 可以看到它在函数 `_PyJIT_Compile` 被索引，index 为操作码。往下继续看代码，stencil_groups 在两个循环里被索引。第一个循环设置代码块的开始 `state.instruction_starts[i] = code_size` 位置；而第二个循环是调用 OpCode 对应的 emit 函数，将调用转化为我们的 jit 代码。完成内存转换后，将这块内存标记为可执行，调用 c 函数 `mprotect`，标记失败返回 -1，释放内存。

```c
static int
mark_executable(unsigned char *memory, size_t size)
{
    if (size == 0) {
        return 0;
    }
    assert(size % get_page_size() == 0);
    // Do NOT ever leave the memory writable! Also, don't forget to flush the
    // i-cache (I cannot begin to tell you how horrible that is to debug):
#ifdef MS_WINDOWS
    if (!FlushInstructionCache(GetCurrentProcess(), memory, size)) {
        jit_error("unable to flush instruction cache");
        return -1;
    }
    int old;
    int failed = !VirtualProtect(memory, size, PAGE_EXECUTE_READ, &old);
#else
    int failed = 0;
    __builtin___clear_cache((char *)memory, (char *)memory + size);
#ifndef MAP_JIT
    failed = mprotect(memory, size, PROT_EXEC | PROT_READ);
#endif
#endif
    if (failed) {
        jit_error("unable to protect executable memory");
        return -1;
    }
    return 0;
}
```

![stencil_groups 调用](./assets/stencil_groups.jpg)