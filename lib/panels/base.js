const EventEmitter = require('node:events')
const dayjs = require('dayjs')
const cpp = require('./cppConst')

class BasePanel extends EventEmitter {
  segment = undefined
  initialized = false
  version = ''
  uptimems = 0
  uptimetime = 0

  constructor(segment) {
    super()
    this.segment = segment
  }

  GetVersion() { return `v${this.version}` }

  GetUptimeSec() {
    if (!this.uptimetime) return 0

    return Math.round((this.uptimems + (Date.now() - this.uptimetime)) / 1000)
  }

  GetUptimeHuman() { return dayjs.duration(this.GetUptimeSec() * 1000).format('D[d] HH:mm:ss') }

  Reset() {
    setImmediate(() => this.emit('reset'))
    const buffer = Buffer.alloc(cpp.SrvCom_Sys_Control_Reset.getSize())
    cpp.SrvCom_Sys_Control_Reset.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_SYS_CONTROL_RESET,
      })
    this.Send(buffer)
  }

  Send(dataBuffer) { if (this.segment) this.segment.Send(dataBuffer) }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return false

    try {
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_SYS_REPORT_PANELVERSION:
          const version = cpp.SrvCom_Sys_Report_PanelVersion.decode(dataBuffer)
          this.version = `${version.major}.${version.minor}.${version.patch}`
          this.initialized = true
          setImmediate(() => this.emit('version', {
            major: version.major,
            minor: version.minor,
            patch: version.patch
          }))
          return true
        case cpp.SRVCOM_SYS_REPORT_PANELUPTIME:
          const uptime = cpp.SrvCom_Sys_Report_PanelUptime.decode(dataBuffer, 0, { endian: 'LE' })
          this.uptimems = uptime.uptime
          this.uptimetime = new Date
          this.initialized = true
          setImmediate(() => this.emit('uptime', uptime.uptime))
          return true
      }
    }
    catch {
      logger.error(`[Segments] BasePanel packet (${dataBuffer[1]}) error`)
    }
    return false
  }
}

module.exports = BasePanel
