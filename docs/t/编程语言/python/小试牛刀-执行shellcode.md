以下文章列表是之前对 Python JIT 研究过程的一个汇总。最终发现 Python JIT 其实就是在 Python 运行时的某个环节执行另外一个程序生成的机器代码，这些机器代码以补丁的形式出现在 Python 的运行时。

- [PythonJIT 如何执行](https://mp.weixin.qq.com/s/45gGOmVB2J0fRt1bCqkNVA)
- [PythonJIT 反向推断 patch 的生成过程](https://mp.weixin.qq.com/s/DMaZYgnBlVfzWxSj2kDAlQ)
- [PythonJIT-copy-and-patch 的处理的详细过程](https://mp.weixin.qq.com/s/DMvtti3U9HYwXMtlFVp2FQ)
- [PythonJIT 中的机器代码是如何生成的](https://mp.weixin.qq.com/s/isYS5PxtRjjjW97ET122LQ)
- [如何在 Ubuntu2404 上编译 PythonJIT](https://mp.weixin.qq.com/s/vReIpLQXLMlA8Pvi2dps0A)


### 尝试动手写一个程序执行机器代码

动手写一个简单的加法运算，并返回结果。
```c
// add.c

int add(int a, int b) {
    return a + b;
}
```

将 add.c 编译为中间目标文件，然后通过 objdump 将机器码和汇编代码打印出来，然后通过一系列的 shell 命令进行 parse 解析，得到一个逗号分隔的十六进制代码集合。

```bash
gcc -c add.c -o add.o
objdump -d add.o | \
    grep -P '^\s+[\da-f]+:'| \
    cut -f2 -d: | \
    cut -f1-6 -d' ' | \
    tr -s " " | \
    sed 's/ $/,/g' | \
    sed 's/ /, 0x/g' | \
    sed 's/^\t/0x/g'
```

### 申请可执行内存，执行机器代码

将输出内容拷贝到如下程序的 add_bytes 数组中。由于机器不支持匿名可执行内存 MAP_ANONYMOUS，我不得不打开一个文件描述符 `open("/dev/zero", O_RDWR);`，然后赋值给 fd，作为 mmap 的参数。

```c
// main.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>
#include <fcntl.h>

// 以下是从 add.o 中提取的字节码
unsigned char add_bytes[] = {
    0xf3, 0x0f, 0x1e, 0xfa,
    0x55,
    0x48, 0x89, 0xe5,
    0x89, 0x7d, 0xfc,
    0x89, 0x75, 0xf8,
    0x8b, 0x55, 0xfc,
    0x8b, 0x45, 0xf8,
    0x01, 0xd0,
    0x5d,
    0xc3,
};

void execute_bytecode(unsigned char *code, size_t size) {
    // 为字节码分配可执行内存
    int fd = open("/dev/zero", O_RDWR);
    if (fd == -1) {
        perror("open fail");
        exit(EXIT_FAILURE);
    }
    void *mem = mmap(NULL, size, PROT_READ | PROT_WRITE | PROT_EXEC,
                      MAP_SHARED, fd, 0);
    if (mem == MAP_FAILED) {
        perror("mmap fail");
        exit(EXIT_FAILURE);
    }

    // 将字节码拷贝到分配的内存中
    memcpy(mem, code, size);

    int (*add)(int, int) = mem;

    printf("result: %d\n", add(1, 2));

    // 释放分配的内存
    munmap(mem, size);
}

int main() {
    execute_bytecode(add_bytes, sizeof(add_bytes));
    return 0;
}
```

编译 main.c，并执行中间目标程序，得到预期的结果。

```bash
gcc -o main main.c
./main
# result: 3
```

### 总结

创建一块可执行的内存，将机器码拷贝到这块内存上，然后将这块内存强转为我们需要的函数，执行后释放内存即可。