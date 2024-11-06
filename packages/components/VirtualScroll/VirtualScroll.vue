<template>
  <div class="virtual-scroll_container" ref="container">
    <ul
      class="virtual-scroll_wrapper"
      :style="{ transform: `translateY(-${startPosition[1]}px)` }"
      @wheel.prevent="onWheel"
      @touchstart="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <li
        v-for="(i, index) in renderRange"
        :key="props.items[i].key || index"
        class="virtual-scroll_item"
        v-watch-size="el => elementResize(i, el)"
        v-auto-record:mounted="el => elementMap.set(i, el)"
        v-auto-record:unmounted="() => elementMap.delete(i)"
      >
        <slot :item="props.items[i]"></slot>
      </li>
    </ul>
    <div
      v-if="props.placeholder !== undefined && props.preserved === undefined"
      class="virtual-scroll_placeholder"
      ref="placeHolder"
      v-watch-size="setPreserved"
    >
      <slot :item="props.placeholder"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import TransitionController from '@pkg/utils/TransitionController'
import {
  getRenderRange,
  move,
  withHeightCache,
} from '@pkg/utils/VirtualScrollCore'
import { computed, ref, watch } from 'vue'
// 导入自定义指令
import vAutoRecord from '@pkg/directives/vAutoRecord'
import vWatchSize from '@pkg/directives/vWatchSize'

defineOptions({
  name: 'VirtualScroll',
})

type VirtualScrollItem = {
  key?: any
  height?: number
  [k: string | symbol]: any
}

const props = withDefaults(
  defineProps<{
    items: VirtualScrollItem[]
    placeholder?: VirtualScrollItem
    startPosition?: [number, number]
    preserved?: number
    padding?: number
  }>(),
  {
    startPosition: () => [0, 0],
    padding: 100,
  },
)

// 通过默认元素获取保留高度
const placeHolder = ref()
const placeHolderHeight = ref(100)
const setPreserved = () => {
  placeHolderHeight.value =
    placeHolder.value?.getBoundingClientRect().height || 5
}
const preserved = computed(() =>
  props.preserved !== undefined
    ? Math.max(5, props.preserved)
    : placeHolderHeight.value,
)

const elementMap = new Map<number, HTMLElement>()
const { wrappedGetHeight: getHeight, updateHeight } = withHeightCache(index =>
  index < props.items.length && index >= 0
    ? props.items[index].height !== undefined
      ? props.items[index].height
      : elementMap.get(index)?.getBoundingClientRect().height || preserved.value
    : -1,
)

const container = ref()
const startPosition = ref(props.startPosition)
const renderTrigger = ref(true)
const renderInfo = ref([0, 0, 0])
let oldRenderInfo: [number, number, number] = [0, 0, 0]
watch(
  [renderTrigger, preserved, startPosition, container, () => props.padding],
  () => {
    const newRenderInfo = getRenderRange(
      startPosition.value,
      [
        (<HTMLElement>container.value)?.getBoundingClientRect().height || 0,
        props.padding,
      ],
      getHeight,
    )
    if (
      newRenderInfo[0] >= oldRenderInfo[0] &&
      newRenderInfo[1] <= oldRenderInfo[1]
    )
      newRenderInfo[1] = oldRenderInfo[1]
    oldRenderInfo = newRenderInfo
    renderInfo.value = newRenderInfo
  },
)

const renderRange = computed(() => {
  return new Array(renderInfo.value[1] - renderInfo.value[0])
    .fill(0)
    .map((_, i) => renderInfo.value[0] + i)
})

const elementResize = (index: number, element: HTMLElement) => {
  const cur = element.getBoundingClientRect().height
  const pre = getHeight(index)
  let isInPaddingRange = false
  if (cur === pre) return

  // 判断高度变化的元素是否在预加载区间
  let offset = startPosition.value[1]
  let itemIndex = startPosition.value[0]
  let height = getHeight(itemIndex)
  while (height >= 0 && offset > 0) {
    if (itemIndex === index) {
      isInPaddingRange = true
      break
    }
    offset -= height
    height = getHeight(++itemIndex)
  }

  // 更新高度缓存
  updateHeight(index)

  if (isInPaddingRange) {
    // 如果高度变化的元素在预加载区间内，将offset加上高度变化量
    startPosition.value[1] += cur - pre
  } else if (cur < pre) {
    // 如果高度变化的元素不在预加载区间内，重新渲染
    renderTrigger.value = !renderTrigger.value
  }
}

const controller = new TransitionController(startPosition.value[1])

const scrollTransition = (
  delta: number,
  duration: number,
  taskId: number,
  timingFn?: (startVal: number, endVal: number, progress: number) => number,
) => {
  if (delta === 0) return taskId
  if (controller.taskId !== taskId) {
    let rec = 0
    controller.cancelTask()
    return controller.addTask(
      delta,
      currentVal => {
        startPosition.value = move(
          startPosition.value,
          currentVal - rec,
          [
            (<HTMLElement>container.value).getBoundingClientRect().height,
            props.padding,
            renderInfo.value[2],
          ],
          getHeight,
        )
        rec = currentVal
      },
      duration,
      0,
      timingFn,
    )
  } else {
    controller.updateTargetValue((_, endVal) => endVal + delta)
    return taskId
  }
}

// 滚动事件
let wheelTask = 0
const onWheel = (e: WheelEvent) => {
  wheelTask = scrollTransition(e.deltaY, 200, wheelTask)
}

// 滑动事件
let startY = 0
let startTime = 0
let currentY = 0
let speed = 0
let touchTask = 0
let trackerId: number | undefined = undefined
const smoothDuration = 1000
const traceSpeed = () => {
  const deltaTime = Date.now() - startTime
  trackerId = requestAnimationFrame(traceSpeed)
  if (deltaTime === 0) return
  speed = (startY - currentY) / deltaTime
  startY = currentY
  startTime = Date.now()
}
const onTouchStart = (e: TouchEvent) => {
  controller.cancelTask()
  startY = e.touches[0].clientY
  currentY = startY
  startTime = Date.now()
  speed = 0
  trackerId = requestAnimationFrame(traceSpeed)
}
const onTouchMove = (e: TouchEvent) => {
  const delta = currentY - e.changedTouches[0].clientY
  currentY = e.changedTouches[0].clientY

  startPosition.value = move(
    startPosition.value,
    delta,
    [
      (<HTMLElement>container.value).getBoundingClientRect().height,
      props.padding,
      renderInfo.value[2],
    ],
    getHeight,
  )
}
const onTouchEnd = () => {
  if (trackerId !== undefined) cancelAnimationFrame(trackerId)
  trackerId = undefined
  if (speed !== 0) {
    touchTask = scrollTransition(
      (speed * smoothDuration) / 2,
      smoothDuration,
      touchTask,
      TransitionController.Quadratic,
    )
  }
}
let scrollTask = 0
const scroll = (delta: number, duration = 200) => {
  if (delta === 0) return
  scrollTask = scrollTransition(delta, duration, scrollTask)
}
const transport = (newStartPosition: [number, number]) => {
  startPosition.value = newStartPosition
}
const getPosition = () => startPosition.value

defineExpose({ scroll, transport, getPosition })
</script>

<style lang="scss">
.virtual-scroll {
  &_container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  &_wrapper {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    list-style: none;
    z-index: 1;
  }
  &_item {
    overflow: hidden;
  }
  &_placeholder {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    visibility: hidden;
    overflow: hidden;
  }
}
</style>
