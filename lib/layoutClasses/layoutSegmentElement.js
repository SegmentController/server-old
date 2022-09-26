const { customAlphabet } = require('nanoid')
const nanoGen = customAlphabet('1234567890abcdef', 8)

class LayoutSegmentBlockElement {
  id = nanoGen()
  x = 0
  y = 0
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class LayoutSegmentElement {
  id = nanoGen()
  x = 0
  y = 0
  width = 0
  height = 0
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

module.exports = { LayoutSegmentBlockElement, LayoutSegmentElement }
