const Router = require('fastify-route-group').Router

module.exports = (fastify) => {
  const router = new Router(fastify)

  const URL_SEGMENT_ID = 'segment/:id(^\\d{1,3}$)'

  router.namespace('layout', () => {
    router.get('background', async (request, reply) => {
      const layout = layoutManager.getLayout()

      reply.type('image/png')
      return layout.getImage()
    })

    router.get(URL_SEGMENT_ID, async (request, reply) => {
      const id = Number(request.params.id)

      const layout = layoutManager.getLayout()
      const segment = layout.getSegmentById(id)

      reply.type('image/png')
      return segment.getImage(layout)
    })

  })

}
