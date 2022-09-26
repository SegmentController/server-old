//const Router = require('fastify-route-group').Router

const beautify = require('js-beautify').js

module.exports = (fastify) => {

    fastify.get('/code/show', async (request, reply) => {
        const code = global.layoutManager.getCode()
        const codelasterror = global.layoutManager.getCodeLastError()

        const allSegments = global.layoutManager.getLayout().getAllSegments().map(s => global.name2codename(s.name)).sort().join(', ')

        let availableSegments = []
        for (const id of global.segments.GetSegmentIds()) {
            const segment = global.segments.FindSegmentById(id)
            if (segment && segment.GetMode()) {
                const layoutSegment = global.layoutManager.getLayout().getSegmentById(id)
                if (layoutSegment) {
                    const codename = global.name2codename(layoutSegment.name)
                    //availableSegments.push(codename)
                    const panels = segment.GetValidPanels()
                    for (const panel of Object.keys(panels))
                        availableSegments.push(`${codename}.${panels[panel].codeid}`)
                    for(const button of layoutSegment.buttons)
                        availableSegments.push(`${codename}.buttons.${button.name}`)
                }
            }
        }
        availableSegments = availableSegments.join(', ')

        return reply.noCache().view('dashboardcodeeditor/show', {
            title: 'Code for automations',
            code,
            codelasterror,
            allSegments,
            availableSegments,
        })
    })

    fastify.post('/code/save', async (request) => {
        const code = request.body.code
        global.layoutManager.updateCode(code)

        return JSON.empty
    })

    fastify.post('/code/format', async (request) => {
        const code = request.body.code
        // eslint-disable-next-line camelcase
        let codeFormatted = beautify(code, { indent_size: 2, wrap_line_length: 80 })
        codeFormatted += '\n'

        return codeFormatted
    })
}