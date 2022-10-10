const EventEmitter = require('node:events')
const RF24MeshSerialNode = require('rf24meshserialnode')
const cpp = require('./panels/cppConst')

const SENDQUEUE_MAXLENGTH = 256
const SENDQUEUE_FREQUENCY = 50
const SENDQUEUE_MAXRETRY = 3

class RF24Handler extends EventEmitter {
  rf24bootcount = 0
  transmitstat = {
    startDate: Date.now(),
    receiveCount: 0,
    receiveSize: 0,
    sendCount: 0,
    sendSize: 0,
    receiveCountPerMin() { return Math.round(this.receiveCount / ((Date.now() - this.startDate) / 1000) * 60) },
    receiveSizePerMin() { return Math.round(this.receiveSize / ((Date.now() - this.startDate) / 1000) * 60) },
  }
  rf24node = undefined
  nodes = []
  sendQueue = []

  isConnected() { return this.rf24node && this.rf24node.isopened }

  getStat() { return this.transmitstat }

  async processSendQueue() {
    if (this.sendQueue.length === 0) return

    const [toNode, data, retry] = this.sendQueue.shift()

    await this.rf24node.send(toNode, 0, data)
      .then(() => {
        this.transmitstat.sendCount += 1
        this.transmitstat.sendSize += data.length
        let bvalue = []
        for (const value of data)
          bvalue.push(value.toString(16))

        if (cmdline['debug-rf24'])
          logger.debug(`[RF24] Sent to ${toNode} with type 0 data: ${bvalue}`)
        return bvalue
      })
      .catch((error) => {
        if (retry <= SENDQUEUE_MAXRETRY)
          this.sendQueue.push([toNode, data, retry + 1])
        logger.error('[RF24] Send error: ' + error.message)
      })
  }

  async send(toNode, data) {
    if (!this.isConnected) return

    if (this.sendQueue.length > SENDQUEUE_MAXLENGTH) {
      logger.error(`[RF24] Send queue too busy: ${this.sendQueue.length}+`)
      while (this.sendQueue.length > SENDQUEUE_MAXLENGTH / 2)
        this.sendQueue.shift()
    }
    this.sendQueue.push([toNode, data, 1])
  }

  async startup(node) {
    await node.setNodeId(0)
      .then(() => node.setSpeed(config.rf24.speed))
      .then(() => node.setChannel(config.rf24.channel))
      .then(() => node.begin())
      .then(() => {
        logger.info('[RF24] Radio handler started')
        this.emit('startup')
        return 1
      })
      .catch((error) => logger.error('[RF24] Radio handler error : ' + error.message))
  }

  prepareNode(node) {
    node.on('reready', function () {
      this.rf24bootcount++
      logger.debug(`[RF24] Rebooted ${this.rf24bootcount} time(s)`)
      this.startup(node)
      this.emit('reboot', this.rf24bootcount)
    }.bind(this))

    node.on('close', async function () {
      this.rf24node = undefined
      logger.debug('[RF24] Closed')
      this.emit('close')
    }.bind(this))

    node.on('newnode', async function () {
      logger.debug('[RF24] Nodes: ' + await node.getNodelist())

      const reportednodes = await node.getNodelist()
      for (const repnode of reportednodes)
        if (!this.nodes.includes(repnode)) {
          logger.debug(`[RF24] New node: ${repnode}`)

          const buffer = Buffer.alloc(cpp.SrvCom_Sys_Control_Init.getSize())
          cpp.SrvCom_Sys_Control_Init.encode(buffer, 0,
            {
              address: 0,
              command: cpp.SRVCOM_SYS_CONTROL_INIT,
            })
          this.send(repnode, buffer)

          this.emit('newnode', repnode)
        }
      this.nodes = reportednodes
    }.bind(this))

    node.on('receive', async function (from, type, buffer) {
      if (from < 0 || from > 79) {
        logger.debug(`[RF24] Invalid packet from ${from}`)
        return
      }

      this.transmitstat.receiveCount += 1
      this.transmitstat.receiveSize += buffer.length

      if (cmdline['debug-rf24']) {
        let bvalue = []
        for (const value of buffer)
          bvalue.push(value.toString(16))
        logger.debug(`[RF24] Data from ${from} type ${type} data: ${bvalue}`)
      }

      this.emit('receive', from, buffer)
    }.bind(this))
  }

  StartRF24MeshNode() {
    RF24MeshSerialNode.find({
      inittimeout: 2500,
      cmdtimeout: 250
    }, async function (node) {
      if (node) {
        this.rf24node = node
        logger.info(`[RF24] Device found: ${node.portnumber}`)

        await node.getVersion()
          .then((version) => logger.debug('[RF24] Version: ' + version))
          .catch((error) => logger.error('[RF24] Version ERROR: ' + error.message))

        this.prepareNode(node)
        this.startup(node)
      }
    }.bind(this))
  }
}

const rf24handler = new RF24Handler()

if (config.rf24.enabled) {
  rf24handler.StartRF24MeshNode()

  setInterval(() => {
    if (!rf24handler.rf24node)
      rf24handler.StartRF24MeshNode()
  }, 1000)

  const psq = () => setTimeout(async () => {
    await rf24handler.processSendQueue()
    psq()
  }, SENDQUEUE_FREQUENCY)
  psq()
}

module.exports = rf24handler
