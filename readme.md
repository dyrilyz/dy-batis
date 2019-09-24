## dy-batis

dy-batis是集成了mybatis数据库驱动的工具。基于xml配置的SQL语句，可以更加灵活的操作数据库，降低开发和维护难度。

### 快速开始

安装：
```
npm i -S dy-batis
```

xml配置：
```xml
<?xml version="1.0" encoding="utf-8" ?>
<root>
    <select id="findUser">
        select * from user
        <where>
            <if test="id!==''">id=${id}</if>
        </where>
        order by id
    </select>

    <insert id="insertUser" precompile="true">
        insert into user set ?
    </insert>

    <insert id="insertUserSet">
        insert into user values (${id}, ${name})
    </insert>
</root>
```

js代码：
```ecmascript 6
const DyBatis = require('dy-batis')
const path = require('path')


async function demo() {
    const db = new DyBatis({
        host: '192.168.8.111',
        user: 'root',
        password: 'root',
        database: 'my',
    }, path.resolve(__dirname, './demo.xml'))

    let result = await db.select('findUser')
    let index = result[result.length - 1].id
    console.log(result)

    result = await db.select('findUser', {id: '5'})
    console.log(result)

    db.insertOne('insertUser', {id: ++index, name: `${index}-name`})
    db.insertOne('insertUserSet', {id: ++index, name: `${index}-name`})
}

demo()

```

### API
- constructor
- setDBConfig
- readMapper
- select
- selectOne
- selectMany
- insertOne
- insertMany
- update
- delete
- transaction
- getPool
- getConn

**constructor([dbConfig],[mapperPath])**

构造方法

参数：

dbConfig：数据库配置项参考[https://www.npmjs.com/package/mysql#pooling-connections](https://www.npmjs.com/package/mysql#pooling-connections)

mapperPath：String | Array，mapper路径

**setDBConfig(dbConfig)**

创建实例时，如果没有传入dbConfig，可以调用该方法传入配置项。

**readMapper(mapperPath)**

创建实例时，如果没有传入mapperPath，可以调用该方法传入配置项。

**select(id, args)**

**selectOne(id, args)**

**selectMany(id, args)**

**insertOne(id, args)**

**update(id, args)**

**delete(id, args)**

参数：

id：mapper中为语句配置的id属性

args：键值对类型，执行语句需要的参数

select 当表中只有一条数据时，返回对象；当表中有多条数据时，返回一个数组

selectOne 返回结果集中的第一个对象

selectMany 返回整个结果集

**insertMany(id, args)**

参数：

id：mapper中为语句配置的id属性

args：数组类型，执行语句需要的键值对数组

**transaction()**

该方法用于开启事务，返回一个Promise对象。Promise中resovle的参数时commit函数。在操作执行完成时调用commit函数来提交结果。若处于事务中的查询操作抛出异常，事务中的全部操作将被回滚。

注意，开启事务后，如果不调用commit函数，就无法将数据提交到数据库。

Example：
```ecmascript 6
async function demo () {
    const db = new DyBatis()
    const commit = awit db.transaction()
    await db.insert('insertUser', {id:1,name:'demo'})
    ...
    commit()
}
```

**getPool()**

**getConn()**

如果你喜欢自己拼接SQL语句，或者需要执行一些别的操作，可以使用getPool和getConn来获取连接池和连接实例。使用实例可以扩展你所需要的功能。

### XML配置

- root 根标签
- select ```属性：id | precompile``` 查询标签
- insert ```属性：id | precompile``` 新增标签
- update ```属性：id | precompile``` 更新标签
- delete ```属性：id | precompile``` 删除标签
- sql ```属性：id ``` SQL片段
- include ```属性：ref```
- if ```属性：test```
   
属性：

id：```类型：string``` 操作的唯一标识。

precompile：```类型：boolean``` 默认false，如果为true，将不会处理语句中的${var}变量。

ref：```类型：string``` 该属性可以将sql标签中的sql片段引入。

test：该属性值是一个js表达式。

Example：

xml
```xml
<insert id="insertUserSet">
    insert into user values (${id}, ${name})
</insert>

<!-- precompile 模式 -->
<insert id="insertUser" precompile="true">
    insert into user set ?
</insert>
```

js
```ecmascript 6
db.insertOne('insertUserSet', {id: 1, name: `XiaoMing`})
db.insertOne('insertUser', {id: 2, name: `XiaoLi`})
```

**where标签**

```xml
<where>
    <if test="title">b.title like concat('%',${title},'%')</if>
    <if test="len">a.t_id in (${tag})</if>
</where>
```

where 标签中包含一个或多个if标签，使用where标签可以省略 ```where``` 条件中的 ```and``` 关键字。
