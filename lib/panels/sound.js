const BasePanel = require('./base')
const cpp = require('./cppConst')

class SoundPanel extends BasePanel {
  address = cpp.I2C_ADDRESS_SOUND
  state = {
    ready: false,
    cardReady: false,
    fileCount: 0,
    errorCode: 0,
    playedFolder: 0,
    playedFile: 0,
    playedVolume: 0,

    copyFromSrvComObject(srvcom) {
      const changed =
        this.ready !== (srvcom.ready ? true : false) ||
        this.cardReady !== (srvcom.cardReady ? true : false) ||
        this.fileCount !== srvcom.fileCount ||
        this.errorCode !== srvcom.errorCode ||
        this.playedFolder !== srvcom.playedFolder ||
        this.playedFile !== srvcom.playedFile ||
        this.playedVolume !== srvcom.playedVolume

      this.ready = (srvcom.ready ? true : false)
      this.cardReady = (srvcom.cardReady ? true : false)
      this.fileCount = srvcom.fileCount
      this.errorCode = srvcom.errorCode
      this.playedFolder = srvcom.playedFolder
      this.playedFile = srvcom.playedFile
      this.playedVolume = srvcom.playedVolume

      return changed
    }
  }

  constructor(segment) { super(segment) }

  Play(index) {
    const buffer = Buffer.alloc(cpp.SrvCom_Sound_Control_Play.getSize())
    cpp.SrvCom_Sound_Control_Play.encode(buffer, 0,
      {
        address: this.address,
        command: cpp.SRVCOM_SOUND_CONTROL,
        index: index,
      })
    this.Send(buffer)
  }
  Stop() { this.Play(0) }

  Receive(dataBuffer) {
    if (dataBuffer.length < 2) return

    if (super.Receive(dataBuffer)) return

    try {
      // eslint-disable-next-line sonarjs/no-small-switch
      switch (dataBuffer[1]) {
        case cpp.SRVCOM_SOUND_REPORT_STATUS: {
          const newstate = cpp.SrvCom_Sound_Report_Status.decode(dataBuffer, 0, { endian: 'LE' })

          if (this.state.copyFromSrvComObject(newstate))
            setImmediate(() => this.emit('change', this.state))

          break
        }
        default: {
          throw new Error('Invalid SRVCOM packet')
        }
      }
    }
    catch {
      logger.error(`[Segments] SoundPanel packet (${dataBuffer[1]}) error`)
    }
  }

}

module.exports = SoundPanel
