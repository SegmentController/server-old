const { createCanvas } = require('canvas')

const { LayoutSegmentBlockElement } = require('./layoutSegmentElement')

const TRACK_COLOR = '#404040'

class LayoutSegmentTrack extends LayoutSegmentBlockElement {
  type = ''

  static getTypeGroups() {
    return {
      hline: 'Horizontal',
      vline: 'Vertical',

      rskew: 'Right skew',
      lskew: 'Left skew',

      '90° turn': {
        br90turn: 'Bottom-right 90° turn',
        bl90turn: 'Bottom-left 90° turn',
        tl90turn: 'Top-left 90° turn',
        tr90turn: 'Top-right 90° turn',
      },

      '45° turn': {
        lt45turn: 'Left to top 45° turn',
        lb45turn: 'Left to bottom 45° turn',
        rt45turn: 'Right to top 45° turn',
        rb45turn: 'Right to bottom 45° turn',
        tl45turn: 'Top to left 45° turn',
        tr45turn: 'Top to right 45° turn',
        bl45turn: 'Bottom to left 45° turn',
        br45turn: 'Bottom to right 45° turn',
      },

      'Crossing': {
        hvcross: 'Horizontal + vertical',
        hlscross: 'Horizontal + left skew',
        hrscross: 'Horizontal + right skew',
        vlscross: 'Vertical + left skew',
        vrscross: 'Vertical + right skew',
        lsrscross: 'Left + right skew',
      },

      'Stop': {
        lstop: 'Left',
        rstop: 'Right',
        tstop: 'Top',
        bstop: 'Bottom',
      },

    }
  }

  static getTypes() {
    const groups = LayoutSegmentTrack.getTypeGroups()

    const result = {}
    for (const group in groups)
      if (global.isObject(groups[group]))
        for (const groupobj in groups[group])
          result[groupobj] = groups[group][groupobj]
      else
        result[group] = groups[group]
    return result
  }

  constructor(x, y, type) {
    super(x, y)
    this.setType(type)
  }

  setType(type) { if (type in LayoutSegmentTrack.getTypes()) this.type = type }

  draw(context2d, layout) {
    const bs = layout.blockSize

    const trackwidth = bs / 4
    const turn45straightlength = 0 + 0 //Math.round(bs / 6)
    const stopstraightlength = Math.round(bs * 3 / 4)
    const beziercorr = bs / 4

    context2d.fillStyle = TRACK_COLOR
    context2d.strokeStyle = TRACK_COLOR
    context2d.lineWidth = trackwidth
    context2d.beginPath()
    switch (this.type) {
      case 'hline':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)
        break
      case 'vline':
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)
        break

      case 'rskew':
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)
        break
      case 'lskew':
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)
        break

      case 'tl90turn':
        context2d.arc(bs, bs, bs / 2, Math.PI, 1.5 * Math.PI)
        break
      case 'tr90turn':
        context2d.arc(0, bs, bs / 2, 1.5 * Math.PI, 0)
        break
      case 'bl90turn':
        context2d.arc(bs, 0, bs / 2, 0.5 * Math.PI, Math.PI)
        break
      case 'br90turn':
        context2d.arc(0, 0, bs / 2, 0, 0.5 * Math.PI)
        break

      case 'lt45turn':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(turn45straightlength, bs / 2)
        context2d.bezierCurveTo(
          turn45straightlength + beziercorr, bs / 2,
          bs - beziercorr, beziercorr,
          bs, 0)
        break
      case 'lb45turn':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(turn45straightlength, bs / 2)
        context2d.bezierCurveTo(
          turn45straightlength + beziercorr, bs / 2,
          bs - beziercorr, bs - beziercorr,
          bs, bs)
        break
      case 'rt45turn':
        context2d.moveTo(bs, bs / 2)
        context2d.lineTo(bs - turn45straightlength, bs / 2)
        context2d.bezierCurveTo(
          bs - turn45straightlength - beziercorr, bs / 2,
          beziercorr, beziercorr,
          0, 0)
        break
      case 'rb45turn':
        context2d.moveTo(bs, bs / 2)
        context2d.lineTo(bs - turn45straightlength, bs / 2)
        context2d.bezierCurveTo(
          bs - turn45straightlength - beziercorr, bs / 2,
          beziercorr, bs - beziercorr,
          0, bs)
        break
      case 'tl45turn':
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, turn45straightlength)
        context2d.bezierCurveTo(
          bs / 2, turn45straightlength + beziercorr,
          beziercorr, bs - beziercorr,
          0, bs)
        break
      case 'tr45turn':
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, turn45straightlength)
        context2d.bezierCurveTo(
          bs / 2, turn45straightlength + beziercorr,
          bs - beziercorr, bs - beziercorr,
          bs, bs)
        break
      case 'bl45turn':
        context2d.moveTo(bs / 2, bs)
        context2d.lineTo(bs / 2, bs - turn45straightlength)
        context2d.bezierCurveTo(
          bs / 2, bs - turn45straightlength - beziercorr,
          beziercorr, beziercorr,
          0, 0)
        break
      case 'br45turn':
        context2d.moveTo(bs / 2, bs)
        context2d.lineTo(bs / 2, bs - turn45straightlength)
        context2d.bezierCurveTo(
          bs / 2, bs - turn45straightlength - beziercorr,
          bs - beziercorr, beziercorr,
          bs, 0)
        break

      case 'hvcross':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)
        break
      case 'hlscross':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)
        break
      case 'hrscross':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(bs, bs / 2)
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)
        break
      case 'vlscross':
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)
        break
      case 'vrscross':
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, bs)
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)
        break
      case 'lsrscross':
        context2d.moveTo(0, 0)
        context2d.lineTo(bs, bs)
        context2d.moveTo(0, bs)
        context2d.lineTo(bs, 0)
        break

      case 'lstop':
        context2d.moveTo(bs - stopstraightlength, bs / 2)
        context2d.lineTo(bs, bs / 2)
        context2d.moveTo(bs - stopstraightlength, bs / 4)
        context2d.lineTo(bs - stopstraightlength, bs - bs / 4)
        break
      case 'rstop':
        context2d.moveTo(0, bs / 2)
        context2d.lineTo(stopstraightlength, bs / 2)
        context2d.moveTo(stopstraightlength, bs / 4)
        context2d.lineTo(stopstraightlength, bs - bs / 4)
        break
      case 'tstop':
        context2d.moveTo(bs / 2, bs - stopstraightlength)
        context2d.lineTo(bs / 2, bs)
        context2d.moveTo(bs / 4, bs - stopstraightlength)
        context2d.lineTo(bs - bs / 4, bs - stopstraightlength)
        break
      case 'bstop':
        context2d.moveTo(bs / 2, 0)
        context2d.lineTo(bs / 2, stopstraightlength)
        context2d.moveTo(bs / 4, stopstraightlength)
        context2d.lineTo(bs - bs / 4, stopstraightlength)
        break

    }
    context2d.stroke()
  }
  getImage(layout) {
    const canvas = createCanvas(layout.blockSize, layout.blockSize)
    const context2d = canvas.getContext('2d')
    this.draw(context2d, layout)

    return canvas.toBuffer('image/png', runtimeConfig.pngExport)
  }
}

module.exports = LayoutSegmentTrack
