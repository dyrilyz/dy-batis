import Element from './element'
import Item from './Item'

export default class Where extends Element {

  name = 'where'

  constructor (props) {
    super(props)
    this.installTags([Item])
  }

  resolveXmlJs (xmlObj, params, sqlMapper) {
    const result = this.resolveItem(xmlObj.elements, params, sqlMapper)

    if (result.length) {
      result.unshift({ type: 'text', text: 'where' })
    }

    return result
  }

  resolveItem (elements, params, sqlMapper) {
    const inner = []
    const result = []

    elements.forEach(el => {
      if (this.tags[el.name]) {
        const item = this.tags[el.name].resolveXmlJs(el, params, sqlMapper)

        if (item) {
          inner.push(item)
        }
      } else {
        inner.push(el)
      }
    })

    while (inner.length) {
      const el = inner.shift()
      if (el.name === 'item') {
        if (el.attributes.connector && result.length > 0) {
          result.push({ type: 'text', text: el.attributes.connector })
        }

        el.elements.forEach(item => result.push(item))
      } else {
        result.push(el)
      }
    }
    return result
  }

}
