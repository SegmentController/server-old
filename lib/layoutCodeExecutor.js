const vm = require('node:vm')
const { inspect } = require('node:util')
const { EOL } = require('node:os')

const ErrorStackParser = require('error-stack-parser')

class LayoutCodeExecutor {
  // static ParseJsCode(jscode) {
  //   const devices = []
  //   for (const device of global.runningContext.GetDevices()) {
  //     if (jscode.includes(device.name)) {
  //       if (!devices.includes(device.name)) devices.push(device.name)
  //     }
  //   }
  //   devices.sort()

  //   const keywords = []
  //   for (const keyword of [
  //     'atEveryMinute(', 'atEveryHour(',
  //     'createInterval(', 'clearInterval(', 'createTimeout(', 'clearTimeout(',
  //     'now.', 'dawn.', 'sunrise.', 'sunset.', 'dusk.',
  //     'OnceADay('
  //   ]) {
  //     if (jscode.includes(keyword)) {
  //       const kw = keyword.replace(/[(.]/g, '')
  //       if (!keywords.includes(kw)) keywords.push(kw)
  //     }
  //   }

  //   return { devices: devices, keywords: keywords }
  // }

  _timers = []
  _intervals = []

  name = ''
  jscode = ''
  lasterror = ''
  constructor(name, jscode) {
    this.name = name
    this.jscode = jscode
  }

  CreateCountdown(timeout, callback) {
    if (timeout < 100) return 0

    const id = setTimeout(callback, timeout)
    this._timers.push(id)

    return id
  }

  RemoveCountdown(id) {
    this
    clearTimeout(id)
  }

  CreateTimer(timeout, callback) {
    if (timeout < 100) return

    const id = setInterval(callback, timeout)
    this._intervals.push(id)
  }

  RemoveTimer(id) {
    this
    clearInterval(id)
  }

  Random(a, b) {
    this
    if (b)
      return Math.random() * (b - a) + a
    return Math.random() * a
  }
  RandomInt(a, b) { return Math.floor(this.Random(a, b)) }

  Log(message) { this; logger.info(`[Code log] ${inspect(message, false, null)}`) }

  GetLastError() { return this.lasterror }

  DispatchRuntimeError(error) {
    let errorline = ''
    const stacks = ErrorStackParser.parse(error)
    if (stacks.length > 0) {
      errorline = `${stacks[0].fileName}:${stacks[0].lineNumber}:${stacks[0].columnNumber}`
      if (stacks[0].fileName === `${this.name}.code`) {
        this.lasterror = `Exception: ${error.message} ${errorline}`
        this.Stop()
        logger.error(`[Code] exception: ${error.message} ${errorline}`)
        ws.broadcast({ title: 'Exception', message: `${error.message} ${errorline}` }, 'code-run-error')
        return true
      }
    }
    return false
  }

  disableNightLightSync() { this; global.segments.SetSyncNightLight(false) }

  Run() {
    const contextvars = new class BaseContext { }

    contextvars.log = this.Log.bind(this)
    contextvars.disableNightLightSync = this.disableNightLightSync.bind(this)
    contextvars.random = this.Random.bind(this)
    contextvars.randomInt = this.RandomInt.bind(this)
    contextvars.createCountdown = this.CreateCountdown.bind(this)
    contextvars.removeCountdown = this.RemoveCountdown.bind(this)
    contextvars.createTimer = this.CreateTimer.bind(this)
    contextvars.removeTimer = this.RemoveTimer.bind(this)
    contextvars.segments = global.segments

    contextvars['sec'] = 1000
    for (let index = 1; index <= 10; index++)
      contextvars[`sec${index}`] = index * 1000

    try {
      for (const segment of global.layoutManager.getLayout().getAllSegments())
        contextvars[global.name2codename(segment.name)] = global.segments.AccessSegmentById(segment.id)
    }
    catch { this }

    try {
      this.lasterror = ''
      const context = vm.createContext(contextvars)
      const script = new vm.Script(this.jscode, { filename: `${this.name}.code` })
      script.runInContext(context)

      const lineCount = this.jscode.split(EOL).filter(Boolean).length
      const byteCount = this.jscode.length
      logger.info(`[Code] started (${lineCount} lines, ${byteCount} bytes)`)
      ws.broadcast({ title: 'Success', message: `${lineCount} lines, ${byteCount} bytes` }, 'code-run-success')
    } catch (error) {
      this.lasterror = error.message
      logger.error(`[Code] failed: ${error.message}`)
      ws.broadcast({ title: 'Error', message: error.message }, 'code-run-error')
    }
  }

  Stop() {
    for (const id of this._timers)
      clearTimeout(id)
    for (const id of this._intervals)
      clearInterval(id)

    //Release events of code
    global.segments.RebuildSegmentsEvents()

    logger.info('[Code] stopped')
  }
}

module.exports = LayoutCodeExecutor
