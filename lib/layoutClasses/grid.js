class GridItem {
  x = 0
  y = 0
  element = null
  constructor(x, y, element) {
    this.x = x
    this.y = y
    this.onInitItem(element)
  }
  onInitItem(element) { this.element = element }
  onUpdateItem() { this }
}

class Grid {
  items = []

  getItem(x, y) {
    for (const item of this.items)
      if (item.x === x && item.y === y)
        return item
    return null
  }

  getItems() { return this.items }

  hasLeftTo(item) { return this.getItem(item.x - 1, item.y) }
  hasRightTo(item) { return this.getItem(item.x + 1, item.y) }
  hasOverTo(item) { return this.getItem(item.x, item.y - 1) }
  hasUnderTo(item) { return this.getItem(item.x, item.y + 1) }

  hasLeftOverTo(item) { return this.getItem(item.x - 1, item.y - 1) }
  hasRightOverTo(item) { return this.getItem(item.x + 1, item.y - 1) }
  hasLeftUnderTo(item) { return this.getItem(item.x - 1, item.y + 1) }
  hasRightUnderTo(item) { return this.getItem(item.x + 1, item.y + 1) }

  getNeighbours(item) {
    const result =
    {
      left: this.hasLeftTo(item),
      right: this.hasRightTo(item),
      over: this.hasOverTo(item),
      under: this.hasUnderTo(item),
      leftover: this.hasLeftOverTo(item),
      rightover: this.hasRightOverTo(item),
      leftunder: this.hasLeftUnderTo(item),
      rightunder: this.hasRightUnderTo(item),
    }

    result
    return result
  }

  isOverlap(x, y, w, h) {
    for (let windex = 0; windex < w; windex++)
      for (let hindex = 0; hindex < h; hindex++)
        if (this.getItem(x + windex, y + hindex))
          return true
    return false
  }

  isMatch(element) {
    if (!element) return false
    if (!('x' in element)) return false
    if (!('y' in element)) return false
    if (!('width' in element)) return false
    if (!('height' in element)) return false

    return this.isOverlap(element.x, element.y, element.width, element.height)
  }

  insert(element, griditemclass) {
    for (let windex = 0; windex < element.width; windex++)
      for (let hindex = 0; hindex < element.height; hindex++) {
        const item = this.getItem(element.x + windex, element.y + hindex)
        if (item)
          item.onUpdateItem(element)
        else
          this.items.push(new griditemclass(element.x + windex, element.y + hindex, element))
      }
  }

  tryInsert(element, griditemclass) {
    if (!element) return false

    if (this.items.length === 0) {
      this.insert(element, griditemclass)
      return true
    }

    if (this.isMatch(element)) {
      this.insert(element, griditemclass)
      return true
    }
    return false
  }

  getContourLines() {
    const result = []
    for (const item of this.items) {
      if (!this.hasLeftTo(item)) result.push({ from: { x: item.x, y: item.y }, to: { x: item.x, y: item.y + 1 }, item })
      if (!this.hasRightTo(item)) result.push({ from: { x: item.x + 1, y: item.y }, to: { x: item.x + 1, y: item.y + 1 }, item })
      if (!this.hasOverTo(item)) result.push({ from: { x: item.x, y: item.y }, to: { x: item.x + 1, y: item.y }, item })
      if (!this.hasUnderTo(item)) result.push({ from: { x: item.x, y: item.y + 1 }, to: { x: item.x + 1, y: item.y + 1 }, item })
    }
    return result
  }

  static generateGridsFrom(gridclass, griditemclass, elements) {
    if (!elements || elements.length === 0) return []

    const result = []
    const _elements = [...elements]

    while (_elements.length > 0) {
      let insertion = false
      for (let index = _elements.length - 1; index >= 0; index--)
        for (const grid of result)
          if (grid.tryInsert(_elements[index], griditemclass)) {
            _elements.splice(index, 1)
            insertion = true
          }
      if (!insertion) {
        const newGrid = new gridclass()
        newGrid.insert(_elements.shift(), griditemclass)
        result.push(newGrid)
      }
    }

    return result
  }
}

module.exports = { Grid, GridItem }