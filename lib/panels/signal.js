const BasePanel = require('./base')
const cpp = require('./cppConst')

class SignalState {
  state = false
  customPattern = false
  bulbA = 0
  bulbB = 0
  bulbC = 0
  bulbD = 0

  copyFromSrvComObject(srvcom) {
    const changed =
      this.state !== (srvcom.state ? true : false) ||
      this.customPattern !== (srvcom.customPattern ? true : false) ||
      this.bulbA !== srvcom.bulbA ||
      this.bulbB !== srvcom.bulbB ||
      this.bulbC !== srvcom.bulbC ||
      this.bulbD !== srvcom.bulbD

    this.state = (srvcom.state ? true : false)
    this.customPattern = (srvcom.customPattern ? true : false)
    this.bulbA = srvcom.bulbA
    this.bulbB = srvcom.bulbB
    this.bulbC = srvcom.bulbC
    this.bulbD = srvcom.bulbD

    return changed
  }
}

class SignalPanel extends BasePanel {
  address = 0
  signalStates = []

  constructor(segment, address) {
    super(segment)
    this.address = address
    for (let index = 0; index < cpp.SIGNAL_SIGNALCOUNT; index++)
      this.signalStates[index] = new SignalState()
  }

  GetSignal(index,) { return this.signalStates[index] }
  SetSignal(index, state) {
    this.SetSignalInternal(index, {
      state: state ? 1 : 0,
      customPattern: false,
      bulbA: 0,
      bulbB: 0,
      bulbC: 0,
      bulbD: 0,
    })
  }

  ToggleSignal(index) {
    this.SetSignalInternal(index, {
      state: 2,
      customPattern: false,
      bulbA: 0,
      bulbB: 0,
      bulbC: 0,
      bulbD: 0,
    })
  }

  SetSignalPattern(index, state) {
    this.SetSignalInternal(index, {
      state: 0,
      customPattern: true,
      bulbA: state.bulbA,
      bulbB: state.bulbB,
      bulbC: state.bulbC,
      bulbD: state.bulbD,
    })
  }

  SetSignalInternal(index, state) {
    const buffer = Buffer.alloc(cpp.SrvCom_Signal_Control_State.getSize())
    cpp.SrvCom_Signal_Control_State.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_SIGNAL_CONTROL_STATE,
        signalIndex: index,
        signalState: state,
      })
    this.Send(buffer)
  }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return

    if (super.Receive(dataBuffer)) return

    try {
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_SIGNAL_REPORT_STATEALL: {
          this.ReceiveReportStateAll(dataBuffer)
          break
        }
        case cpp.SRVCOM_SIGNAL_REPORT_STATECHANGE: {
          this.ReceiveReportStateChange(dataBuffer)
          break
        }
        default: {
          throw new Error('Invalid SRVCOM packet')
        }
      }
    }
    catch (error) {
      logger.error(`[Segments] SignalPanel packet (${dataBuffer[1]}) error`)
      throw error
    }
  }

  ReceiveReportStateAll(dataBuffer) {
    const stateall = cpp.SrvCom_Signal_Report_StateAll.decode(dataBuffer)
    for (let index = 0; index < cpp.SIGNAL_SIGNALCOUNT; index++)
      if (this.signalStates[index].copyFromSrvComObject(stateall.states[index]))
        setImmediate(() => this.emit('change', index, this.signalStates[index]))
  }

  ReceiveReportStateChange(dataBuffer) {
    const statechange = cpp.SrvCom_Signal_Report_StateChange.decode(dataBuffer)
    if (statechange.signalIndex < cpp.SIGNAL_SIGNALCOUNT && this.signalStates[statechange.signalIndex].copyFromSrvComObject(statechange.signalState))
      setImmediate(() => this.emit('change', statechange.signalIndex, this.signalStates[statechange.signalIndex]))
  }

  async GetRemoteConfig() {
    const buffer = await super.GetRemoteConfig()
    return cpp.SrvCom_Signal_Config_Resp.decode(buffer).config
  }

  UpdateRemoteConfig(config) {
    const bufferToSend = Buffer.alloc(cpp.SrvCom_Signal_Config_Update.getSize())
    cpp.SrvCom_Signal_Config_Update.encode(bufferToSend, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_SYS_CONFIG_UPDATE,
        config: config,
      })
    this.Send(bufferToSend)
  }
}

module.exports = SignalPanel
