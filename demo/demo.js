const DyBatis = require('../src/dy-batis')
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
