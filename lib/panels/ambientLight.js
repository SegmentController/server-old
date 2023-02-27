const BasePanel = require('./base')
const cpp = require('./cppConst')
const Bitset = require('bitset')

class AmbientLightPanel extends BasePanel {
  address = 0
  lightStates = [0, 0, 0, 0, 0, 0]
  effects = [0, 0]

  constructor(segment, address) {
    super(segment)
    this.address = address
  }

  GetLight(index) { return this.lightStates[index] }
  SetLight(index, state) {
    const buffer = Buffer.alloc(cpp.SrvCom_AmbientLight_Control_LightState.getSize())
    cpp.SrvCom_AmbientLight_Control_LightState.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_AMBIENTLIGHT_CONTROL_LIGHTSTATE,
        lightIndex: index,
        state: state
      })
    this.Send(buffer)
  }
  ToggleLight(index) { this.SetLight(index, 2) }

  GetEffect(index) { return this.effects[index] }
  SetEffect(index, state) {
    const buffer = Buffer.alloc(cpp.SrvCom_AmbientLight_Control_EffectState.getSize())
    cpp.SrvCom_AmbientLight_Control_EffectState.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_AMBIENTLIGHT_CONTROL_EFFECTSTATE,
        effectIndex: index,
        state: state
      })
    this.Send(buffer)
  }
  ToggleEffect(index) { this.SetEffect(index, 2) }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return

    if (super.Receive(dataBuffer)) return

    try {
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_AMBIENTLIGHT_REPORT_STATEALL: {
          this.ReceiveReportStateAll(dataBuffer)
          break
        }
        case cpp.SRVCOM_AMBIENTLIGHT_REPORT_LIGHTSTATECHANGE: {
          this.ReceiveReportLightStateChange(dataBuffer)
          break
        }
        case cpp.SRVCOM_AMBIENTLIGHT_REPORT_EFFECTSTATECHANGE: {
          this.ReceiveReportEffectStateChange(dataBuffer)
          break
        }
        default: {
          throw new Error('Invalid SRVCOM packet')
        }
      }
    }
    catch {
      logger.error(`[Segments] AmbientLightPanel packet (${dataBuffer[1]}) error`)
    }
  }

  ReceiveReportStateAll(dataBuffer) {
    const stateall = cpp.SrvCom_AmbientLight_Report_StateAll.decode(dataBuffer)

    const bs = new Bitset(stateall.lightStates)
    for (let index = 0; index < 6; index++) {
      const state = bs.get(index)
      if (this.lightStates[index] !== state)
        setImmediate(() => this.emit('lightchange', index, state))
      this.lightStates[index] = state
    }

    if (this.effects[0] !== stateall.effectStates[0])
      setImmediate(() => this.emit('effectchange', 0, stateall.effectStates[0]))
    this.effects[0] = stateall.effectStates[0]
    if (this.effects[1] !== stateall.effectStates[1])
      setImmediate(() => this.emit('effectchange', 1, stateall.effectStates[1]))
    this.effects[1] = stateall.effectStates[1]
  }

  ReceiveReportLightStateChange(dataBuffer) {
    const lightchange = cpp.SrvCom_AmbientLight_Report_LightStateChange.decode(dataBuffer)
    if (this.lightStates[lightchange.lightIndex] !== lightchange.state)
      setImmediate(() => this.emit('lightchange', lightchange.lightIndex, lightchange.state))
    this.lightStates[lightchange.lightIndex] = lightchange.state
  }

  ReceiveReportEffectStateChange(dataBuffer) {
    const effectchange = cpp.SrvCom_AmbientLight_Report_EffectStateChange.decode(dataBuffer)
    if (this.effects[effectchange.effectIndex] !== effectchange.effect)
      setImmediate(() => this.emit('effectchange', effectchange.effectIndex, effectchange.effect))
    this.effects[effectchange.effectIndex] = effectchange.effect
  }

  async GetRemoteConfig() {
    const buffer = await super.GetRemoteConfig()
    return cpp.SrvCom_Ambient_Config_Resp.decode(buffer).config
  }

  UpdateRemoteConfig(config) {
    const bufferToSend = Buffer.alloc(cpp.SrvCom_Ambient_Config_Update.getSize())
    cpp.SrvCom_Ambient_Config_Update.encode(bufferToSend, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_SYS_CONFIG_UPDATE,
        config: config,
      })
    this.Send(bufferToSend)
  }
}

module.exports = AmbientLightPanel
