import mysql from 'mysql'
import Tags from './tags'
import { getLog, readMapper } from './utils'
import CompileSql from './utils/compile-sql'

// 自定义sql对象
const sqlMapper = {}

let pool = null

/**
 * 提交事物
 * 调用后提交事物
 * @returns {Promise}
 */
function commit() {
  return new Promise((resolve, reject) => {
    this.transactionConn.commit(err => {
      if (err) {
        this.transactionConn.rollback(() => {
          reject(err)
        })
      }
      pool.releaseConnection(this.transactionConn)
      this.transactionConn = null
      resolve()
    })
  })
}

async function commonExecute(id, params) {
  const log = getLog(this.debugger)
  const sqlObj = new CompileSql(id, sqlMapper[id], params, sqlMapper, this.tags)
  log(sqlObj)
  return await this.execute(sqlObj.precompile, sqlObj.values)
}

export default class DyBatis {

  /**
   * 标签解析器
   * @type {{}}
   */
  tags = {}

  debugger = false

  /**
   * 事物连接
   * 开启事物后，会为其赋值，结束事物后会置空
   * @type {null}
   */
  transactionConn = null

  constructor(dbConfig, mapper) {

    this.installTags(Tags)

    if (typeof dbConfig === 'object' && !(dbConfig instanceof Array)) {
      this.setDBConfig(dbConfig)
    }

    if ((mapper instanceof Array) || typeof mapper === 'string') {
      this.readMapper(mapper)
    }
  }

  setDBConfig(dbConfig = {}) {
    pool = mysql.createPool(dbConfig)
    this.debugger = dbConfig.debugger
  }

  readMapper(mapper) {
    if (mapper) {
      if (typeof mapper === 'string') {
        readMapper(mapper, sqlMapper)
      } else if (mapper instanceof Array) {
        mapper.map(item => readMapper(item, sqlMapper))
      }
    }
  }

  // 安装标签解析器
  installTags(tagList) {
    const tags = {}
    tagList.forEach(Tag => {
      const tag = Tag.create()
      Object.assign(tags, { [tag.name]: tag })
    })

    Object.assign(this.tags, tags)
  }

  async execute(sql, args = []) {
    return new Promise((resolve, reject) => {
      if (this.transactionConn) {
        this.transactionConn['query'](sql, args, (err, result) => {
          if (err) {
            this.transactionConn['rollback'](() => {
              reject(err)
            })
          } else {
            resolve(result)
          }
        })
      } else {
        pool.query(sql, args, (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      }
    })
  }

  async select(id, params) {
    const result = await commonExecute.call(this, id, params)
    if (result) {
      if (result.length === 1) {
        return result[0]
      } else {
        return result
      }
    }
  }

  async selectOne(id, params) {
    const result = await commonExecute.call(this, id, params)
    if (result) {
      return result[0]
    }
  }

  selectMany(id, params) {
    return commonExecute.call(this, id, params)
  }

  insertOne(id, params) {
    return commonExecute.call(this, id, params)
  }

  // todo 需要从sql语句层面优化。或将废弃，提供 for 标签解析器来构建语句
  async insertMany(id, params) {
    for (const param of params) {
      const sqlObj = new CompileSql(id, sqlMapper[id], param, sqlMapper, this.tags)
      await this.execute(sqlObj.precompile, sqlObj.values)
    }
  }

  update(id, params) {
    return commonExecute.call(this, id, params)
  }

  delete(id, params) {
    return commonExecute.call(this, id, params)
  }

  async transaction() {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) reject(err)
        this.transactionConn = conn
        conn.beginTransaction(err => {
          if (err) reject(err)
          resolve(commit.bind(this))
        })
      })
    })
  }

  getPool() {
    return Promise.resolve(pool)
  }

  getConn() {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) {
          reject(err)
        } else {
          resolve(conn)
        }
      })
    })
  }
}
