// include 标签处理类
import Element from './element'

export default class Include extends Element {

  name = 'include'

  constructor (props) {
    super(props)
  }

  resolveXmlJs (xmlObj, params, sqlMapper) {
    if (!sqlMapper[xmlObj.attributes.ref]) {
      throw Error(`找不到id为 ${xmlObj.attributes.ref} 的sql片段`)
    }

    return sqlMapper[xmlObj.attributes.ref].elements
  }


}
