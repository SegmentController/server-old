const { createCanvas } = require('canvas')

const { LayoutSegmentBlockElement } = require('./layoutSegmentElement')

const TRACK_COLOR = '#404040'
const TRACK_GREEN_COLOR = '#20A020'
const TRACK_ORANGE_COLOR = '#FF8C00'

class LayoutSegmentTurnout extends LayoutSegmentBlockElement {
  panel = -1
  index = -1
  type = ''

  static getTypeGroups() {
    return {

      ltturnout: 'Horizontal left to top',
      lbturnout: 'Horizontal left to bottom',
      rtturnout: 'Horizontal right to top',
      rbturnout: 'Horizontal right to bottom',

      tlturnout: 'Vertical top to left',
      trturnout: 'Vertical top to right',
      blturnout: 'Vertical bottom to left',
      brturnout: 'Vertical bottom to right',

      'Skew': {
        slbrturnout: 'Left skew from bottom to right',
        slblturnout: 'Left skew from bottom to left',
        sltrturnout: 'Left skew from top to right',
        sltlturnout: 'Left skew from top to left',
        srbrturnout: 'Right skew from bottom to right',
        srblturnout: 'Right skew from bottom to left',
        srtrturnout: 'Right skew from top to right',
        srtlturnout: 'Right skew from top to left',
      },

    }
  }

  static getTypes() {
    const groups = LayoutSegmentTurnout.getTypeGroups()

    const result = {}
    for (const group in groups)
      if (global.isObject(groups[group]))
        for (const groupobj in groups[group])
          result[groupobj] = groups[group][groupobj]
      else
        result[group] = groups[group]
    return result
  }

  constructor(x, y, panel, index, type) {
    super(x, y)
    this.setPanel(panel)
    this.setIndex(index)
    this.setType(type)
  }

  setPanel(panel) { if (panel >= 0 && panel <= 3) this.panel = panel }
  setIndex(index) { if (index >= 0 && index <= 5) this.index = index }

  setType(type) { if (type in LayoutSegmentTurnout.getTypes()) this.type = type }

  getCurrentState(segmentid) {
    const turnout = global.segments.AccessSegmentById(segmentid).getTurnout(this.panel + 1)
    if (!turnout)
      return null
    return turnout.turnoutStates[this.index]
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  draw(context2d, layout, state) {
    const bs = layout.blockSize

    const trackwidth = bs / 4
    const turn45straightlength = 0 + 0 //Math.round(bs / 6)
    const beziercorr = bs / 4

    const drawStateOverlay = (state) => {
      this
      context2d.stroke()
      context2d.fillStyle = context2d.strokeStyle = state ? TRACK_ORANGE_COLOR : TRACK_GREEN_COLOR
      context2d.lineWidth = trackwidth - 4
      context2d.beginPath()
    }

    context2d.fillStyle = context2d.strokeStyle = TRACK_COLOR
    context2d.lineWidth = trackwidth
    context2d.beginPath()
    switch (this.type) {
      case 'ltturnout': {
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)

        context2d.moveTo(0, bs / 2)
        context2d.lineTo(turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          turn45straightlength + beziercorr, bs / 2,
          bs - beziercorr, beziercorr,
          bs, 0)

        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            turn45straightlength + beziercorr, bs / 2,
            bs - beziercorr, beziercorr,
            bs, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(bs, bs / 2)

          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)
        }
        break
      }
      case 'lbturnout': {
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)

