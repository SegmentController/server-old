/* eslint-disable sonarjs/cognitive-complexity */
const Router = require('fastify-route-group').Router
const Color = require('color')

const LayoutSegmentTrack = require('../lib/layoutClasses/layoutSegmentTrack')
const LayoutSegmentTurnout = require('../lib/layoutClasses/layoutSegmentTurnout')
const LayoutSegmentSignal = require('../lib/layoutClasses/layoutSegmentSignal')

module.exports = (fastify) => {
  const router = new Router(fastify)

  const URL_SEGMENT_ID = 'segment/:id(^\\d{1,3}$)'

  router.namespace('editor', () => {
    router.get('', async (request, reply) => { reply.redirect('/editor/layout') })
    router.namespace('layout', () => {
      router.get('', async (request, reply) => {
        const layout = layoutManager.getLayout()
        return reply.noCache().view('editor/layout',
          {
            title: 'Layout editor',
            topMargin: 64,
            bgColor: layout.worldColor,

            blockSize: layout.blockSize,
            worldColor: layout.worldColor,
            surfaceMargin: layout.surfaceMargin,
            segments: layout.getAllSegments(),
            nextId: layout.getNextAvailableId(),
          })
      })
      router.namespace('add', () => {
        router.post('segment', async (request) => {
          layoutManager.getLayout().addNewSegment(Number(request.body.id), request.body.name)
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
      })
      router.namespace('set', () => {
        router.post('blocksize', async (request) => {
          layoutManager.getLayout().setBlockSize(Number(request.body.blockSize))
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
        router.post('worldcolor', async (request) => {
          layoutManager.getLayout().setWorldColor(request.body.worldColor)
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
        router.post('surfacemargin', async (request) => {
          layoutManager.getLayout().setSurfaceMargin(Number(request.body.surfaceMargin))
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
        router.post('segmentlocations', async (request) => {
          layoutManager.getLayout().setSegmentLocations(JSON.tryParse(request.body.locations))
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
        router.post('segmentname', async (request) => {
          layoutManager.getLayout().setSegmentName(Number(request.body.id), request.body.name)
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
        router.post('segmentid', async (request) => {
          layoutManager.getLayout().setSegmentId(Number(request.body.id), Number(request.body.newid))
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
      })
      router.namespace('delete', () => {
        router.post('segment', async (request) => {
          layoutManager.getLayout().deleteSegmentById(Number(request.body.id))
          layoutManager.saveLayoutToFile()
          return JSON.empty
        })
      })
    })

    router.namespace(URL_SEGMENT_ID, () => {
      router.get('', async (request, reply) => {
        const layout = layoutManager.getLayout()
        const segment = layout.getSegmentById(request.params.id)

        const usedSurfaceColors = {}
        for (const segment of layout.getAllSegments())
          for (const surface of segment.surfaces)
            if (!(surface.color in usedSurfaceColors))
              usedSurfaceColors[surface.color] = `${surface.text || 'noname'} in ${segment.name}`

        return reply.noCache().view('editor/segment',
          {
            title: 'Segment editor',
            topMargin: 64,
            bgColor: segment.baseColor,
            invertBgColor: Color(segment.baseColor).negate().hex(),

            blockSize: layout.blockSize,
            predefinedSurfaceColors: layout.predefinedSurfaceColors,
            usedSurfaceColors,

            segment,
            firsttracktype: Object.keys(LayoutSegmentTrack.getTypeGroups())[0],
            tracktypegroups: LayoutSegmentTrack.getTypeGroups(),
            firstturnouttype: Object.keys(LayoutSegmentTurnout.getTypeGroups())[0],
            turnouttypegroups: LayoutSegmentTurnout.getTypeGroups(),
            firstsignaltype: Object.keys(LayoutSegmentSignal.getTypes())[0],
            signaltypes: LayoutSegmentSignal.getTypes(),
          })
      })
      router.namespace('set', () => {
        router.post('baseColor', async (request) => {
          const segment = layoutManager.getLayout().getSegmentById(request.params.id)
          if (segment) {
            segment.setBaseColor(request.body.baseColor)
            layoutManager.saveLayoutToFile()
          }
          return JSON.empty
        })
        router.post('elements', async (request) => {
          const segment = layoutManager.getLayout().getSegmentById(request.params.id)
          if (segment) {
            segment.setElements(JSON.tryParse(request.body.elements))
            layoutManager.saveLayoutToFile()
          }
          return JSON.empty
        })
      })
    })

  })
}
