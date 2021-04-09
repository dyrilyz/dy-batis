import If from './if'

export default class Item extends If {

  name = 'item'

  constructor () {
    super()
  }

  resolveXmlJs (xmlObj, params, sqlMapper) {
    const elements = super.resolveXmlJs(xmlObj, params, sqlMapper)
    const result = Object.assign({}, xmlObj, { elements })

    return elements.length > 0 ? result : null
  }

}
