const { createCanvas } = require('canvas')
const canvas = createCanvas()

module.exports = {

  pngExport: {
    compressionLevel: 3,
    filters: canvas.PNG_FILTER_NONE,
  }

}