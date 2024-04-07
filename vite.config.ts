import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {electronDevPlugin} from "./plugins/vite.electron.dev";
import {electronBuildPlugin} from "./plugins/vite.electron.build";

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { NgmiPolyfill } from "vite-plugin-ngmi-polyfill";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electronDevPlugin(),
    electronBuildPlugin(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({importStyle:"sass"})],
    }),
    NgmiPolyfill(),
  ],
  base:'./', //默认是绝对路径，改成相对路径
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 自动导入定制化样式文件进行样式覆盖
        additionalData: `
          // @use "@/styles/element/index.scss" as *;
          @use "@/styles/var.scss" as *;
        `,
      }
    }
  },
  optimizeDeps:{
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  worker:{
    format:'es'
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
