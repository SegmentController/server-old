const EventEmitter = require('node:events')
const dgram = require('node:dgram')
const cpp = require('./panels/cppConst')

// eslint-disable-next-line unicorn/numeric-separators-style
const UDP_PORT = 19079
const UDP_SIGN2 = 'Sg'
const BROADCAST_IP = '255.255.255.255'
const BROADCAST_NODEID = 0xFF

class WifiHandler extends EventEmitter {
    isStopping = false
    transmitstat = {
        startDate: Date.now(),
        receiveCount: 0,
        receiveSize: 0,
        sendCount: 0,
        sendSize: 0,
        receiveCountPerMin() { return Math.round(this.receiveCount / ((Date.now() - this.startDate) / 1000) * 60) },
        receiveSizePerMin() { return Math.round(this.receiveSize / ((Date.now() - this.startDate) / 1000) * 60) },
    }
    getStat() { return this.transmitstat }

    sendLivePacketToAll() {
        const buffer = Buffer.alloc(cpp.SrvCom_Sys_Control_Init.getSize())
        cpp.SrvCom_Sys_Control_Init.encode(buffer, 0,
            {
                address: 0,
                command: cpp.SRVCOM_SYS_CONTROL_INIT,
            })
        this.send(BROADCAST_NODEID, null, buffer)
        logger.debug('[WiFi] Live packet sent')
    }

    client = null
    async send(toNode, ip, data) {

        if (!toNode) toNode = BROADCAST_NODEID

        if (!this.client || !this.client.maxUsage) {
            this.client = dgram.createSocket('udp4')
            if (!ip)
                this.client.bind(() => this.client.setBroadcast(true))

            this.client.maxUsage = 5
            this.client.registerUse = function () { --this.maxUsage }.bind(this.client)
        }

        const udpPacket = Buffer.concat([
            Buffer.from(UDP_SIGN2),
            Buffer.from([0]),
            Buffer.from([toNode]),
            Buffer.from([data.length]),
            data,
        ])

        await this.client.send(
            udpPacket, 0, udpPacket.length,
            UDP_PORT,
            ip || BROADCAST_IP,
            () => {
                this.client.registerUse()

                if (cmdline['debug-wifi']) {
                    let bvalue = []
                    for (const value of data)
                        bvalue.push(value.toString(16))
                    logger.debug(`[WiFi] Data sent to IP:${ip || BROADCAST_IP} to:${toNode} data:${bvalue}`)
                }
            }
        )
    }

    server = null
    StartServer() {
        this.server = dgram.createSocket('udp4')

        this.server.on('close', function () {
            logger.debug('[WiFi] Server closed')
            this.server = null
        }.bind(this))

        this.server.on('error', function (error) {
            logger.error('[WiFi] Server error: ' + error)
            this.server.close()
        }.bind(this))

        this.server.on('listening', function () {
            var address = this.server.address()
            logger.info(`[WiFi] Started on port ${address.address}:${address.port}`)

            setTimeout(function () {
                this.sendLivePacketToAll()
            }.bind(this), 2000)
        }.bind(this))

        this.server.on('message', function (message, info) {

            if (message.length < 5) {
                logger.debug(`[WiFi] Invalid packet size (${message.length}) from ${info.address}`)
                return
            }

            const header = message.toString('utf8', 0, 2)
            if (header !== UDP_SIGN2) {
                logger.debug(`[WiFi] Invalid packet header (${header}) from ${info.address}`)
                return
            }

            const from = message.readUInt8(2)
            if (from === 0) return
            const to = message.readUInt8(3)
            if (to !== 0) return
            const size = message.readUInt8(4)
            if (message.length < 5 + size) {
                logger.debug(`[WiFi] Invalid packet size (${message.length} < ${5 + size}) from ${info.address}`)
                return
            }

            const data = message.slice(5, 5 + size)

            this.transmitstat.receiveCount += 1
            this.transmitstat.receiveSize += data.length

            if (cmdline['debug-wifi']) {
                let bvalue = []
                for (const value of data)
                    bvalue.push(value.toString(16))
                logger.debug(`[WiFi] Data IP:${info.address} from:${from} to:${to} data:${bvalue}`)
            }

            this.emit('receive', from, info.address, data)
        }.bind(this))

        this.server.bind(UDP_PORT)
    }

    StopServer() {
        this.isStopping = true
        if (this.server)
            this.server.close()
    }
}

const wifihandler = new WifiHandler()

if (config.wifi.enabled) {
    wifihandler.StartServer()

    setInterval(() => {
        if (!wifihandler.server && !wifihandler.isStopping)
            wifihandler.StartServer()
    }, 1000)
}

module.exports = wifihandler
