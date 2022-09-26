module.exports = (fastify) => {

  fastify.get('/session', async (request, reply) => {
    let counter = request.session.get('counter')
    if (Number.isNaN(counter))
      counter = 0
    counter++
    request.session.set('counter', counter)
    //console.log(counter)

    return reply.view('main', {
      text: 'text',
    })
  })

}
