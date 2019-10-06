const DyBatis = require('../src/dy-batis')
const path = require('path')


async function demo() {
    const db = new DyBatis({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'my',
        debug: true,        // mysql库中提供的调试器
        debugger: true,     // dybatis中提供的调试器
    }, path.resolve(__dirname, './demo.xml'))

    let result = await db.selectMany('findUser')
    let index = result[result.length - 1].id
    console.log(result)

    result = await db.select('findUser', {id: '5'})
    console.log(result)

    db.insertOne('insertUser', {id: ++index, name: `${index}-name`})
    db.insertOne('insertUserSet', {id: ++index, name: `${index}-name`})
}

demo()