        context2d.moveTo(0, bs / 2)
        context2d.lineTo(turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          turn45straightlength + beziercorr, bs / 2,
          bs - beziercorr, bs - beziercorr,
          bs, bs)

        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            turn45straightlength + beziercorr, bs / 2,
            bs - beziercorr, bs - beziercorr,
            bs, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(bs, bs / 2)

          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)
        }
        break
      }
      case 'rtturnout': {
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)

        context2d.moveTo(bs, bs / 2)
        context2d.lineTo(bs - turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          bs - turn45straightlength - beziercorr, bs / 2,
          beziercorr, beziercorr,
          0, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            bs - turn45straightlength - beziercorr, bs / 2,
            beziercorr, beziercorr,
            0, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(bs, bs / 2)

          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)
        }
        break
      }
      case 'rbturnout': {
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)

        context2d.moveTo(bs, bs / 2)
        context2d.lineTo(bs - turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          bs - turn45straightlength - beziercorr, bs / 2,
          beziercorr, bs - beziercorr,
          0, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            bs - turn45straightlength - beziercorr, bs / 2,
            beziercorr, bs - beziercorr,
            0, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(bs, bs / 2)

          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)
        }
        break
      }
      case 'tlturnout': {
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)

        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, turn45straightlength + beziercorr,
          beziercorr, bs - beziercorr,
          0, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, turn45straightlength + beziercorr,
            beziercorr, bs - beziercorr,
            0, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, bs)

          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)
        }
        break
      }
      case 'trturnout': {
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)

        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, turn45straightlength + beziercorr,
          bs - beziercorr, bs - beziercorr,
          bs, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, turn45straightlength + beziercorr,
            bs - beziercorr, bs - beziercorr,
            bs, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, bs)

          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)
        }
        break
      }
      case 'blturnout': {
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)

        context2d.moveTo(bs / 2, bs)
        context2d.lineTo(bs / 2, bs - turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, bs - turn45straightlength - beziercorr,
          beziercorr, beziercorr,
          0, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, bs - turn45straightlength - beziercorr,
            beziercorr, beziercorr,
            0, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, bs)

          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)
        }
        break
      }
      case 'brturnout': {
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)

        context2d.moveTo(bs / 2, bs)
        context2d.lineTo(bs / 2, bs - turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, bs - turn45straightlength - beziercorr,
          bs - beziercorr, beziercorr,
          bs, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, bs - turn45straightlength - beziercorr,
            bs - beziercorr, beziercorr,
            bs, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, bs)

          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)
        }
        break
      }

      case 'slbrturnout': {
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)

        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, turn45straightlength + beziercorr,
          bs - beziercorr, bs - beziercorr,
          bs, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, turn45straightlength + beziercorr,
            bs - beziercorr, bs - beziercorr,
            bs, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, 0)
          context2d.lineTo(bs, bs)

          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)
        }
        break
      }
      case 'slblturnout': {
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)

        context2d.moveTo(0, bs / 2)
        context2d.lineTo(turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          turn45straightlength + beziercorr, bs / 2,
          bs - beziercorr, bs - beziercorr,
          bs, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            turn45straightlength + beziercorr, bs / 2,
            bs - beziercorr, bs - beziercorr,
            bs, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, 0)
          context2d.lineTo(bs, bs)

          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)
        }
        break
      }
      case 'sltrturnout': {
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)

        context2d.moveTo(bs / 2, bs)
        context2d.lineTo(bs / 2, bs - turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, bs - turn45straightlength - beziercorr,
          beziercorr, beziercorr,
          0, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, bs - turn45straightlength - beziercorr,
            beziercorr, beziercorr,
            0, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, 0)
          context2d.lineTo(bs, bs)

          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)
        }
        break
      }
      case 'sltlturnout': {
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)

        context2d.moveTo(bs, bs / 2)
        context2d.lineTo(bs - turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          bs - turn45straightlength - beziercorr, bs / 2,
          beziercorr, beziercorr,
          0, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            bs - turn45straightlength - beziercorr, bs / 2,
            beziercorr, beziercorr,
            0, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, 0)
          context2d.lineTo(bs, bs)

          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)
        }
        break
      }
      case 'srbrturnout': {
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)

        context2d.moveTo(bs, bs / 2)
        context2d.lineTo(bs - turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          bs - turn45straightlength - beziercorr, bs / 2,
          beziercorr, bs - beziercorr,
          0, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            bs - turn45straightlength - beziercorr, bs / 2,
            beziercorr, bs - beziercorr,
            0, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs)
          context2d.lineTo(bs, 0)

          context2d.moveTo(bs, bs / 2)
          context2d.lineTo(bs - turn45straightlength, bs / 2)
        }
        break
      }
      case 'srblturnout': {
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)

        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, turn45straightlength + beziercorr,
          beziercorr, bs - beziercorr,
          0, bs)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, turn45straightlength + beziercorr,
            beziercorr, bs - beziercorr,
            0, bs)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs)
          context2d.lineTo(bs, 0)

          context2d.moveTo(bs / 2, 0)
          context2d.lineTo(bs / 2, turn45straightlength)
        }
        break
      }
      case 'srtrturnout': {
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)

        context2d.moveTo(0, bs / 2)
        context2d.lineTo(turn45straightlength, bs / 2)

        context2d.bezierCurveTo(
          turn45straightlength + beziercorr, bs / 2,
          bs - beziercorr, beziercorr,
          bs, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)

          context2d.bezierCurveTo(
            turn45straightlength + beziercorr, bs / 2,
            bs - beziercorr, beziercorr,
            bs, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs)
          context2d.lineTo(bs, 0)

          context2d.moveTo(0, bs / 2)
          context2d.lineTo(turn45straightlength, bs / 2)
        }
        break
      }
      case 'srtlturnout': {
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)

        context2d.moveTo(bs / 2, bs)
        context2d.lineTo(bs / 2, bs - turn45straightlength)

        context2d.bezierCurveTo(
          bs / 2, bs - turn45straightlength - beziercorr,
          bs - beziercorr, beziercorr,
          bs, 0)
        if (state) {
          drawStateOverlay(state)
          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)

          context2d.bezierCurveTo(
            bs / 2, bs - turn45straightlength - beziercorr,
            bs - beziercorr, beziercorr,
            bs, 0)
        }
        else if (state !== undefined && !state) {
          drawStateOverlay(state)
          context2d.moveTo(0, bs)
          context2d.lineTo(bs, 0)

          context2d.moveTo(bs / 2, bs)
          context2d.lineTo(bs / 2, bs - turn45straightlength)
        }
        break
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

module.exports = LayoutSegmentTurnout
