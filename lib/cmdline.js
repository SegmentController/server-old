const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    description: 'Override web port'
  })
  .option('layout', {
    alias: 'l',
    description: 'Use other layout than default[.layout]'
  })
  .option('debug', {
    alias: 'd',
    description: 'Show more details in log'
  })
  .option('debug-rf24', {
    description: 'Show RF packets in log'
  })
  .option('debug-wifi', {
    description: 'Show WIFI packets in log'
  })
  .option('debug-ws', {
    description: 'Show websocket packets in log'
  })
  .version('version')
  .help('help', 'Show this help')
  .argv

module.exports = argv
