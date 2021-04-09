// 标签解析类
export default class Element {
  static create (...props) {
    return Reflect.construct(this, props)
  }

  tags = {}

  constructor () {
  }

  resolveXmlJs (xmlObj, params, sqlMapper) {
  }

  installTags (tagList) {
    const tags = {}
    tagList.forEach(Tag => {
      const tag = Tag.create()
      Object.assign(tags, { [tag.name]: tag })
    })

    Object.assign(this.tags, tags)
  }
}
