class TypeSerializer {
  classes = new Map()

  static isClass(c) { return typeof c === 'function' && /^\s*class\s+/.test(c.toString()) }
  static isObject(o) { return (!!o) && (o.constructor === Object) }

  registerClasses(...classes) {
    for (const cls of classes)
      if (Array.isArray(cls)) {
        for (const c of cls)
          this.registerClass(c)
      }
      else if (TypeSerializer.isObject(cls)) {
        for (const k in cls)
          this.registerClass(cls[k])
      }
      else
        this.registerClass(cls)
  }

  registerClass(cls) {
    if (TypeSerializer.isClass(cls))
      this.classes.set(cls.name, cls)
  }

  stringifyReplacer(key, value) {
    const constructorname = (value && typeof value === 'object') ? value.constructor.name : ''
    if (constructorname && this.classes.has(constructorname))
      return Object.assign({ '$type': constructorname }, value)
    return value
  }
  stringify(value, space) { return JSON.stringify(value, this.stringifyReplacer.bind(this), space) }

  parseReviver(key, value) {
    if (value && TypeSerializer.isObject(value) && value['$type']) {
      const typename = value['$type']
      if (this.classes.has(typename)) {
        const instance = Object.assign(new (this.classes.get(typename))(), value)
        delete instance['$type']
        return instance
      }
    }
    return value
  }
  parse(text) { return JSON.parse(text, this.parseReviver.bind(this)) }

}

module.exports = TypeSerializer
