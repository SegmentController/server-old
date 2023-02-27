const { makeid } = require('../makeId')

class LayoutSegmentBlockElement {
  id = makeid(8, '1234567890abcdef')
  x = 0
  y = 0
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class LayoutSegmentElement {
  id = makeid(8, '1234567890abcdef')
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
