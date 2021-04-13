## dy-batis

dy-batis是集成了mysql数据库驱动的工具。基于xml配置的SQL语句，可以更加灵活的操作数据库，降低开发和维护难度。

### 指南

安装：

```
npm i -S dy-batis
```

xml配置：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<root xmlns="https://rilyzhang.github.io/dy-batis"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="https://rilyzhang.github.io/dy-batis
   node_modules/dy-batis/schema/dy-batis.xsd">
  <select id="findUser">
    select * from user
    <where>
      <item test="id!==''">id=${id}</item>
      <item test="!!name" connector="and">name=${name}</item>
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

```javascript
import DyBatis from 'dy-batis'
import path from 'path'

async function demo () {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'demo',
  }
  const mappers = [
    path.resolve(__dirname, './demo.xml'),
  ]
  const db = new DyBatis(dbConfig, mappers)

  let result = await db.select('findUser')
  let index = result[result.length - 1].id
  console.log(result)

  result = await db.select('findUser', { id: '5' })
  console.log(result)

  db.insertOne('insertUser', { id: ++index, name: `${index}-name` })
  db.insertOne('insertUserSet', { id: ++index, name: `${index}-name` })
}

demo()
```

### 1.0版本更新

1.0主要更新内容为：

- 项目结构
- 元素解析
- Schema

#### 项目结构

此项目最初是单文件项目，代码略微混乱，不易扩展。此次更新，将实例上的部分方法抽离为私有方法，使项目和代码结构更清晰。

#### 元素解析

之前绑定在实例上的元素解析方法，现在使用面向对象的思路重构，并抽象出element接口，方便用户自行扩展。


扩展代码：

```javascript
// MyIf.js
import Element from 'dy-batis/tags/element'

export default class MyIf extends Element {

  // 元素名
  name = 'if'

  constructor (props) {
    super(props)
  }

  /** 
  * 重写Element中resolveXmlJs方法
  * @param xmlObj: 当前需要解析的元素对象
  * @param params: sql 预编译参数
  * @param sqlMapper:  sql集合,包含所有的未解析的sql xml对象
  */
  resolveXmlJs (xmlObj, params, sqlMapper) {

    if (typeof xmlObj.attributes.test === 'undefined') {
      throw Error('if 标签 test 属性没有定义！')
    }

    const flag = this.executeTest(xmlObj.attributes.test, params)

    return flag ? xmlObj.elements : []
  }

  executeTest (test, params) {

    const keys = Object.keys(params)

    let expression = keys.map(key => `const ${key}=params['${key}'];`).join('')

    expression += `return !!${test}`

    const func = new Function('params', expression)

    return func(params)
  }

}
```

```javascript
// main.js
import MyIf from './MyIf'
import DyBatis from 'dy-batis'

const db = new DyBatis()

db.installTags([
    MyIf,
])

```

#### Schema

从1.0开始，提供了XML Schema，用于规范XML标签和属性。通过引入Schema，一些常用的IDE还会自动验证XML，并给出标签提示。（例如 WebStorm 等。）

schema文件存放在此库的```schema/```路径下，名为```dy-batis.xsd```。

引入方式：

```xml
<!-- mapper.xml -->
<root xmlns="https://rilyzhang.github.io/dy-batis"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="https://rilyzhang.github.io/dy-batis
   node_modules/dy-batis/schema/dy-batis.xsd">
</root>
```

### API

- constructor
- setDBConfig
- readMapper
- installTags```1.0 新增```
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

**注：0.1.0版本中，dbConfig的debugger属性为true时会打印每次要执行的sql语句。也可以直接使用mysql库中提供的debug。详情查阅demo中的代码。**

**setDBConfig(dbConfig)**

创建实例时，如果没有传入dbConfig，可以调用该方法传入配置项。

**readMapper(mapperPath)**

创建实例时，如果没有传入mapperPath，可以调用该方法传入配置项。

**installTags(tags)**

tags为数组，为实例扩展元素解析，具体用法参考上面的例子。

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

该方法用于开启事务，返回一个Promise对象。Promise中resovle的参数是commit函数。在操作执行完成时调用commit函数来提交结果。若处于事务中的查询操作抛出异常，事务中的全部操作将被回滚。

注意，开启事务后，如果不调用commit函数，就无法将数据提交到数据库。

Example：

```javascript
async function demo () {
  const db = new Index()
  const commit = awit
  db.transaction()
  await db.insert('insertUser', { id: 1, name: 'demo' })
  // ...
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
- where where子句
- set set子句
- item ```1.0 新增，属性：test | connector``` 可以用于 set 字句或 where 子句中

属性：

id：```类型：string``` 操作的唯一标识。

precompile：```类型：boolean``` 默认false，如果为true，将不会处理语句中的${var}变量。

ref：```类型：string``` include标签专属。该属性可以将sql标签中的sql片段引入。

test：该属性用于做判断条件，值是一个js表达式。

connector：定义连接符号，多个item连接时，告诉解析器使用什么符号链接，值为 ```,|and|or```。

Example：

xml

```xml
<root>
  <insert id="insertUser1">
    insert into user values (${id}, ${name})
  </insert>

  <!-- precompile 模式 -->
  <insert id="insertUser2" precompile="true">
    insert into user set ?
  </insert>
</root>
```

js

```javascript
db.insertOne('insertUser1', { id: 1, name: `XiaoMing` })
db.insertOne('insertUser2', { id: 2, name: `XiaoLi` })
```

**where标签**

```xml
<where>
  <item test="title">b.title like concat('%',${title},'%')</item>
  <item test="len" connector="and">a.t_id in (${tag})</item>
</where>
```
