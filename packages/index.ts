import VirtualScroll from '@pkg/components/VirtualScroll'
import { type VirtualScrollInstance } from '@pkg/components/VirtualScroll'
const components = [VirtualScroll]

type InstallFn = { (app: any): void; installed?: boolean }
type VueWindow = Window & typeof globalThis & { Vue?: any }

const install: InstallFn = (app: any) => {
  if (install.installed) return
  install.installed = true
  components.map(component => {
    app.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && (<VueWindow>window).Vue) {
  install((<VueWindow>window).Vue)
}

export default {
  install,
}

export { VirtualScroll, type VirtualScrollInstance }
