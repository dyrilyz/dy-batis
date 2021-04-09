import Where from './where'


// 避免与es6中的Set类型重名

export default class SetTag extends Where {

  name = 'set'

  constructor (props) {
    super(props)

  }

  resolveXmlJs (xmlObj, params, sqlMapper) {
    const result = this.resolveItem(xmlObj.elements, params, sqlMapper)

    if (result.length) {
      result.unshift({ type: 'text', text: 'set' })
    }

    return result
  }

}
