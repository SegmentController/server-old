const EventEmitter = require('node:events')
const dayjs = require('dayjs')
const cpp = require('./cppConst')

class MasterBoard extends EventEmitter {
    segment = undefined
    address = 0
    version = ''
    uptimems = 0
    uptimetime = 0

    nightState = false

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

    Reset(withPanels) {
        setImmediate(() => this.emit('reset'))
        const buffer = Buffer.alloc(cpp.SrvCom_Sys_Control_Reset.getSize())
        cpp.SrvCom_Sys_Control_Reset.encode(buffer, 0,
            {
                address: this.address,
                command: withPanels ? cpp.SRVCOM_SYS_CONTROL_RESET_ALL : cpp.SRVCOM_SYS_CONTROL_RESET,
            })
        this.Send(buffer)
    }

    GetNight() { return this.nightState }
    SetNight(state) {
        const buffer = Buffer.alloc(cpp.SrvCom_Master_Control_NightState.getSize())
        cpp.SrvCom_Master_Control_NightState.encode(buffer, 0,
            {
                address: this.address,
                command: cpp.SRVCOM_MASTER_CONTROL_NIGHTSTATE,
                state: state
            })
        this.Send(buffer)
    }
    ToggleNight() { this.SetNight(2) }

    Send(dataBuffer) { if (this.segment) this.segment.Send(dataBuffer) }

    Receive(dataBuffer) {
        if (dataBuffer.length < 2) return false

        try {
            switch (dataBuffer[1]) {
                case cpp.SRVCOM_SYS_REPORT_PANELVERSION: {
                    const version = cpp.SrvCom_Sys_Report_PanelVersion.decode(dataBuffer)
                    this.version = `${version.major}.${version.minor}.${version.patch}.`
                    setImmediate(() => this.emit('version', {
                        major: version.major,
                        minor: version.minor,
                        patch: version.patch
                    }))
                    return true
                }
                case cpp.SRVCOM_SYS_REPORT_PANELUPTIME: {
                    const uptime = cpp.SrvCom_Sys_Report_PanelUptime.decode(dataBuffer, 0, { endian: 'LE' })
                    this.uptimems = uptime.uptime
                    this.uptimetime = new Date
                    setImmediate(() => this.emit('uptime', uptime.uptime))
                    return true
                }

                case cpp.SRVCOM_MASTER_REPORT_NIGHTSTATECHANGE: {
                    this.ReceiveReportNightStateChange(dataBuffer)
                    break
                }
            }
        }
        catch {
            logger.error(`[Segments] MasterBoard packet (${dataBuffer[1]}) error`)
        }
        return false
    }

    ReceiveReportNightStateChange(dataBuffer) {
        const nightchange = cpp.SrvCom_Master_Report_NightStateChange.decode(dataBuffer)
        if (this.nightState !== nightchange.state)
            setImmediate(() => this.emit('nightchange', nightchange.state))
        this.nightState = nightchange.state
    }
}

module.exports = MasterBoard
