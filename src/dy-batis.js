const convert = require('xml-js')
const fs = require('fs')
const mysql = require('mysql')

class DyBatis {

    constructor(dbConfig, mapper) {
        this.__config = {}
        this.__tempConn = null
        this.__pool = null
        this.__allQuery = {}
        if (typeof dbConfig === 'object' && !(dbConfig instanceof Array)) {
            this.setDBConfig(dbConfig)
        }
        if ((mapper instanceof Array) || typeof mapper === 'string') {
            this.readMapper(mapper)
        }
    }

    setDBConfig(dbConfig = {}) {
        this.__config = dbConfig
        this.__pool = mysql.createPool(this.__config)
    }

    readMapper(mapper) {
        if (mapper) {
            if (typeof mapper === 'string') {
                this.__readMapper(mapper)
            } else if (mapper instanceof Array) {
                mapper.map(item => {
                    this.__readMapper(item)
                })
            }
        }
    }

    __readMapper(filepath) {
        const xmlJsConf = {
            compact: false,
            trim: true,
            instructionHasAttributes: true,
            alwaysArray: true,
            ignoreComment: true,
            ignoreCdata: true,
            ignoreDoctype: true,
        }
        const xml = fs.readFileSync(filepath)
        const obj = convert.xml2js(xml, xmlJsConf)
        obj['elements'][0].elements && obj['elements'][0].elements.map(__el => {
            Object.assign(this.__allQuery, {[__el.attributes.id]: __el})
        })
    }

    __createSQL(id, xmlObj, param) {
        let [args, fun, values, precompile, assert, sql] = ['', '', '', '', '', '']
        if (!xmlObj) {
            throw Error(`Cannot find this id:${id}`)
        }
        if (xmlObj.attributes['precompile'] === 'true') {
            return {
                precompile: xmlObj.elements[0].text,
                template: xmlObj.elements[0].text,
                values: param
            }
        }
        const __elContent = xmlObj.elements.map(__el => this.__getTextEl(__el, param))
        this.__checkLoop(__elContent)
        for (const __item of __elContent) {
            if (__item) {
                sql += ` ${__item.text.replace(/(\s+)?\n\s+/g, ' ')}`
            }
        }
        sql = sql.trim()
        const $args = sql.match(/\${(\d|[a-z]|\$|_|\.|\[|]|'|")+}/ig)
        if ($args) {
            args = $args ? $args.map(__name => __name.replace(/(^\${)|(}$)/g, '')) : []
            fun = new Function('param', `
                const {${args.toString()}} = param
                return [${args.toString()}]
            `)
            values = fun(param)
        }
        precompile = sql
        assert = sql
        for (const i in values) {
            if (values[i] instanceof Array) {
                precompile = precompile.replace(`\$\{${args[i]}\}`, values[i].map(v => '?').toString())
                assert = assert.replace(`\$\{${args[i]}\}`, values[i].toString())
            } else {
                precompile = precompile.replace(`\$\{${args[i]}\}`, '?')
                assert = assert.replace(`\$\{${args[i]}\}`, values[i])
            }
        }
        this.__checkLoop(values)
        return {precompile, sql, assert, values}
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
        return [...this.__allQuery[xmlObj.attributes.ref].elements]
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
            if (i > 0) {
                result[i].text = 'and ' + result[i].text
            }
        }
        flag && result.unshift({type: 'text', text: 'where'})
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
                _this.__pool.query(sql, args, (err, result, fields) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            }
        })
    }

    async select(id, param) {
        const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
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
        const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
        const result = await this.__query(sqlObj.precompile, sqlObj.values)
        if (result) {
            return result[0]
        }
    }

    async selectMany(id, param) {
        const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
        return await this.__query(sqlObj.precompile, sqlObj.values)
    }

    async insertOne(id, param) {
        const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
        return await this.__query(sqlObj.precompile, sqlObj.values)
    }

    async insertMany(id, params) {
        for (const param of params) {
            const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
            await this.__query(sqlObj.precompile, sqlObj.values)
        }
    }

    async update(id, param) {
        const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
        return await this.__query(sqlObj.precompile, sqlObj.values)
    }

    async delete(id, param) {
        const sqlObj = this.__createSQL(id, this.__allQuery[id], param)
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
                    _this.__pool.releaseConnection(_this.__tempConn)
                    _this.__tempConn = null
                    resolve()
                })
            })
        }

        return new Promise((resolve, reject) => {
            _this.__pool.getConnection((err, conn) => {
                if (err) reject(err)
                _this.__tempConn = conn
                _this.__tempConn.beginTransaction(err => {
                    if (err) reject(err)
                    resolve(commit)
                })
            })
        })
    }

    async getPool() {
        return this.__pool
    }

    async getConn() {
        return new Promise((resolve, reject) => {
            this.__pool.getConnection((err, conn) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(conn)
                }
            })
        })
    }
}

module.exports = DyBatis
