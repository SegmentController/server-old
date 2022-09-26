global.isObject = (o) => (!!o) && (o.constructor === Object)

global.getRandomInt = (max) => Math.floor(Math.random() * max)

global.rgb2hex = (rgb, usehashmark) => (usehashmark ? '#' : '') + `${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => Number.parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

global.context2dTranslate = function (context2d, positioner, bs, callback) {
  context2d.save()
  try {
    if ('x' in positioner && 'y' in positioner)
      context2d.translate(positioner.x * bs, positioner.y * bs)
    if (callback) callback()
  }
  finally {
    context2d.restore()
  }
}

JSON.tryParse = function (string, reviver) {
  try { return JSON.parse(string, reviver) }
  catch { return null }
}

JSON.empty = {}

global.normalizeRGBColor = (colorstring) => {
  try { return require('color')(colorstring).hex() }
  catch { return null }
}

global.name2codename = (name) => [...(name || '').toLowerCase()].filter(c => 'abcdefghijklmnopqrstuvwxyz'.includes(c)).join('')
