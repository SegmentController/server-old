const { createCanvas } = require('canvas')

const { LayoutSegmentBlockElement } = require('./layoutSegmentElement')

const MARGIN = 4
const COLOR_BORDER = '#444'

class LayoutSegmentButton extends LayoutSegmentBlockElement {
  name = ''
  color = '#888'

  constructor(x, y, name = '', color = '#888') {
    super(x, y)
    this.name = name
    this.color = color
  }

  draw(context2d, layout) {
    this
    const bs = layout.blockSize

    context2d.beginPath()
    context2d.fillStyle = this.color
    context2d.strokeStyle = COLOR_BORDER
    context2d.lineWidth = 1
    context2d.fillRect(MARGIN, MARGIN, bs - 2 * MARGIN, bs - 2 * MARGIN)
    context2d.moveTo(MARGIN, MARGIN)
    context2d.lineTo(bs - MARGIN, MARGIN)
    context2d.lineTo(bs - MARGIN, bs - MARGIN)
    context2d.lineTo(MARGIN, bs - MARGIN)
    context2d.lineTo(MARGIN, MARGIN)
    context2d.stroke()
  }

  getImage(layout) {
    const canvas = createCanvas(layout.blockSize, layout.blockSize)
    const context2d = canvas.getContext('2d')
    this.draw(context2d, layout)

    return canvas.toBuffer('image/png', runtimeConfig.pngExport)
  }
}

module.exports = LayoutSegmentButton
