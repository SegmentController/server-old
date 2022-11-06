const BasePanel = require('./base')
const cpp = require('./cppConst')
const Bitset = require('bitset')

class TurnoutPanel extends BasePanel {
  address = 0
  turnoutStates = [null, null, null, null, null, null]

  constructor(segment, address) {
    super(segment)
    this.address = address
  }

  GetTurnout(index,) { return this.turnoutStates[index] }
  SetTurnout(index, state) {
    const buffer = Buffer.alloc(cpp.SrvCom_Turnout_Control_State.getSize())
    cpp.SrvCom_Turnout_Control_State.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_TURNOUT_CONTROL_STATE,
        turnoutIndex: index,
        turnoutState: state
      })
    this.Send(buffer)
  }

  SetTurnoutByPercent(index, percent) {
    const buffer = Buffer.alloc(cpp.SrvCom_Turnout_Control_ByPercent.getSize())
    cpp.SrvCom_Turnout_Control_ByPercent.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_TURNOUT_CONTROL_BYPERCENT,
        turnoutIndex: index,
        statePercent: percent
      })
    this.Send(buffer)
  }

  ToggleTurnout(index) { this.SetTurnout(index, 2) }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return

    if (super.Receive(dataBuffer)) return

    try {
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_TURNOUT_REPORT_STATEALL: {
          this.ReceiveReportStateAll(dataBuffer)
          break
        }
        case cpp.SRVCOM_TURNOUT_REPORT_STATECHANGE: {
          this.ReceiveReportStateChange(dataBuffer)
          break
        }
        default: {
          throw new Error('Invalid SRVCOM packet')
        }
      }
    }
    catch {
      logger.error(`[Segments] TurnoutPanel packet (${dataBuffer[1]}) error`)
    }
  }

  ReceiveReportStateAll(dataBuffer) {
    const stateall = cpp.SrvCom_Turnout_Report_StateAll.decode(dataBuffer)
    const bs = new Bitset(stateall.turnoutStates)
    for (let index = 0; index < 6; index++) {
      const state = bs.get(index) ? true : false
      if (this.turnoutStates[index] !== state)
        setImmediate(() => this.emit('change', index, state))
      this.turnoutStates[index] = state
    }
  }

  ReceiveReportStateChange(dataBuffer) {
    const statechange = cpp.SrvCom_Turnout_Report_StateChange.decode(dataBuffer)
    const state = statechange.turnoutState ? true : false
    if (this.turnoutStates[statechange.turnoutIndex] !== state)
      setImmediate(() => this.emit('change', statechange.turnoutIndex, state))
    this.turnoutStates[statechange.turnoutIndex] = state
  }
}

module.exports = TurnoutPanel
