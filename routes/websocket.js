const fastifywebsocket = require('@fastify/websocket')

module.exports = (fastify) => {
  fastify.register(fastifywebsocket, { options: { maxPayload: 1024 } })

  fastify.register(async (fastify) => {
    fastify.get('/ws', { websocket: true }, (connection) => {
      connection.socket.on('message', () => {
        global.ws.handleClient(connection)
      })
    })
  })
}