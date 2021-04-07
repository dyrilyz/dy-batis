import DyBatis from '../src'
import path from 'path'

async function demo () {
  const db = new DyBatis({
    host: '',
    user: '',
    password: '',
    database: '',
    debug: true,        // mysql库中提供的调试器
    debugger: true,     // dybatis中提供的调试器
  }, path.resolve(__dirname, './demo.xml'))

  console.log(db)
/*  let result = await db.selectMany('findUser')
  let index = result[result.length - 1].id
  console.log(result)

  result = await db.select('findUser', { id: '5' })
  console.log(result)

  db.insertOne('insertUser', { id: ++index, name: `${index}-name` })
  db.insertOne('insertUserSet', { id: ++index, name: `${index}-name` })*/
}

demo()
