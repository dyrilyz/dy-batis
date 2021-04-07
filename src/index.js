import fs from 'fs'
import convert from 'xml-js'
import mysql from 'mysql'
import { TagIF, TagINCLUDE, TagWHERE } from './tags'

// xml-js 配置
const xmlJsConf = {
  compact: false,
  trim: true,
  instructionHasAttributes: true,
  alwaysArray: true,
  ignoreComment: true,
  ignoreCdata: true,
  ignoreDoctype: true,
}

// 自定义sql对象
const sqlMapper = {}

let databaseConfig = {}

let pool = null

function readMapper(filepath) {
  const xml = fs.readFileSync(filepath)
  const obj = convert.xml2js(xml, xmlJsConf)
  obj['elements'][0].elements?.map?.(el => {
    Object.assign(sqlMapper, { [el.attributes.id]: el })
  })
}

class SQLTemplate {
  constructor() {
  }
}

export default class DyBatis {

  tags = []

  debugger = false

  __tempConn = null

  constructor(dbConfig, mapper) {
    pool = null
    if (typeof dbConfig === 'object' && !(dbConfig instanceof Array)) {
      this.setDBConfig(dbConfig)
    }
    if ((mapper instanceof Array) || typeof mapper === 'string') {
      this.readMapper(mapper)
    }
  }

  setDBConfig(dbConfig = {}) {
    databaseConfig = dbConfig
    pool = mysql.createPool(databaseConfig)
    this.debugger = dbConfig.debugger
  }

  readMapper(mapper) {
    if (mapper) {
      if (typeof mapper === 'string') {
        readMapper(mapper)
      } else if (mapper instanceof Array) {
        mapper.map(item => readMapper(item))
      }
    }
  }

