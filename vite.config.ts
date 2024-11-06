import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({ rollupTypes: true, tsconfigPath: './tsconfig.build.json' }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./examples', import.meta.url)),
      '@pkg': fileURLToPath(new URL('./packages', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    lib: {
      entry: fileURLToPath(new URL('./packages/index.ts', import.meta.url)),
      name: 'virtual-scroll-vue',
      fileName: format => `index.${format}.js`,
    },
  },
})
