const Router = require('fastify-route-group').Router

const LayoutSegmentTrack = require('../lib/layoutClasses/layoutSegmentTrack')
const LayoutSegmentTurnout = require('../lib/layoutClasses/layoutSegmentTurnout')
const LayoutSegmentSignal = require('../lib/layoutClasses/layoutSegmentSignal')
const LayoutSegmentSurface = require('../lib/layoutClasses/layoutSegmentSurface')
const { LayoutSegmentButton, LayoutSegmentSound, LayoutSegmentAmbientLight } = require('../lib/layoutClasses')

const PUG_GLYPHSHOW = 'glyph/show'

module.exports = (fastify) => {
  const router = new Router(fastify)

  // eslint-disable-next-line sonarjs/cognitive-complexity
  router.namespace('glyph', () => {
    router.namespace('track', () => {
      router.get('', async (request, reply) => {
        const layout = layoutManager.getLayout()

        const glyphs = []
        const types = LayoutSegmentTrack.getTypes()
        for (const type in types)
          glyphs.push({
            type: type,
            name: types[type],
            url: `/glyph/track/${type}`,
          })
        return reply.noCache().view(PUG_GLYPHSHOW,
          {
            title: 'Track glyphs',
            glyphs,
            blockSize: layout.blockSize
          })
      })
      router.get(':type', async (request, reply) => {
        const type = request.params.type

        if (!(type in LayoutSegmentTrack.getTypes()))
          throw new Error(`Invalid track type ${type}`)

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentTrack(0, 0, type).getImage(layout)
      })
    })
    router.namespace('turnout', () => {
      router.get('', async (request, reply) => {
        const layout = layoutManager.getLayout()

        const glyphs = []
        const types = LayoutSegmentTurnout.getTypes()
        for (const type in types)
          glyphs.push({
            type: type,
            name: types[type],
            url: `/glyph/turnout/${type}`,
            url2: `/glyph/turnout/${type}/0`,
            url3: `/glyph/turnout/${type}/1`,
          })
        return reply.noCache().view(PUG_GLYPHSHOW,
          {
            title: 'Turnout glyphs',
            glyphs,
            blockSize: layout.blockSize
          })
      })
      router.get(':type', async (request, reply) => {
        const type = request.params.type

        if (!(type in LayoutSegmentTurnout.getTypes()))
          throw new Error(`Invalid turnout type ${type}`)

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentTurnout(0, 0, 0, 0, type).getImage(layout)
      })
      router.get(':type/:state', async (request, reply) => {
        const type = request.params.type
        const state = Number.parseInt(request.params.state, 10) ? true : false

        if (!(type in LayoutSegmentTurnout.getTypes()))
          throw new Error(`Invalid turnout type ${type}`)

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentTurnout(0, 0, 0, 0, type).getImage(layout, state)
      })
    })
    router.namespace('signal', () => {
      router.get('', async (request, reply) => {
        const layout = layoutManager.getLayout()

        const glyphs = []
        const types = LayoutSegmentSignal.getTypes()
        for (const type in types)
          for (const bulb of ['W', 'RG', 'GYR', 'GYRY', 'RGRY'])
            glyphs.push(
              {
                type: type,
                name: `${types[type]} ${bulb}`,
                url: `/glyph/signal/${type}/${bulb}`,
              })
        return reply.noCache().view(PUG_GLYPHSHOW,
          {
            title: 'Signal glyphs [W, RG, GYR, GYRY, RGRY]',
            glyphs,
            blockSize: layout.blockSize
          })
      })
      router.get(':type/:bulbs', async (request, reply) => {
        const type = request.params.type
        const bulbs = request.params.bulbs

        if (!(type in LayoutSegmentSignal.getTypes()))
          throw new Error(`Invalid signal type ${type}`)
        if (!(LayoutSegmentSignal.isValidBulbs(bulbs)))
          throw new Error(`Invalid signal bulbs ${bulbs}`)

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentSignal(0, 0, 0, 0, type, bulbs).getImage(layout)
      })
    })
    router.namespace('accessories', () => {
      router.get('', async (request, reply) => {
        const layout = layoutManager.getLayout()

        const glyphs = []
        glyphs.push(
          {
            name: 'Button',
            url: '/glyph/accessories/button',
            url2: '/glyph/accessories/button?color=00AA00',
            url3: '/glyph/accessories/button?color=AA0000',
          },
          {
            name: 'Light',
            url: '/glyph/accessories/light',
            url2: '/glyph/accessories/light/1',
          },
          {
            name: 'Sound',
            url: '/glyph/accessories/sound',
            url2: '/glyph/accessories/sound/1',
          },
        )
        return reply.noCache().view(PUG_GLYPHSHOW,
          {
            title: 'Accessories glyphs',
            glyphs,
            blockSize: layout.blockSize
          })
      })
      router.get('button', async (request, reply) => {
        let color = request.query.color || 'aaa'
        if (!color.startsWith('#')) color = '#' + color

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentButton(0, 0, '', color).getImage(layout)
      })
      router.get('light', async (request, reply) => {
        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentAmbientLight(0, 0, 0, 0).getImage(layout)
      })
      router.get('light/:state', async (request, reply) => {
        const state = Number.parseInt(request.params.state, 10) ? true : false

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentAmbientLight(0, 0, 0, 0).getImage(layout, state)
      })
      router.get('sound', async (request, reply) => {
        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentSound(0, 0, 0, 0).getImage(layout)
      })
      router.get('sound/:state', async (request, reply) => {
        const state = Number.parseInt(request.params.state, 10) ? true : false

        const layout = layoutManager.getLayout()

        reply.type('image/png')
        return new LayoutSegmentSound(0, 0, 0, 0).getImage(layout, state)
      })
    })
    router.get('surface', async (request, reply) => {
      let color = request.query.color || '4080A0'
      if (!color.startsWith('#')) color = '#' + color
      const size = Number(request.query.size) || 32

      reply.type('image/png')
      return LayoutSegmentSurface.getSquareImage(size, color)
    })
  })
}