  __createSQL(id, xmlObj, param) {
    // sql的参数名数组
    let args = ''
    let fun = ''
    let values = ''
    let precompile = ''
    let assert = ''
    let sql = ''

    if (!xmlObj) {
      throw Error(`找不到id:${id}`)
    }

    const xmlObjCp = JSON.parse(JSON.stringify(xmlObj))
    if (xmlObjCp.attributes['precompile'] === 'true') {
      return {
        precompile: xmlObjCp.elements[0].text,
        template: xmlObjCp.elements[0].text,
        values: param,
      }
    }
    const __elContent = xmlObjCp.elements.map(__el => this.__getTextEl(__el, param))
    this.__checkLoop(__elContent)
    for (const __item of __elContent) {
      if (__item) {
        sql += ` ${__item.text.replace(/(\s+)?\n\s+/g, ' ')}`
      }
    }
    sql = sql.trim()

    // 匹配出带$的模板参数
    const $args = sql.match(/\${(\d|[a-z]|\$|_|\.|\[|]|'|")+}/ig)

    if ($args) {
      args = $args ? $args.map(__name => __name.replace(/(^\${)|(}$)/g, '')) : []
      values = args.map(key => param[key])
    }

    precompile = assert = sql

    for (const i in values) {
      if (values[i] instanceof Array) {
        precompile = precompile.replace(`\$\{${args[i]}\}`, values[i].map(v => '?').join(', '))
        assert = assert.replace(`\$\{${args[i]}\}`, values[i].join(', '))
      } else {
        precompile = precompile.replace(`\$\{${args[i]}\}`, '?')
        assert = assert.replace(`\$\{${args[i]}\}`, values[i])
      }
    }
    this.__checkLoop(values)

    !!this.debugger && console.log({ precompile, sql, assert, values })

    return { precompile, sql, assert, values }
  }

  __getTextEl(xmlObj, param) {
    let sql = []
    switch (xmlObj.type) {
      case 'text':
        sql.push(xmlObj)
        break
      case 'element':
        sql.push(...this['__' + xmlObj.name](xmlObj, param))
        break
    }
    sql.map((__item, __index) => {
      if (__item.type === 'element') {
        sql.splice(__index, 1, [...this.__getTextEl(__item, param)])
      }
    })
    return sql
  }

  __checkLoop(arr) {
    for (const i in arr) {
      if (arr[i] instanceof Array) {
        arr.splice(i, 1, ...arr[i])
        this.__checkLoop(arr)
        break
      }
    }
  }

  __include(xmlObj) {
    return [...sqlMapper[xmlObj.attributes.ref].elements]
  }

  __where(xmlObj, param) {
    const result = []
    let flag = false
    for (const i in xmlObj.elements) {
      const o = this.__if(xmlObj.elements[i], param)
      if (o) {
        flag = true
        result.push(...o)
      }
    }
    for (const i in result) {
      // if (i > 0 && !/^and\s/.test(result[i].text)) {
      if (i > 0) {
        result[i].text = 'and ' + result[i].text
      }
    }
    flag && result.unshift({ type: 'text', text: 'where' })
    return result
  }

  __if(xmlObj, param) {
    let [__keys, __funBody, __fun] = ['', '', '']
    if (param) {
      __keys = Object.keys(param)
      __funBody = `const {${__keys.toString()}} = param;`
      __fun = `new Function('param', \`${__funBody}return ${xmlObj.attributes.test};\`)(param)`
    }
    try {
      const flag = __fun ? eval(__fun) : false
      if (flag) {
        return xmlObj.elements
      } else {
        return ''
      }
    } catch (e) {
      return ''
    }
  }

  async __query(sql, args = []) {
    const _this = this
    return new Promise((resolve, reject) => {
      if (_this.__tempConn) {
        _this.__tempConn.query(sql, args, (err, result, fields) => {
          if (err) {
            _this.__tempConn.rollback(() => {
              reject(err)
            })
          }
          resolve(result)
        })
      } else {
        pool.query(sql, args, (err, result, fields) => {
          if (err) {
            reject(err)
          }
          resolve(result)
        })
      }
    })
  }

  async select(id, param) {
    const sqlObj = this.__createSQL(id, sqlMapper[id], param)
    const result = await this.__query(sqlObj.precompile, sqlObj.values)
    if (result) {
      if (result.length === 1) {
        return result[0]
      } else {
        return result
      }
    }
  }

  async selectOne(id, param) {
    const sqlObj = this.__createSQL(id, sqlMapper[id], param)
    const result = await this.__query(sqlObj.precompile, sqlObj.values)
    if (result) {
      return result[0]
    }
  }

  async selectMany(id, param) {
    const sqlObj = this.__createSQL(id, sqlMapper[id], param)
    return await this.__query(sqlObj.precompile, sqlObj.values)
  }

  async insertOne(id, param) {
    const sqlObj = this.__createSQL(id, sqlMapper[id], param)
    return await this.__query(sqlObj.precompile, sqlObj.values)
  }

  async insertMany(id, params) {
    for (const param of params) {
      const sqlObj = this.__createSQL(id, sqlMapper[id], param)
      await this.__query(sqlObj.precompile, sqlObj.values)
    }
  }

  async update(id, param) {
    const sqlObj = this.__createSQL(id, sqlMapper[id], param)
    return await this.__query(sqlObj.precompile, sqlObj.values)
  }

  async delete(id, param) {
    const sqlObj = this.__createSQL(id, sqlMapper[id], param)
    return await this.__query(sqlObj.precompile, sqlObj.values)
  }

  async transaction() {
    const _this = this

    function commit() {
      return new Promise((resolve, reject) => {
        _this.__tempConn.commit(err => {
          if (err) {
            _this.__tempConn.rollback(() => {
              reject(err)
            })
          }
          pool.releaseConnection(_this.__tempConn)
          _this.__tempConn = null
          resolve()
        })
      })
    }

    return new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) reject(err)
        _this.__tempConn = conn
        _this.__tempConn.beginTransaction(err => {
          if (err) reject(err)
          resolve(commit)
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
