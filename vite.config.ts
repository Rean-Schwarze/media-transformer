import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {electronDevPlugin} from "./plugins/vite.electron.dev";
import {electronBuildPlugin} from "./plugins/vite.electron.build";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electronDevPlugin(),
    electronBuildPlugin()
  ],
  base:'./', //默认是绝对路径，改成相对路径
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
