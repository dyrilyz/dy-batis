// 标签处理类
export class Tag {
  static create(...props) {
    return Reflect.construct(this, props)
  }

  constructor() {
  }

  resolveXmlJs(xmlObj, params, sqlMapper) {
  }
}

export class TagIF extends Tag {

  name = 'if'

  constructor(props) {
    super(props)
  }

}

export class TagWHERE extends Tag {

  name = 'where'

  constructor(props) {
    super(props)
  }

}

// include 标签处理类
export class TagINCLUDE extends Tag {

  name = 'include'

  constructor(props) {
    super(props)
  }

  resolveXmlJs(xmlObj, params, sqlMapper) {
    if (!sqlMapper[xmlObj.attributes.ref]) throw Error(`找不到id为 ${xmlObj.attributes.ref} 的sql片段`)
    const list = sqlMapper[xmlObj.attributes.ref].elements
    return this.resolveAllInclude(list, sqlMapper)
  }

  resolveAllInclude(list, sqlMapper) {
    const els = [...list]
    const result = []

    while (els.length) {
      const el = els.shift()

      if (el.type === 'element' && el.name === 'include') {
        if (!sqlMapper[el.attributes.ref]) throw Error(`找不到id为 ${el.attributes.ref} 的sql片段`)

        const includeEls = this.resolveAllInclude(sqlMapper[el.attributes.ref].elements)
        includeEls.forEach(includeEl => result.push(includeEl))
      } else {
        result.push(el)
      }
    }

    return result
  }

}
