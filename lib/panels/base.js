const EventEmitter = require('node:events')
const dayjs = require('dayjs')
const cpp = require('./cppConst')

class BasePanel extends EventEmitter {
  segment = undefined
  initialized = false
  version = ''
  uptimems = 0
  uptimetime = 0
  i2cSuccess = 0
  i2cFailed = 0
  configWaitList = new Map()

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

  GetI2CHuman() { return `${this.i2cFailed}/${this.i2cSuccess + this.i2cFailed}` }

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

  GetConfig() {
    this.configWaitList.set(this.address, null)

    const buffer = Buffer.alloc(cpp.SrvCom_Sys_Config_Get.getSize())
    cpp.SrvCom_Sys_Config_Get.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_SYS_CONFIG_GET_REQUEST,
      })
    this.Send(buffer)

    return new Promise((resolve, reject) => {
      setInterval(() => {
        const buffer = this.configWaitList.get(this.address);
        if (buffer)
          resolve(Buffer.from(buffer, 2))
      }, 10)
      setTimeout(reject, 500)
    })
  }

  Send(dataBuffer) { if (this.segment) this.segment.Send(dataBuffer) }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return false

    try {
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_SYS_REPORT_PANELVERSION: {
          const version = cpp.SrvCom_Sys_Report_PanelVersion.decode(dataBuffer)
          this.version = `${version.major}.${version.minor}.${version.patch}`
          this.initialized = true
          setImmediate(() => this.emit('version', {
            major: version.major,
            minor: version.minor,
            patch: version.patch
          }))
          return true
        }
        // case cpp.SRVCOM_SYS_REPORT_PANELUPTIME: {
        //   const uptime = cpp.SrvCom_Sys_Report_PanelUptime.decode(dataBuffer, 0, { endian: 'LE' })
        //   this.uptimems = uptime.uptime
        //   this.uptimetime = new Date
        //   this.initialized = true
        //   setImmediate(() => this.emit('uptime', uptime.uptime))
        //   return true
        // }
        case cpp.SRVCOM_SYS_REPORT_PANELUPTIMEI2CSTAT: {
          const uptimei2c = cpp.SrvCom_Sys_Report_PanelUptimeI2CStat.decode(dataBuffer, 0, { endian: 'LE' })
          this.uptimems = uptimei2c.uptime
          this.uptimetime = new Date
          this.i2cSuccess = uptimei2c.i2c_success
          this.i2cFailed = uptimei2c.i2c_failed
          this.initialized = true
          setImmediate(() => this.emit('uptime', uptimei2c.uptime))
          setImmediate(() => this.emit('i2c', uptimei2c.i2c_success, uptimei2c.i2c_failed))
          return true
        }
        case cpp.SRVCOM_SYS_CONFIG_GET_RESPONSE: {
          if (dataBuffer.length > 2)
            this.configWaitList.set(dataBuffer[0], dataBuffer)
          return true
        }
      }
    }
    catch {
      logger.error(`[Segments] BasePanel packet (${dataBuffer[1]}) error`)
    }
    return false
  }
}

module.exports = BasePanel
