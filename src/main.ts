// import './assets/main.css'
import '@/styles/common.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

app.use(router)

app.mount('#app')

const pinia=createPinia()
// 注册持久化插件
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
