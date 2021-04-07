import DyBatis from '../src'
import path from 'path'

async function demo() {
  const db = new DyBatis({
    host: '192.168.20.129',
    user: 'root',
    password: 'root',
    database: 'demo',
    // debug: true,        // mysql库中提供的调试器
    // debugger: true,     // dybatis中提供的调试器
  }, path.resolve(__dirname, './demo.xml'))

  // console.log(db)
  let result = await db.select('findUser', { id: 1, name: '123' })
  console.log(result)
  // let result = await db.select('findUserTest', [1])
  // console.log(result)
  /*  let result = await db.selectMany('findUser')
    let index = result[result.length - 1].id
    console.log(result)

    result = await db.select('findUser', { id: '5' })
    console.log(result)

    db.insertOne('insertUser', { id: ++index, name: `${index}-name` })
    db.insertOne('insertUserSet', { id: ++index, name: `${index}-name` })*/
}

demo()
