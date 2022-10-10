const fs = require('node:fs')
const path = require('node:path')
const ini = require('ini')
const merge = require('merge-deep')
const { getConfigHome } = require('platform-folders')

let folderConfig = path.join(getConfigHome(), global.APPNAME)
let folderLog = path.join(getConfigHome(), global.APPNAME, 'log')

try {
  fs.mkdirSync(folderConfig, { recursive: true })
}
catch (error) {
  console.log(`Cannot create folder ${folderConfig}: ${error.message}`)
  folderConfig = './'
}

try {
  fs.mkdirSync(folderLog, { recursive: true })
}
catch (error) {
  console.log(`Cannot create folder ${folderLog}: ${error.message}`)
  folderLog = './log'
}

const configfilename = path.join(folderConfig, './config.ini')

function defaultConfig() {
  return {
    layout: 'default',
    web: {
      port: 8080,
    },
    rf24: {
      enabled: true,
      channel: 90,
      speed: 0,
    },
    wifi: {
      enabled: true,
    },
  }
}

let configResult = defaultConfig()
if (fs.existsSync(configfilename))
  try {
    const iniconfig = ini.parse(fs.readFileSync(configfilename, 'utf8'))
    configResult = merge(configResult, iniconfig)
    console.log(`Config loaded${cmdline.debug ? ' from ' + configfilename : ''}`)
    if (JSON.stringify(configResult) !== JSON.stringify(iniconfig)) {
      console.log('Update configfile format')
      try {
        fs.writeFileSync(configfilename, ini.stringify(configResult, { whitespace: true }))
      }
      catch (error) {
        console.log(`Cannot update config ${cmdline.debug ? ' error: ' + error.message : ''}`)
      }
    }
  }
  catch (error) {
    console.log(`Cannot parse config${cmdline.debug ? ' from ' + configfilename : ''}, default used.${cmdline.debug ? ' Error: ' + error.message : ''}`)
    configResult = defaultConfig()
  }
else {
  configResult = defaultConfig()
  console.log(`Cannot find config, create default${cmdline.debug ? ' to ' + configfilename : ''}`)
  try {
    fs.writeFileSync(configfilename, ini.stringify(configResult, { whitespace: true }))
  }
  catch (error) {
    console.log(`Cannot write config${cmdline.debug ? ' to ' + configfilename : ''}${cmdline.debug ? ', error: ' + error.message : ''}`)
  }
}
configResult.filenameConfig = configfilename
configResult.folderConfig = folderConfig
configResult.folderLog = folderLog

if (cmdline.port && typeof cmdline.port === 'number') configResult.web.port = cmdline.port
if (cmdline.layout && typeof cmdline.layout === 'string') configResult.layout = cmdline.layout

module.exports = configResult
