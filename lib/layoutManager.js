const { existsSync, readFileSync, writeFileSync, renameSync } = require('node:fs')
const path = require('node:path')
const TypeSerializer = require('./typeSerializer')
const layoutClasses = require('./layoutClasses')
const {
  Layout,
  LayoutSegment,
} = layoutClasses
const countries = require('./countries')
const LayoutCodeExecutor = require('./layoutCodeExecutor')

const LAYOUT_FILEEXTENSION = '.layout'
const CODE_FILEEXTENSION = '.code'

class LayoutManager {
  layoutName = ''
  layoutFilename = ''
  layoutCodeFilename = ''
  layoutCodeFileWatch = null
  layout = new Layout()
  serializer = new TypeSerializer()
  code = ''
  codeexecutor = null

  constructor(layoutname) {

    this.serializer.registerClasses(layoutClasses)

    this.layoutName = layoutname || 'default'

    this.layoutFilename = path.join(config.folderConfig, this.layoutName + LAYOUT_FILEEXTENSION)
    this.layoutCodeFilename = path.join(config.folderConfig, this.layoutName + CODE_FILEEXTENSION)

    this.loadLayoutFromFile()
    this.loadCodeFromFile()
  }

  getLayout() { return this.layout }

  getCode() { return this.code }
  getCodeLastError() {
    if (this.codeexecutor)
      return this.codeexecutor.GetLastError()
    return ''
  }

  dispatchErrorToExecutor(error) {
    if (this.codeexecutor)
      return this.codeexecutor.DispatchRuntimeError(error)
    return false
  }

  updateCode(code) {
    this.code = code
    this.saveCodeToFile()
    this.runCode(0)
  }

  runCode(delay = 2500) {
    if (this.codeexecutor)
      this.codeexecutor.Stop()

    setTimeout(function () {
      this.codeexecutor = new LayoutCodeExecutor(this.layoutName, this.code)
      this.codeexecutor.Run()
    }.bind(this), delay)
  }

  loadLayoutFromFile() {
    if (existsSync(this.layoutFilename)) {
      try {
        const jsondata = readFileSync(this.layoutFilename).toString()
        this.layout = this.serializer.parse(jsondata)
        const loggerinfosuccess = cmdline.debug ? ` from ${this.layoutFilename}` : ` from ${this.layoutName}`
        logger.info(`[Layout] Loaded ${this.layout.segments.length} segments${loggerinfosuccess}`)
      }
      catch (error) {
        this.generateDefaultLayout()
        if (this.archiveLayoutFile())
          this.saveLayoutToFile()
        const loggerinfoerror = cmdline.debug ? ` error ${error}` : ''
        logger.error(`[Layout] Cannot load layout, archived and recreated${loggerinfoerror}`)
      }
    }
    else {
      const loggerinfodefault = cmdline.debug ? ` and saved to ${this.layoutFilename}` : ''
      logger.info(`[Layout] Cannot find layout, generate default${loggerinfodefault}`)

      this.generateDefaultLayout()
      this.saveLayoutToFile()
    }
  }

  loadCodeFromFile() {
    if (existsSync(this.layoutCodeFilename)) {
      try {
        this.code = readFileSync(this.layoutCodeFilename).toString()
        const loggerinfosuccess = cmdline.debug ? ` from ${this.layoutCodeFilename}` : ` from ${this.layoutName}`
        logger.info(`[Layout] Code loaded${loggerinfosuccess}`)
        this.runCode()
      }
      catch (error) {
        const loggerinfoerror = cmdline.debug ? ` error ${error}` : ''
        logger.error(`[Layout] Cannot load code${loggerinfoerror}`)
      }
    }
    else {
      const loggerinfodefault = cmdline.debug ? ` and saved to ${this.layoutCodeFilename}` : ''
      logger.info(`[Layout] Cannot find code, generate empty${loggerinfodefault}`)

      this.updateCode(LayoutManager.generateDefaultCode())
    }
  }

  archiveLayoutFile() {
    try {
      if (existsSync(this.layoutFilename)) {
        let index = 1
        const targetFilename = () => `${this.layoutFilename}.archive${index}`
        while (existsSync(targetFilename()))
          index++
        renameSync(this.layoutFilename, targetFilename())
      }
      return true
    }
    catch (error) {
      const loggerinfoerror = cmdline.debug ? ` error ${error}` : ''
      logger.error(`[Layout] Cannot archive layout${loggerinfoerror}`)
      return false
    }
  }

  saveLayoutToFile() {
    try {
      this.layout.lastModify = Date.now()
      this.layout.normalize()
      const json = this.serializer.stringify(this.layout, 2)
      writeFileSync(this.layoutFilename, json)
      ws.broadcast({}, 'layoutchange')
    }
    catch (error) {
      const loggerinfoerror = cmdline.debug ? ` error ${error}` : ''
      logger.error(`[Layout] Cannot save layout${loggerinfoerror}`)
    }
  }

  saveCodeToFile() {
    try {
      writeFileSync(this.layoutCodeFilename, this.code)
    }
    catch (error) {
      const loggerinfoerror = cmdline.debug ? ` error ${error}` : ''
      logger.error(`[Layout] Cannot save code${loggerinfoerror}`)
    }
  }

  generateDefaultLayout() {

    const SIZE = 10

    const segA = LayoutSegment.generateRandom(SIZE, 0)
    segA.x = 0
    segA.y = 0
    segA.id = 1
    segA.name = countries.getRandomEuCapital()

    const segB = LayoutSegment.generateRandom(SIZE, 1)
    segB.x = SIZE
    segB.y = 0
    segB.id = 2
    segB.name = countries.getRandomEuCapital()

    const segC = LayoutSegment.generateRandom(SIZE, 2)
    segC.x = 0
    segC.y = SIZE
    segC.id = 5
    segC.name = countries.getRandomEuCapital()

    this.layout.segments.push(segA, segB, segC)
  }

  static generateDefaultCode() {
    return `//This code file contains automations for layout
    `
  }
}

module.exports = new LayoutManager(config.layout)
