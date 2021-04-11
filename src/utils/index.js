import fs from 'fs'
import convert from 'xml-js'

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

/**
 * xml解析为js
 * @param filepath
 * @param sqlMapper
 */
export function readMapper(filepath, sqlMapper) {
  const xml = fs.readFileSync(filepath)
  const obj = convert.xml2js(xml.toString(), xmlJsConf)
  const root = obj['elements'][0]
  const moduleName = root.attributes.module
  root.elements?.map?.(el => {
    const mapperKey = moduleName ? `${moduleName}.${el.attributes.id}` : el.attributes.id

    Object.assign(sqlMapper, { [mapperKey]: el })
  })
}

/**
 * xml-js对象解析为sql语句
 * @param xmlObj
 * @param params
 * @param sqlMapper
 * @returns {string}
 */
export function translateXmlJsToSQL(xmlObj, params, sqlMapper, tags) {
  const result = []
  const elList = xmlObj.elements

  function iteratorCallback(el) {
    if (el.type === 'element' && tags[el.name]) {
      const list = tags[el.name].resolveXmlJs(el, params, sqlMapper)
      list?.forEach(iteratorCallback)
    } else {
      result.push(el)
    }
  }

  elList.forEach(iteratorCallback)

  const resultEls = result.filter(item => item.type === 'element')

  if (resultEls.length) {
    throw Error(`${resultEls[0].name}标签未定义`)
  }

  return result.map(item => item.text).join(' ')
}

/**
 * 展开values数组
 * @param arr
 */
export function expandArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] instanceof Array) {
      arr.splice(i, 1, ...arr[i])
      expandArray(arr)
      break
    }
  }
}

export function getLog(debug) {
  return debug ? console.log : () => null
}
