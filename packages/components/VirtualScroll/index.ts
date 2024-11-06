import VirtualScroll from '@pkg/components/VirtualScroll/VirtualScroll.vue'

VirtualScroll.install = (app: any) => {
  app.component(VirtualScroll.name, VirtualScroll)
}

export default VirtualScroll
export type VirtualScrollInstance = {
  scroll: (index: number) => void
  transport: (newStartPosition: [number, number]) => void
  getPosition: () => [number, number]
}
