## dy-batis

dy-batis是集成了mybatis数据库驱动的工具。基于xml配置的SQL语句，可以更加灵活的操作数据库，降低开发和维护难度。

### 快速开始

安装：
```
npm i -S dy-batis
```

xml配置：
```
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
```
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

数据库配置项参考[https://www.npmjs.com/package/mysql#pooling-connections](https://www.npmjs.com/package/mysql#pooling-connections)

### API
> constructor
>
> setDBConfig
>
> readMapper
>
> select
>
> selectOne
>
> selectMany
>
> insertOne
>
> insertMany
>
> update
>
> delete
>
> transaction
>
> getPool
>
> getConn
>
