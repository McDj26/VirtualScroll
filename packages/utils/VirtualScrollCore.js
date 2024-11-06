/**
 * 根据起始位置计算渲染范围
 * @param {[number, number]} startPosition 起始位置 [起始元素索引，起始元素offset]
 * @param {[number, number]} renderInfo 渲染信息 [视口高度，预渲染高度]
 * @param {(index: number) => number} getHeight 高度计算函数
 * @returns {[number, number, number]} 计算结果 [起始索引，结束索引，列表长度]
 */
function getRenderRange(startPosition, renderInfo, getHeight) {
  const [startIndex, offset] = startPosition
  const [viewHeight, paddingHeight] = renderInfo
  const renderHeight = offset + viewHeight + paddingHeight
  let endIndex = startIndex
  let height = getHeight(endIndex)
  let currentPosition = 0
  while (height >= 0 && currentPosition < renderHeight) {
    currentPosition += height
    height = getHeight(++endIndex)
  }
  return [startIndex, endIndex, currentPosition]
}

/**
 * 根据起始位置和移动距离计算新的起始位置
 * @param {[number, number]} startPosition 起始位置 [起始元素索引，起始元素offset]
 * @param {number} delta 移动距离
 * @param {[number, number, number]} renderInfo 渲染信息 [视口高度，预渲染高度，列表高度]
 * @param {(index: number) => number} getHeight 高度计算函数
 * @returns {[number, number]} 新的起始位置
 */
function move(startPosition, delta, renderInfo, getHeight) {
  let [startIndex, offset] = startPosition
  const [viewHeight, paddingHeight, listHeight] = renderInfo

  let newOffset = offset

  if (delta > 0) {
    // 向下滚动
    let restHeight = listHeight - offset - viewHeight
    if (restHeight < delta) {
      // 计算剩余高度，限制移动距离
      let [_, endIndex] = getRenderRange(startPosition, renderInfo, getHeight)
      let nextElementHeight = getHeight(endIndex)
      while (restHeight < delta && nextElementHeight >= 0) {
        restHeight += nextElementHeight
        nextElementHeight = getHeight(++endIndex)
      }
      delta = Math.min(delta, restHeight)
    }
    newOffset = offset + delta

    // 向后移动，直到offset >= paddingHeight
    let height = getHeight(startIndex)
    while (height >= 0 && newOffset - height >= paddingHeight) {
      newOffset -= height
      height = getHeight(++startIndex)
    }
    if (height < 0 && startIndex > 0) startIndex--
  } else if (delta < 0) {
    // 向上滚动
    newOffset = offset + delta
    if (newOffset < paddingHeight) {
      // 向前移动，直到offset >= paddingHeight
      let height = getHeight(--startIndex)
      while (newOffset < paddingHeight && height >= 0) {
        newOffset += height
        height = getHeight(--startIndex)
      }
      startIndex++
      newOffset = Math.max(0, newOffset)
    }
  }

  return [startIndex, newOffset]
}

/**
 * 缓存元素高度，容量默认为1000
 * @param {(index: number) => number} getHeight 获取元素高度函数
 * @returns {{updateHeight: (index: number) => void; wrappedGetHeight: (index: number) => number}}
 */
function withHeightCache(getHeight) {
  const cache = new Proxy(new LRUCache(1000), {
    get(target, key) {
      return target.get(key)
    },
    set(target, key, value) {
      target.set(key, value)
      return true
    },
  })
  const updateHeight = index => {
    return (cache[index] = getHeight(index))
  }
  const wrappedGetHeight = index => {
    return cache[index] || updateHeight(index)
  }
  return { updateHeight, wrappedGetHeight }
}

export { getRenderRange, move, withHeightCache }

class LinkListNode {
  prev
  next
  val

  /**
   * @param {any} val
   * @param {LinkListNode} prev
   * @param {LinkListNode} next
   */
  constructor(val = undefined, prev = undefined, next = undefined) {
    this.val = val
    this.next = next || this
    this.prev = prev || this
  }

  /**
   * @param {LinkListNode} target
   * @param {LinkListNode} newNode
   */
  static insertAfter(target, newNode) {
    let nextNode = target.next
    newNode.prev = target
    newNode.next = nextNode
    target.next = newNode
    nextNode.prev = newNode
  }

  /**
   * @param {LinkListNode} target
   */
  static delete(target) {
    let prev = target.prev
    let next = target.next
    prev.next = next
    next.prev = prev
  }
}

class LRUCache {
  #map
  #root
  #listLength
  volume

  constructor(volume) {
    this.volume = Math.max(volume, 10)

    this.#map = this.#mapConstructor({})
    this.#root = new LinkListNode()
    this.#listLength = 0
  }

  get(key) {
    return this.#map[key]
  }

  set(key, val) {
    this.#map[key] = val
  }

  remove(key) {
    delete this.#map[key]
  }

  clear() {
    this.#map = this.#mapConstructor({})
    this.#root = new LinkListNode()
    this.#listLength = 0
  }

  #mapConstructor(target) {
    return new Proxy(target, {
      get: (target, key) => {
        let result = target[key]
        if (result) {
          LinkListNode.delete(result)
          LinkListNode.insertAfter(this.#root, result)
        }
        return result?.val
      },
      set: (target, key, val) => {
        let node = target[key]
        if (node) {
          node.val = val
          LinkListNode.delete(node)
          this.#listLength--
        } else {
          node = new LinkListNode(val)
          node.key = key
          target[key] = node
          if (this.#listLength === this.volume) {
            delete target[this.#root.prev.key]
            LinkListNode.delete(this.#root.prev)
            this.#listLength--
          }
        }
        LinkListNode.insertAfter(this.#root, node)
        this.#listLength++
        return true
      },
      deleteProperty: (target, key) => {
        let node = target[key]
        if (node) {
          LinkListNode.delete(node)
          delete target[key]
          this.#listLength--
        }
        return true
      },
    })
  }
}

export { LRUCache }
