const fs = require('node:fs')
const path = require('node:path')
const glob = require('glob')
const dayjs = require('dayjs')
const winston = require('winston')

const nowformat = dayjs().format('YYYY-MM-DD HHmmss')
const todayformat = dayjs().format('YYYY-MM-DD')

const loggerResult = winston.createLogger({
  level: cmdline.debug ? 'debug' : 'info',
  format: cmdline.debug ?
    winston.format.printf(({ level, message, timestamp }) => {
      return `${dayjs(timestamp).format('HH:mm:ss')} [${level}] ${message}`
    })
    :
    winston.format.printf(({ level, message }) => {
      if (level === 'info')
        level = ''
      return `${level}${message}`
    }),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(config.folderLog, `${nowformat}.error.log`), level: 'error' }),
    new winston.transports.File({ filename: path.join(config.folderLog, `${nowformat}.log`) })
  ]
})

loggerResult.removeOldLogs = () => {
  const folderLogArchive = path.join(config.folderLog, 'archive')
  loggerResult.debug('Archiving old log files')
  try {
    fs.mkdirSync(folderLogArchive, { recursive: true })

    for (const file of glob.sync(path.join(config.folderLog, '*.log'))) {
      const filename = path.basename(file)
      if (!filename.startsWith(todayformat)) {
        const date = filename.slice(0, 'YYYY-MM-DD'.length)
        const folderLogArchiveDate = path.join(folderLogArchive, date)
        fs.mkdirSync(folderLogArchiveDate, { recursive: true })
        fs.renameSync(file, path.join(folderLogArchiveDate, filename))
      }
    }
  }
  catch (error) {
    loggerResult.error(`Cannot archive logs because ${error.message}`)
  }
}

loggerResult.removeOldLogs()
const AUTOREMOVEOLDLOGHOURS = 6
setInterval(loggerResult.removeOldLogs, AUTOREMOVEOLDLOGHOURS * 60 * 60 * 1000)
loggerResult.debug(`Archiving scheduled: every ${AUTOREMOVEOLDLOGHOURS}h`)

module.exports = loggerResult
