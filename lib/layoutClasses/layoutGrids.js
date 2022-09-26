const Color = require('color')

const { GridItem } = require('./grid')

class SurfaceGridItem extends GridItem {
  onInitItem(element) {
    super.onInitItem(element)
    this.color = element.color
  }
  onUpdateItem(element) {
    super.onUpdateItem(element)

    if (this.color !== element.color)
      this.color = Color(this.color).mix(Color(element.color)).hex()
  }
  // eslint-disable-next-line sonarjs/cognitive-complexity
  draw(context2d, layout, segment, grid) {
    const bs = layout.blockSize
    const tm = layout.surfaceMargin

    const neighbours = grid.getNeighbours(this)

    const leftMargin = neighbours.left ? 0 : tm
    const rightMargin = neighbours.right ? 0 : tm
    const topMargin = neighbours.over ? 0 : tm
    const bottomMargin = neighbours.under ? 0 : tm

    context2d.fillStyle = this.color
    context2d.fillRect(this.x * bs + leftMargin, this.y * bs + topMargin, bs - leftMargin - rightMargin, bs - topMargin - bottomMargin)

    context2d.fillStyle = segment.baseColor
    if (!neighbours.leftover && (neighbours.left || neighbours.over)) context2d.fillRect(this.x * bs, this.y * bs, tm, tm)
    if (!neighbours.leftunder && (neighbours.left || neighbours.under)) context2d.fillRect(this.x * bs, (this.y + 1) * bs - tm, tm, tm)
    if (!neighbours.rightover && (neighbours.right || neighbours.over)) context2d.fillRect((this.x + 1) * bs - tm, this.y * bs, tm, tm)
    if (!neighbours.rightunder && (neighbours.right || neighbours.under)) context2d.fillRect((this.x + 1) * bs - tm, (this.y + 1) * bs - tm, tm, tm)
  }
}

module.exports = {
  SurfaceGridItem
}
