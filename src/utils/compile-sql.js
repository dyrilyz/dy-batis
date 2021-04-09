import { expandArray, translateXmlJsToSQL } from './index'

export default class CompileSql {
  precompile = ''
  sql = ''
  assert = ''
  values = []

  constructor(id, xmlObj, params, sqlMapper, tags) {
    if (!xmlObj) {
      throw Error(`找不到id:${id}`)
    }

    // 如果是预编译语句，则不做任何处理
    if (xmlObj.attributes['precompile'] === 'true') {
      this.precompile = xmlObj.elements[0].text
      this.values = params
    } else {

      // sql的参数名数组
      let args = []
      let values = []
      let sql, precompile, assert

      precompile = assert = sql = translateXmlJsToSQL(xmlObj, params, sqlMapper, tags)

      // 匹配出带$的模板参数名
      const $args = sql.match(/\${(\d|[a-z]|\$|_|\.|\[|]|'|")+}/ig)

      // 通过模板参数获得排列后的参数值
      if ($args) {
        args = $args ? $args.map(__name => __name.replace(/(^\${)|(}$)/g, '')) : []
        values = args.map(key => params[key])
      }

      for (const i in values) {
        // 判断数组是可以使 IN 操作更加便捷
        if (values[i] instanceof Array) {
          precompile = precompile.replace(`\$\{${args[i]}\}`, values[i].map(() => '?').join(', '))
          assert = assert.replace(`\$\{${args[i]}\}`, values[i].join(', '))
        } else {
          precompile = precompile.replace(`\$\{${args[i]}\}`, '?')
          assert = assert.replace(`\$\{${args[i]}\}`, values[i])
        }
      }

      // 当出现 IN 操作时，预编译的传入值（数组）需要展开
      expandArray(values)

      this.precompile = precompile
      this.sql = sql
      this.assert = assert
      this.values = values
    }

  }
}
