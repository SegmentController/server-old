const { createCanvas } = require('canvas')

const { Grid } = require('./grid')
const { SurfaceGridItem } = require('./layoutGrids')
const LayoutSegmentSurface = require('./layoutSegmentSurface')
const LayoutSegmentTrack = require('./layoutSegmentTrack')
const LayoutSegmentTurnout = require('./layoutSegmentTurnout')
const LayoutSegmentSignal = require('./layoutSegmentSignal')
const LayoutSegmentButton = require('./layoutSegmentButton')
const LayoutSegmentAmbientLight = require('./layoutSegmentAmbientLight')
const LayoutSegmentSound = require('./layoutSegmentSound')

class LayoutSegment {
  id = 0
  name = ''
  baseColor = '#909090'
  x = 0
  y = 0

  surfaces = []
  tracks = []
  turnouts = []
  signals = []
  buttons = []
  ambientLights = []
  sounds = []

  constructor(x, y, color = '#999') {
    this.x = x
    this.y = y
    this.color = color
  }
  static generateRandom(size, mode) {
    if (size < 6) size = 6
    size = Math.round(size / 2) * 2

    const result = new LayoutSegment(0, 0)
    switch (mode) {
      case 0: { //river
        result.surfaces.push(
          new LayoutSegmentSurface(0, 0, 2, size, '#3050A0', 'River'),
          new LayoutSegmentSurface(1, size - 2, size - 1, 2, '#3050A0'),
        )
        break
      }
      case 1: { //conrfield
        result.surfaces.push(
          new LayoutSegmentSurface(0, 0, size / 2, size, '#A8A830', 'Cornfield'),
          new LayoutSegmentSurface(0, 0, size, 1, '#B8B840'),
          new LayoutSegmentSurface(size / 2 + 1, 2, 2, 2, '#10BB10', 'Flowers'),
        )
        result.tracks.push(
          new LayoutSegmentTrack(0, 1, 'hline'),
          new LayoutSegmentTrack(1, 1, 'hline'),
          new LayoutSegmentTrack(2, 1, 'hline'),
          new LayoutSegmentTrack(3, 1, 'hline'),
          new LayoutSegmentTrack(4, 1, 'hline'),
          new LayoutSegmentTrack(5, 1, 'tr90turn'),
          new LayoutSegmentTrack(5, 2, 'vline'),
          new LayoutSegmentTrack(5, 3, 'vline'),
          new LayoutSegmentTrack(5, 4, 'vline'),
          new LayoutSegmentTrack(5, 5, 'bl90turn'),
          new LayoutSegmentTrack(6, 5, 'hline'),
          new LayoutSegmentTrack(7, 5, 'hline'),
          new LayoutSegmentTrack(8, 5, 'hline'),
          new LayoutSegmentTrack(9, 5, 'hline'),
          new LayoutSegmentTrack(10, 5, 'hline'),
        )
        break
      }
      default: { //center
        result.surfaces.push(
          new LayoutSegmentSurface(2, 2, size / 2, size / 2, '#104010', 'Forest'),
        )
        break
      }
    }

    return result
  }
  static createDefault() {
    const result = new LayoutSegment(0, 0)
    result.surfaces.push(
      new LayoutSegmentSurface(0, 0, 4, 4, '#104010', 'New forest'),
    )
    return result
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  getSize() {
    const result = {
      width: 1,
      height: 1
    }
    for (const surface of this.surfaces) {
      if (result.width < surface.x + surface.width) result.width = surface.x + surface.width
      if (result.height < surface.y + surface.height) result.height = surface.y + surface.height
    }
    for (const track of this.tracks) {
      if (result.width < track.x + 1) result.width = track.x + 1
      if (result.height < track.y + 1) result.height = track.y + 1
    }
    for (const turnout of this.turnouts) {
      if (result.width < turnout.x + 1) result.width = turnout.x + 1
      if (result.height < turnout.y + 1) result.height = turnout.y + 1
    }
    for (const signal of this.signals) {
      if (result.width < signal.x + 1) result.width = signal.x + 1
      if (result.height < signal.y + 1) result.height = signal.y + 1
    }
    for (const button of this.buttons) {
      if (result.width < button.x + 1) result.width = button.x + 1
      if (result.height < button.y + 1) result.height = button.y + 1
    }
    for (const light of this.ambientLights) {
      if (result.width < light.x + 1) result.width = light.x + 1
      if (result.height < light.y + 1) result.height = light.y + 1
    }
    for (const sound of this.sounds) {
      if (result.width < sound.x + 1) result.width = sound.x + 1
      if (result.height < sound.y + 1) result.height = sound.y + 1
    }
    return result
  }
  getImageSize(layout) {
    const size = this.getSize()
    return {
      width: size.width * layout.blockSize,
      height: size.height * layout.blockSize
    }
  }
  getImage(layout) {
    const imageSize = this.getImageSize(layout)

    const canvas = createCanvas(imageSize.width, imageSize.height)
    const context2d = canvas.getContext('2d')
    this.draw(context2d, layout)

    return canvas.toBuffer('image/png', runtimeConfig.pngExport)
  }

  findTrack(x, y) {
    for (const track of this.tracks)
      if (track.x === x && track.y === y)
        return track
    return null
  }

  draw(context2d, layout) {
    const size = this.getSize()
    const bs = layout.blockSize

    context2d.fillStyle = this.baseColor
    context2d.fillRect(0, 0, size.width * bs, size.height * bs)

    const grids = Grid.generateGridsFrom(Grid, SurfaceGridItem, this.surfaces)
    for (const grid of grids)
      for (const item of grid.getItems())
        item.draw(context2d, layout, this, grid)
    for (const surface of this.surfaces)
      context2dTranslate(context2d, surface, bs, () => surface.drawText(context2d, layout))

    for (const track of this.tracks)
      context2dTranslate(context2d, track, bs, () => track.draw(context2d, layout))
    for (const turnout of this.turnouts)
      context2dTranslate(context2d, turnout, bs, () => turnout.draw(context2d, layout))

    for (const signal of this.signals)
      context2dTranslate(context2d, signal, bs, () => signal.draw(context2d, layout))

    for (const button of this.buttons)
      context2dTranslate(context2d, button, bs, () => button.draw(context2d, layout))
    for (const light of this.ambientLights)
      context2dTranslate(context2d, light, bs, () => light.draw(context2d, layout))
    for (const sound of this.sounds)
      context2dTranslate(context2d, sound, bs, () => sound.draw(context2d, layout))
  }

  setBaseColor(newcolor) {
    const normalizedcolor = global.normalizeRGBColor(newcolor)
    if (!normalizedcolor)
      throw new Error(`Invalid color: ${newcolor}`)
    this.baseColor = normalizedcolor
  }

  setElements(elements) {
    if (!elements) throw new Error('Empty elements data')

    this.surfaces = []
    this.tracks = []
    this.turnouts = []
    this.signals = []
    this.buttons = []
    this.ambientLights = []
    this.sounds = []

    for (const id in elements) {
      const element = elements[id]
      switch (element.class) {
        case 'track': {
          this.tracks.push(new LayoutSegmentTrack(element.x, element.y, element.type))
          break
        }
        case 'turnout': {
          this.turnouts.push(new LayoutSegmentTurnout(element.x, element.y, element.panel, element.index, element.type))
          break
        }
        case 'surface': {
          this.surfaces.push(new LayoutSegmentSurface(element.x, element.y, element.w, element.h, element.color, element.text))
          break
        }
        case 'signal': {
          this.signals.push(new LayoutSegmentSignal(element.x, element.y, element.panel, element.index, element.type, element.bulbs))
          break
        }
        case 'button': {
          this.buttons.push(new LayoutSegmentButton(element.x, element.y, element.name, element.color))
          break
        }
        case 'ambientLight': {
          this.ambientLights.push(new LayoutSegmentAmbientLight(element.x, element.y, element.panel, element.index))
          break
        }
        case 'sound': {
          this.sounds.push(new LayoutSegmentSound(element.x, element.y, element.index))
          break
        }
        default: {
          throw new Error(`Invalid element class: ${element.class}`)
        }
      }
    }
  }
}

module.exports = LayoutSegment
