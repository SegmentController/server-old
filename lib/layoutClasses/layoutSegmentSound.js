const { createCanvas } = require('canvas')

const { LayoutSegmentBlockElement } = require('./layoutSegmentElement')

const COLOR_BG_ON = '#222'
const COLOR_BORDER = '#444'

class LayoutSegmentSound extends LayoutSegmentBlockElement {
  index = -1

  constructor(x, y, index) {
    super(x, y)
    this.setIndex(index)
  }

  setIndex(index) { if (index >= 0 && index <= 5) this.index = index }

  getCurrentState(segmentid) {
    const sound = global.segments.AccessSegmentById(segmentid).sound
    if (!sound)
      return false
    return sound.playedFolder === this.index
  }

  draw(context2d, layout, state) {
    this
    //const bs = layout.blockSize

    context2d.beginPath()
    context2d.strokeStyle = COLOR_BORDER
    context2d.lineWidth = 1

    context2d.moveTo(5, 10)
    context2d.lineTo(10, 10)
    context2d.lineTo(15, 5)
    context2d.lineTo(15, 20)
    context2d.lineTo(10, 15)
    context2d.lineTo(5, 15)
    context2d.lineTo(5, 10)
    if (state) {
      context2d.fillStyle = COLOR_BG_ON
      context2d.fill()

      context2d.strokeStyle = COLOR_BG_ON
      for (let y = 6; y < 20; y += 4) {
        context2d.moveTo(18, y)
        context2d.lineTo(23, y + (y - 13) * 0.3)
      }
    }
    context2d.stroke()
  }

  getImage(layout, state) {
    const canvas = createCanvas(layout.blockSize, layout.blockSize)
    const context2d = canvas.getContext('2d')
    this.draw(context2d, layout, state)

    return canvas.toBuffer('image/png', runtimeConfig.pngExport)
  }
}

module.exports = LayoutSegmentSound
