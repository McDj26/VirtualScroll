import { type Directive } from 'vue'

export default <Directive>{
  mounted(el, binding) {
    if (binding.arg && binding.arg === 'mounted') binding.value?.(el)
  },
  unmounted(el, binding) {
    if (binding.arg && binding.arg === 'unmounted') binding.value?.(el)
  },
}
