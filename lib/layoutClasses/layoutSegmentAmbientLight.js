const { createCanvas } = require('canvas')

const { LayoutSegmentBlockElement } = require('./layoutSegmentElement')

const MARGIN = 6
const COLOR_BG_ON = '#FF4'
const COLOR_BG_OFF = '#000'
const COLOR_BORDER = '#888'

class LayoutSegmentAmbientLight extends LayoutSegmentBlockElement {
  panel = -1
  index = -1

  constructor(x, y, panel, index) {
    super(x, y)
    this.setPanel(panel)
    this.setIndex(index)
  }

  setPanel(panel) { if (panel >= 0 && panel <= 3) this.panel = panel }
  setIndex(index) { if (index >= 0 && index <= 9) this.index = index }

  getCurrentState(segmentid) {
    const light = global.segments.AccessSegmentById(segmentid).getAmbientLight(this.panel + 1)
    if (!light)
      return null
    switch (this.index) {
      case 0: {
        return light.nightState
      }
      case 7:
      case 8: {
        return light.effects[this.index - 7] > 0
      }
      default: {
        return light.lightStates[this.index - 1]
      }
    }
  }

  draw(context2d, layout, state) {
    this
    const bs = layout.blockSize

    context2d.beginPath()
    context2d.strokeStyle = COLOR_BORDER
    context2d.lineWidth = 1
    context2d.arc(bs / 2, bs / 2, bs / 2 - MARGIN, 0, 2 * Math.PI, false)
    context2d.fillStyle = state ? COLOR_BG_ON : COLOR_BG_OFF
    context2d.fill()
    context2d.stroke()
  }

  getImage(layout, state) {
    const canvas = createCanvas(layout.blockSize, layout.blockSize)
    const context2d = canvas.getContext('2d')
    this.draw(context2d, layout, state)

    return canvas.toBuffer('image/png', runtimeConfig.pngExport)
  }
}

module.exports = LayoutSegmentAmbientLight
