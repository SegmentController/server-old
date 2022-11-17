const BasePanel = require('./base')
const cpp = require('./cppConst')
const Bitset = require('bitset')

class KeyPadPanel extends BasePanel {
  address = cpp.I2C_ADDRESS_KEYPAD
  switchStates = [0, 0, 0, 0, 0, 0]

  constructor(segment) { super(segment) }

  Tone(toneA, toneB, toneC) {
    const buffer = Buffer.alloc(cpp.SrvCom_Keypad_Control_Tone.getSize())
    cpp.SrvCom_Keypad_Control_Tone.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_KEYPAD_CONTROL_TONE,
        toneA: toneA,
        toneB: toneB,
        toneC: toneC,
      })
    this.Send(buffer)
  }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return

    if (super.Receive(dataBuffer)) return

    try {
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_KEYPAD_REPORT_STATEALL: {
          this.ReceiveReportStateAll(dataBuffer)
          break
        }
        case cpp.SRVCOM_KEYPAD_REPORT_SWITCHCHANGE: {
          this.ReceiveReportSwitchChange(dataBuffer)
          break
        }
        case cpp.SRVCOM_KEYPAD_REPORT_BUTTONPRESS: {
          this.ReceiveReportButtonPress(dataBuffer)
          break
        }
        default: {
          throw new Error('Invalid SRVCOM packet')
        }
      }
    }
    catch {
      logger.error(`[Segments] KeyPadPanel packet (${dataBuffer[1]}) error`)
    }
  }

  ReceiveReportStateAll(dataBuffer) {
    const stateall = cpp.SrvCom_Keypad_Report_StateAll.decode(dataBuffer)
    const bs = new Bitset(stateall.switchStates)
    for (let index = 0; index < 6; index++) {
      const state = bs.get(index)
      if (this.switchStates[index] !== state)
        setImmediate(() => this.emit('switchchange', index, state))
      this.switchStates[index] = state
    }
  }

  ReceiveReportSwitchChange(dataBuffer) {
    const swchange = cpp.SrvCom_Keypad_Report_SwitchChange.decode(dataBuffer)
    if (this.switchStates[swchange.switchIndex] !== swchange.switchState)
      setImmediate(() => this.emit('switchchange', swchange.switchIndex, swchange.switchState))
    this.switchStates[swchange.switchIndex] = swchange.switchState
  }

  ReceiveReportButtonPress(dataBuffer) {
    const btnpress = cpp.SrvCom_Keypad_Report_ButtonPress.decode(dataBuffer)
    setImmediate(() => this.emit('buttonpress', btnpress.buttonIndex, btnpress.isLongPress ? true : false))
    if (btnpress.isLongPress)
      setImmediate(() => this.emit('buttonlongpress', btnpress.buttonIndex))
    else
      setImmediate(() => this.emit('buttonshortpress', btnpress.buttonIndex))
  }
}

module.exports = KeyPadPanel
