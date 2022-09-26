require('./lib/nodeExtension')

global.APPNAME = 'SegmentControllerServer'
global.APPVERSION = require('./package.json').version

console.log(`${global.APPNAME} (v${global.APPVERSION})`)

require('./lib/dayjsLoader')
global.cmdline = require('./lib/cmdline')
if (!cmdline.debug)
  process.env.NODE_ENV = 'production'

global.runtimeConfig = require('./lib/runtimeConfig')
global.config = require('./lib/config')
global.logger = require('./lib/logger')
global.rf24 = require('./lib/rf24')
global.wifi = require('./lib/wifi')
global.segments = require('./lib/segments')(global.rf24, global.wifi)
global.ws = require('./lib/webSocketHandler')
global.layoutManager = require('./lib/layoutManager')
global.http = require('./lib/http')

const gracefullyClose = async function gfClose(signal) {
  console.log(`[Process] Bye (${signal})...`)

  const forceClose = setTimeout(() => process.exit(1), 1500)

  // if (global.wifi)
  //   global.wifi.StopServer()

  if (global.ws)
    global.ws.close()

  if (global.http)
    global.http.close()
      .then(() => {
        console.log('[HTTP] Server closed')
        clearTimeout(forceClose)
        return process.exit(0)
      })
      .catch((error) => {
        console.log(`[HTTP] Server close error: ${error}`)
        return process.exit(1)
      })
}
process.on('SIGTERM', gracefullyClose)
process.on('SIGINT', gracefullyClose)
process.on('SIGUSR2', gracefullyClose)

process.on('uncaughtException', function (error) {
  if (!global.layoutManager.dispatchErrorToExecutor(error))
    throw error
})

global.segments.InitializeEventsToDashboard()
