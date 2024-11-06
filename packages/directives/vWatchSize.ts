import { nextTick, type Directive } from 'vue'

export default <Directive>{
  mounted(el, binding) {
    // ! watchSize必须在元素被渲染后绑定，避免由于resize先于autoRecord触发导致获取不到高度
    nextTick(() => {
      if (binding.value instanceof Function) binding.value(el)
      el.observer = new ResizeObserver(() => {
        if (binding.value instanceof Function) binding.value(el)
      })
      el.observer.observe(el)
    })
  },

  beforeUnmount(el) {
    if (el.observer) {
      el.observer.disconnect()
      delete el.observer
    }
  },
}
