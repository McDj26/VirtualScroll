import { nextTick, type Directive } from 'vue'

export default <Directive>{
  mounted(el, binding) {
    // ! nextTick保证vWatchSize在vAutoRecord之后执行
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
