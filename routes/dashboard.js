/* eslint-disable sonarjs/cognitive-complexity */
const Router = require('fastify-route-group').Router

module.exports = (fastify) => {

  fastify.get('/', async (request, reply) => {
    const layout = layoutManager.getLayout()
    const segments = layout.segments
    for (const segment of segments) {
      for (const signal of segment.signals)
        signal.currentstate = signal.getCurrentState(segment.id)
      for (const turnout of segment.turnouts)
        turnout.currentstate = turnout.getCurrentState(segment.id)
      for (const light of segment.ambientLights)
        light.currentstate = light.getCurrentState(segment.id)
      for (const sound of segment.sounds)
        sound.currentstate = sound.getCurrentState(segment.id)
    }

    return reply.noCache().view('dashboard/main', {
      title: 'Dashboard',

      backColor: layout.worldColor,
      backgroundSize: layout.getImageSize(),
      layoutLastModify: layout.lastModify,

      blockSize: layout.blockSize,
      segments: segments,
    })
  })

  const router = new Router(fastify)

  router.namespace('op/:segmentid', () => {
    router.namespace('signal/:panelindex', () => {
      router.post('toggle/:index', (request, reply) => {
        const segmentid = Number(request.params.segmentid)
        const panelindex = Number(request.params.panelindex)
        const index = Number(request.params.index)

        const signal = global.segments.AccessSegmentById(segmentid).getSignal(panelindex)
        if (signal)
          signal.ToggleSignal(index - 1)
        reply.send()
      })
      router.post('set/:index/:state', (request, reply) => {
        const segmentid = request.params.segmentid
        const panelindex = request.params.panelindex
        const index = request.params.index
        const state = request.params.state

        if (global.segments.SegmentExists(segmentid)) {
          const signal = global.segments.AccessSegmentById(segmentid).getSignal(panelindex)
          if (signal)
            signal.SetSignal(index, state)
        }
        reply.send()
      })
    })
    router.namespace('turnout/:panelindex', () => {
      router.post('toggle/:index', (request, reply) => {
        const segmentid = Number(request.params.segmentid)
        const panelindex = Number(request.params.panelindex)
        const index = Number(request.params.index)

        const turnout = global.segments.AccessSegmentById(segmentid).getTurnout(panelindex)
        if (turnout)
          turnout.ToggleTurnout(index - 1)
        reply.send()
      })
      router.post('set/:index/:state', (request, reply) => {
        const segmentid = request.params.segmentid
        const panelindex = request.params.panelindex
        const index = request.params.index
        const state = request.params.state

        if (global.segments.SegmentExists(segmentid)) {
          const turnout = global.segments.AccessSegmentById(segmentid).getTurnout(panelindex)
          if (turnout)
            turnout.SetTurnout(index, state)
        }
        reply.send()
      })
    })
    router.namespace('ambientlight/:panelindex', () => {
      router.post('toggle/:index', (request, reply) => {
        const segmentid = Number(request.params.segmentid)
        const panelindex = Number(request.params.panelindex)
        const index = Number(request.params.index)

        const light = global.segments.AccessSegmentById(segmentid).getAmbientLight(panelindex)
        if (light)
          switch (index) {
            case 0:
              light.ToggleNight()
              break
            case 7:
            case 8:
              light.ToggleEffect(index - 7)
              break
            default:
              light.ToggleLight(index - 1)
              break
          }
        reply.send()
      })
      router.post('set/:index/:state', (request, reply) => {
        const segmentid = request.params.segmentid
        const panelindex = request.params.panelindex
        const index = request.params.index
        const state = request.params.state

        if (global.segments.SegmentExists(segmentid)) {
          const light = global.segments.AccessSegmentById(segmentid).getAmbientLight(panelindex)
          if (light)
            switch (index - 1) {
              case 0:
                light.SetNight(state)
                break
              case 7:
              case 8:
                light.SetEffect(index - 7, state)
                break
              default:
                light.SetLight(index - 1, state)
                break
            }
        }
        reply.send()
      })
    })
    router.namespace('sound', () => {
      router.post('play/:index', (request, reply) => {
        const segmentid = Number(request.params.segmentid)
        const index = Number(request.params.index)

        const sound = global.segments.AccessSegmentById(segmentid).sound
        if (sound)
          sound.Play(index)
        reply.send()
      })
    })
    router.post('button', (request, reply) => {
      const segmentid = Number(request.params.segmentid)

      const button = request.body.name

      if (button)
        global.segments.AccessSegmentById(segmentid).buttons.call(button)
      reply.send()
    })
  })

}
