const Color = require('color')
const { createCanvas } = require('canvas')

const { LayoutSegmentElement } = require('./layoutSegmentElement')

class LayoutSegmentSurface extends LayoutSegmentElement {
  color = '#888'
  text = ''

  constructor(x, y, width, height, color = '#888', text = '') {
    super(x, y, width, height)
    this.color = color
    this.text = text
  }

  drawText(context2d, layout) {
    if (!this.text) return

    const bs = layout.blockSize
    const fontsize = Math.round(bs * 0.65)

    const textx = (this.width / 2) * bs
    const texty = (this.height / 2) * bs

    context2d.save()
    try {
      context2d.translate(textx, texty)
      context2d.fillStyle = Color(this.color).negate().lighten(0.66).hex()
      context2d.font = `${fontsize}px Sans`
      context2d.textAlign = 'center'
      context2d.textBaseline = 'middle'
      if (this.width < this.height)
        context2d.rotate(-90 * Math.PI / 180)
      context2d.fillText(this.text, 0, 0)
    }
    finally { context2d.restore() }
  }

  static getSquareImage(size, color) {
    const canvas = createCanvas(size, size)
    const context2d = canvas.getContext('2d')

    context2d.fillStyle = String(color)
    context2d.fillRect(0, 0, size, size)

    return canvas.toBuffer('image/png', runtimeConfig.pngExport)
  }
}

module.exports = LayoutSegmentSurface
