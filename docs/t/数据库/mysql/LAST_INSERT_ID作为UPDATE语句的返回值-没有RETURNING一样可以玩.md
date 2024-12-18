# 揭秘 MySQL LAST_INSERT_ID() 的隐藏用法：不仅仅是自增 ID！

如果你只知道 [LAST_INSERT_ID()](https://dev.mysql.com/doc/refman/8.4/en/information-functions.html#function_last-insert-id) 函数只能返回最后一条插入的自增 ID，那么你的知识库就该更新了。

LAST_INSERT_ID() 有两种用法，一种是不带参数，一种是带参数。不带参数时，返回最后一次插入操作生成的自增 ID，带参数时，返回指定的参数结果或者表达式的值。  

# 验证

## 不带参数

> With no argument, LAST_INSERT_ID() returns a BIGINT UNSIGNED (64-bit) value representing the first automatically generated value successfully inserted for an AUTO_INCREMENT column as a result of the most recently executed INSERT statement. The value of LAST_INSERT_ID() remains unchanged if no rows are successfully inserted. 

这种情况很好理解，就是返回最后一次插入操作生成的自增 ID。也是我们平时使用的最多的情况。 

```sql
insert into t (`id`) values (1);
select LAST_INSERT_ID(); -- 1
```

## 带参数

> With an argument, LAST_INSERT_ID() returns an unsigned integer, or NULL if the argument is NULL. 

这种情况下，LAST_INSERT_ID() 返回参数的值，如果参数为 NULL，则返回 NULL。是不是感觉和不带参数的情况差不多呢？但是，这种情况下，LAST_INSERT_ID() 会记住参数的值，下次调用 LAST_INSERT_ID() 时，返回的值就是这个参数的值。这样就可以模拟序列了。

```sql
select LAST_INSERT_ID(2);
select LAST_INSERT_ID(); -- 2
```

## 带参数，参数为表达式

> If expr is given as an argument to LAST_INSERT_ID(), the value of the argument is returned by the function and is remembered as the next value to be returned by LAST_INSERT_ID(). This can be used to simulate sequences:
>  
>  Create a table to hold the sequence counter and initialize it:
>  
>       mysql> <b>CREATE</b> TABLE sequence (id INT NOT NULL);  
>       mysql> <b>INSERT</b> INTO sequence VALUES (0);  
> Use the table to generate sequence numbers like this:  
>   
>       mysql> <b>UPDATE</b> sequence SET id=LAST_INSERT_ID(id+1);  
>       mysql> <b>SELECT</b> LAST_INSERT_ID();  

这种情况下，LAST_INSERT_ID() 返回参数的值，参数是一个表达式，返回的值就是这个表达式的值。同时，LAST_INSERT_ID() 会记住这个表达式的值，下次调用 LAST_INSERT_ID() 时，返回的值就是这个表达式的值。这样就可以模拟序列了。

```sql
create table sequence (id int not null);
insert into sequence values (0);
update sequence set id=LAST_INSERT_ID(id+1);

select LAST_INSERT_ID(); -- 1
```

既然 LAST_INSERT_ID() 可以作为更新语句的返回值，那么我们就可以在更新语句中使用 LAST_INSERT_ID()，来实现一些有趣的功能，如果能在并发场景下能保证数据的一致性，那就更好了。

1. update 时返回计数器增加后的值
2. insert 时返回计数器增加后的值

## 验证并发场景下 LAST_INSERT_ID() 的行为

创建一个表 `test`，并插入一条 id 为 1 的数据

```sql
-- init.sql
create table if not exists `test` (
    `id` int(11) not null auto_increment,
    `val` bigint not null default 0 comment 'value',
    primary key (`id`)
);

insert into `test` (`id`, `val`) values (1, 0);
```

使用 Docker 启动一个 MySQL 5.7 的容器。

```yml
# docker-compose.yml
version: "3.8"

services:
  mysqltest:
    image: mysql:5.7
    container_name: mysqltest
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: test
      MYSQL_USER: test
      MYSQL_PASSWORD: test
    ports:
      - "3309:3306"
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
```

编写一个 Go 程序，模拟并发场景下的 insert 和 update 操作。将每次操作的返回值打印出来，然后统计每个值出现的次数，如果有值出现次数不为 1，则说明 LAST_INSERT_ID() 在并发场景下的行为不符合预期。如果所有输出值排序之后不是连续的，则说明 LAST_INSERT_ID() 在并发场景下的行为不符合预期。

```go
// main.go
package main

import (
	"database/sql"
	"flag"
	"fmt"
	"sync"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

var (
	command string
)

func init() {
	flag.StringVar(&command, "command", "insert", "command of sql: [insert|update]")
	flag.Parse()
}

func main() {
	wg := &sync.WaitGroup{}
	// 请自行去掉 [] 符号，由于平台规则，无法直接写 sql 语句
	var sql = `[]update[] test set val = LAST_INSERT_ID(val+1) where id = 1;`
	if command == "insert" {
		sql = `[]insert[] into test (id, val) values (2, 1) on duplicate key update val = LAST_INSERT_ID(val+1);`
	}

	db := initdb()

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				result, err := db.Exec(sql)
				if err != nil {
					panic(err.Error())
				}
				val, err := result.LastInsertId()
				if err != nil {
					panic(err.Error())
				}
				fmt.Println(val)
			}
		}()
	}

	wg.Wait()
}

func initdb() *sqlx.DB {
	db, err := sql.Open("mysql", "root:root@tcp(localhost:3309)/test")
	if err != nil {
		panic(err.Error())
	}
	return sqlx.NewDb(db, "mysql")
}
```

启动容器，运行程序，查看输出结果。通过实验结果，后来两个命令的返回值为 0，表示排序之后结果是连续的，说明 LAST_INSERT_ID() 在并发场景下的行为是符合预期的。

```bash
docker-compose up -d

go run main.go -command insert | sort -n | uniq -c | awk '{print $2}' | awk '$1!=last+1{print last, $1}{last=$1}' | wc -l

go run main.go -command update | sort -n | uniq -c | awk '{print $2}' | awk '$1!=last+1{print last, $1}{last=$1}' | wc -l
```

# 总结

LAST_INSERT_ID() 有两种用法，一种是不带参数，一种是带参数。不带参数时，返回最后一次插入操作生成的自增 ID，带参数时，返回指定的参数结果或者表达式的值。带参数时，LAST_INSERT_ID() 会记住参数的值，下次调用 LAST_INSERT_ID() 时，返回的值就是这个参数的值。这样就可以模拟序列了。

在并发场景下，LAST_INSERT_ID() 的行为是符合预期的，可以用来实现一些有趣的功能，比如：返回计数器增加之后的值。