const { LayoutSegmentElement } = require('./layoutSegmentElement')

class LayoutSegmentBuilding extends LayoutSegmentElement {
  color = '#888'
  text = ''
  constructor(x, y, width, height, color = '#888', text = '') {
    super(x, y, width, height)
    this.color = color
    this.text = text
  }
}

module.exports = LayoutSegmentBuilding
