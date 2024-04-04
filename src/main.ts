// import './assets/main.css'
import '@/styles/common.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
// import '@/styles/var.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
