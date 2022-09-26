const path = require('node:path')
const Fastify = require('fastify')
const pug = require('pug')
const routeInitializer = require('../routes')
const ip = require('./ip')

const fastify = Fastify({
  logger: false,
  bodyLimit: 2 * 1024 * 1024,
  trustProxy: true,
  ignoreTrailingSlash: true,
})
fastify.register(require('@fastify/helmet'), { contentSecurityPolicy: false })
fastify.register(require('@fastify/compress'), { global: false })
fastify.register(require('@fastify/etag'))
fastify.register(require('@fastify/view'), {
  engine: { pug },
  root: path.join(__dirname, '..', '/views'),
  options: {
    pretty: true,
    globals: [],
  }
})

fastify.decorateReply('noCache', function () {
  this.headers({
    'Surrogate-Control': 'no-store',
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  })
  return this
})

routeInitializer(fastify)

fastify.setNotFoundHandler((request, reply) => {
  logger.error(`[HTTP] 404 page not found: ${request.raw.url}`)

  if (request.method === 'POST')
    reply.status(500).send('404 Page not found')
  else
    reply.status(404).view('page404', { title: '404' })
})

fastify.setErrorHandler((error, request, reply) => {
  if (process.env.NODE_ENV !== 'production')
    logger.error(`[HTTP] 500 server error: ${request.raw.url} | ${error.message} ${error.stack}`)
  else
    logger.error(`[HTTP] 500 server error: ${request.raw.url} | ${error.message}`)

  if (request.method === 'POST')
    reply.status(500).send(error.message)
  else
    reply.status(500).view('page500', { title: '500', errortext: error.message })
})

  // eslint-disable-next-line unicorn/prefer-top-level-await
  ; (async () => {
    try {
      const webport = config.web.port
      await fastify.listen({ port: webport, host: '0.0.0.0' })
      logger.info(`[HTTP] Started on port ${webport}, open one of the addresses below:`)
      const portstr = (webport === 80) ? '' : `:${webport}`
      logger.info(`  http://localhost${portstr}\t\t[This computer]`)
      for (const [key, value] of Object.entries(ip.getIPAddresses()))
        logger.info(`  http://${value}${portstr}\t\t[${key}]`)
    } catch (error) {
      logger.error(`[HTTP] Server listen ${error}`)
      process.exit(1)
    }
  })()

module.exports = fastify
