const EventEmitter = require('node:events')
const cpp = require('./panels/cppConst')
const MasterBoard = require('./panels/master')
const TurnoutPanel = require('./panels/turnout')
const SignalPanel = require('./panels/signal')
const KeyPadPanel = require('./panels/keypad')
const SoundPanel = require('./panels/sound')
const AmbientLightPanel = require('./panels/ambientLight')

class Buttons {
  constructor(segmentid) {
    segmentid
  }

  call(name) {
    if (this[name])
      if (typeof this[name] === 'function')
        this[name]()
      else
        logger.error(`[Code] Button handler of '${name}' is not a function`)
  }
}

class Segment extends EventEmitter {
  segmentid = 0
  mode = ''
  ipaddress = ''

  master = new MasterBoard(this)

  get turnout() { return this.turnout1 }
  turnout1 = new TurnoutPanel(this, cpp.I2C_ADDRESS_TURNOUT1)
  turnout2 = new TurnoutPanel(this, cpp.I2C_ADDRESS_TURNOUT2)
  getTurnout(panel) {
    switch (panel) {
      case 1: {
        return this.turnout1
      }
      case 2: {
        return this.turnout2
      }
      default: {
        return null
      }
    }
  }

  get signal() { return this.signal1 }
  signal1 = new SignalPanel(this, cpp.I2C_ADDRESS_SIGNAL1)
  signal2 = new SignalPanel(this, cpp.I2C_ADDRESS_SIGNAL2)
  getSignal(panel) {
    switch (panel) {
      case 1: {
        return this.signal1
      }
      case 2: {
        return this.signal2
      }
      default: {
        return null
      }
    }
  }

  get keypad() { return this.keypad1 }
  keypad1 = new KeyPadPanel(this)

  get sound() { return this.sound1 }
  sound1 = new SoundPanel(this)

  get ambientlight() { return this.ambientlight1 }
  ambientlight1 = new AmbientLightPanel(this, cpp.I2C_ADDRESS_AMBIENTLIGHT1)
  ambientlight2 = new AmbientLightPanel(this, cpp.I2C_ADDRESS_AMBIENTLIGHT2)
  getAmbientLight(panel) {
    switch (panel) {
      case 1: {
        return this.ambientlight1
      }
      case 2: {
        return this.ambientlight2
      }
      default: {
        return null
      }
    }
  }

  _buttons = null
  get buttons() {
    if (!this._buttons)
      this._buttons = new Buttons(this.segmentid)
    return this._buttons
  }

