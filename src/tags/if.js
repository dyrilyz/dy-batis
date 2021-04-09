import Element from './element'

export default class If extends Element {

  name = 'if'

  constructor (props) {
    super(props)
  }

  resolveXmlJs (xmlObj, params, sqlMapper) {

    if (typeof xmlObj.attributes.test === 'undefined') {
      throw Error('if 标签 test 属性没有定义！')
    }

    const flag = this.executeTest(xmlObj.attributes.test, params)

    return flag ? xmlObj.elements : []
  }

  executeTest (test, params) {

    const keys = Object.keys(params)

    let expression = keys.map(key => `const ${key}=params['${key}'];`).join('')

    expression += `return !!${test}`

    const func = new Function('params', expression)

    return func(params)
  }

}