  InitAllPanelEvents() {
    this.turnout1.on('change', (...arguments_) => this.emit('panelevent', this.segmentid, 'turnout1', 'change', ...arguments_))
    this.turnout2.on('change', (...arguments_) => this.emit('panelevent', this.segmentid, 'turnout2', 'change', ...arguments_))

    this.signal1.on('change', (...arguments_) => this.emit('panelevent', this.segmentid, 'signal1', 'change', ...arguments_))
    this.signal2.on('change', (...arguments_) => this.emit('panelevent', this.segmentid, 'signal2', 'change', ...arguments_))

    this.keypad.on('switchchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'keypad', 'switchchange', ...arguments_))
    this.keypad.on('buttonpress', (...arguments_) => this.emit('panelevent', this.segmentid, 'keypad', 'buttonpress', ...arguments_))
    this.keypad.on('buttonshortpress', (...arguments_) => this.emit('panelevent', this.segmentid, 'keypad', 'buttonshortpress', ...arguments_))
    this.keypad.on('buttonlongpress', (...arguments_) => this.emit('panelevent', this.segmentid, 'keypad', 'buttonlongpress', ...arguments_))

    this.sound.on('change', (...arguments_) => this.emit('panelevent', this.segmentid, 'sound', 'change', ...arguments_))

    this.ambientlight1.on('nightchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'ambientlight1', 'nightchange', ...arguments_))
    this.ambientlight1.on('lightchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'ambientlight1', 'lightchange', ...arguments_))
    this.ambientlight1.on('effectchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'ambientlight1', 'effectchange', ...arguments_))
    this.ambientlight2.on('nightchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'ambientlight2', 'nightchange', ...arguments_))
    this.ambientlight2.on('lightchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'ambientlight2', 'lightchange', ...arguments_))
    this.ambientlight2.on('effectchange', (...arguments_) => this.emit('panelevent', this.segmentid, 'ambientlight2', 'effectchange', ...arguments_))
  }

  ReleaseAllPanelAllEvents() {
    for (const panel of [
      this.turnout1, this.turnout2,
      this.signal1, this.signal2,
      this.keypad,
      this.sound,
      this.ambientlight1, this.ambientlight2,
    ])
      panel.removeAllListeners()

    this._buttons = null
  }

  constructor(segmentid) {
    super()
    this.segmentid = segmentid
    this.InitAllPanelEvents()
  }
  GetValidPanels() {
    const panels = {}

    if (this.master.initialized) panels['MasterBoard'] = { version: this.master.GetVersion(), uptime: this.master.GetUptimeHuman() }

    if (this.turnout1.initialized) panels['Turnout 1'] = { codeid: 'turnout', version: this.turnout1.GetVersion(), uptime: this.turnout1.GetUptimeHuman(), i2c: this.turnout1.GetI2CHuman() }
    if (this.turnout2.initialized) panels['Turnout 2'] = { codeid: 'turnout2', version: this.turnout2.GetVersion(), uptime: this.turnout2.GetUptimeHuman(), i2c: this.turnout2.GetI2CHuman() }

    if (this.signal1.initialized) panels['Signal 1'] = { codeid: 'signal', version: this.signal1.GetVersion(), uptime: this.signal1.GetUptimeHuman(), i2c: this.signal1.GetI2CHuman() }
    if (this.signal2.initialized) panels['Signal 2'] = { codeid: 'signal2', version: this.signal2.GetVersion(), uptime: this.signal2.GetUptimeHuman(), i2c: this.signal2.GetI2CHuman() }

    if (this.keypad.initialized) panels['Keypad'] = { codeid: 'keypad', version: this.keypad.GetVersion(), uptime: this.keypad.GetUptimeHuman(), i2c: this.keypad.GetI2CHuman() }

    if (this.sound.initialized) panels['Sound'] = { codeid: 'sound', version: this.sound.GetVersion(), uptime: this.sound.GetUptimeHuman(), i2c: this.sound.GetI2CHuman() }

    if (this.ambientlight1.initialized) panels['AmbientLight 1'] = { codeid: 'ambientlight', version: this.ambientlight1.GetVersion(), uptime: this.ambientlight1.GetUptimeHuman(), i2c: this.ambientlight1.GetI2CHuman() }
    if (this.ambientlight2.initialized) panels['AmbientLight 2'] = { codeid: 'ambientlight2', version: this.ambientlight2.GetVersion(), uptime: this.ambientlight2.GetUptimeHuman(), i2c: this.ambientlight2.GetI2CHuman() }

    return panels
  }

  GetMode() {
    switch (this.mode) {
      case 'wifi': {
        return { mode: 'wifi', ip: this.ipaddress, id: this.segmentid }
      }
      case 'rf24': {
        return { mode: 'rf24', id: this.segmentid }
      }
      default: {
        return null
      }
    }
  }
  GetModeAsString() {
    switch (this.mode) {
      case 'wifi': {
        return `#${this.segmentid} WiFi (${this.ipaddress})`
      }
      case 'rf24': {
        return `#${this.segmentid} RF24`
      }
      default: {
        return `#${this.segmentid} Unknown`
      }
    }
  }

  Reset(withPanels) { this.master.Reset(withPanels) }

  Send(dataBuffer) {
    switch (this.mode) {
      case 'wifi': {
        wifi.send(this.segmentid, this.ipaddress, dataBuffer)
        break
      }
      case 'rf24': {
        rf24.send(this.segmentid, dataBuffer)
        break
      }
      default: {
        break
      }
    }
  }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return
    switch (dataBuffer[0]) {

      case 0: {
        this.master.Receive(dataBuffer)
        break
      }

      case cpp.I2C_ADDRESS_TURNOUT1: {
        this.turnout1.Receive(dataBuffer)
        break
      }
      case cpp.I2C_ADDRESS_TURNOUT2: {
        this.turnout2.Receive(dataBuffer)
        break
      }

      case cpp.I2C_ADDRESS_SIGNAL1: {
        this.signal1.Receive(dataBuffer)
        break
      }
      case cpp.I2C_ADDRESS_SIGNAL2: {
        this.signal2.Receive(dataBuffer)
        break
      }

      case cpp.I2C_ADDRESS_KEYPAD: {
        this.keypad.Receive(dataBuffer)
        break
      }

      case cpp.I2C_ADDRESS_SOUND: {
        this.sound.Receive(dataBuffer)
        break
      }

      case cpp.I2C_ADDRESS_AMBIENTLIGHT1: {
        this.ambientlight1.Receive(dataBuffer)
        break
      }
      case cpp.I2C_ADDRESS_AMBIENTLIGHT2: {
        this.ambientlight2.Receive(dataBuffer)
        break
      }

      default: {
        logger.error(`[Segment] Invalid panel: ${dataBuffer[0]}`)
        break
      }
    }
  }
  ReceiveRf24(dataBuffer) {
    if (!this.mode) {
      this.mode = 'rf24'
      setImmediate(() => this.emit('modechanged', this.segmentid, 'rf24'))
    }
    this.Receive(dataBuffer)
  }
  ReceiveWiFi(ip, dataBuffer) {
    if (!this.mode) {
      this.mode = 'wifi'
      this.ipaddress = ip
      setImmediate(() => this.emit('modechanged', this.segmentid, 'wifi'))
    }
    this.Receive(dataBuffer)
  }
  BroadcastNightLightChange(state) {
    if (this.ambientlight1.initialized) this.ambientlight1.SetNight(state ? true : false)
    if (this.ambientlight2.initialized) this.ambientlight2.SetNight(state ? true : false)
  }
}

class SegmentsHandler extends EventEmitter {
  segments = new Map()
  syncNightLight = true

  constructor(rf24handler, wifihandler) {
    super()
    rf24handler.on('receive', function (fromNode, dataBuffer) {
      this.AccessSegmentById(fromNode).ReceiveRf24(dataBuffer)
    }.bind(this))
    wifihandler.on('receive', function (fromNode, ip, dataBuffer) {
      this.AccessSegmentById(fromNode).ReceiveWiFi(ip, dataBuffer)
    }.bind(this))
  }

  SetSyncNightLight(enabled) { this.syncNightLight = enabled }

  GetSegmentIds() { return [...this.segments.keys()] }

  SegmentExists(id) { return this.segments.has(id) }

  AccessSegmentById(id) { return this.GetSegmentByIdInternal(id, true) }
  GetSegmentById(id) { return this.GetSegmentByIdInternal(id, false, true) }
  FindSegmentById(id) { return this.GetSegmentByIdInternal(id, false, false) }
  GetSegmentByIdInternal(id, allowcreate = false, throwerror = false) {
    if (!this.SegmentExists(id)) {
      if (allowcreate) {
        const newsegment = new Segment(id)
        newsegment.on('panelevent', (...arguments_) => this.emit('panelevent', ...arguments_))
        newsegment.on('modechanged', (...arguments_) => this.emit('segmentmodechanged', ...arguments_))
        newsegment.on('panelevent', this.NightLightEventHandler.bind(this))
        this.segments.set(id, newsegment)
      }
      else if (throwerror)
        throw new Error(`Segment #${id} not found`)
      else
        return null
    }
    return this.segments.get(id)
  }

  InitializeEventsToDashboard() {
    this.on('panelevent', (...arguments_) => {
      //console.log(arguments_)

      let segmentid, panel, event, eventdata
      [segmentid, panel, event, ...eventdata] = arguments_
      ws.broadcast({ segmentid, panel, event, eventdata }, 'dashboard-element')
    })
    this.on('segmentmodechanged', (...arguments_) => {
      //console.log(arguments_)

      let segmentid, mode
      [segmentid, mode] = arguments_
      ws.broadcast({ title: `Controller #${segmentid} connected`, message: `Mode: ${mode}` }, 'network-change')
    })
  }

  NightLightEventHandler(segmentid, panel, event, state) {
    // console.log(segmentid, panel, event, state)
    if (this.syncNightLight && ['ambientlight1', 'ambientlight2'].includes(panel) && event === 'nightchange') {
      for (const id of this.GetSegmentIds()) {
        const seg = this.AccessSegmentById(id)
        if (seg)
          seg.BroadcastNightLightChange(state)
      }
    }
  }

  RebuildSegmentsEvents() {
    for (const segment of this.segments.values()) {
      segment.ReleaseAllPanelAllEvents()
      segment.InitAllPanelEvents()
    }
  }
}

module.exports = (rf24handler, wifihandler) => new SegmentsHandler(rf24handler, wifihandler)
