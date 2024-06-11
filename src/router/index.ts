import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import Home from '@/views/Home/index.vue'
import Audio from '@/views/Audio/index.vue'
import Video from '@/views/Video/index.vue'
import Image from '@/views/Image/index.vue'
import HomeWelcome from "@/views/Home/components/HomeWelcome.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path:'/',
      component: Layout,
      children:[
        {
          path:'',
          component: Home,
          children:[
            {
              path:'',
              component:HomeWelcome,
            },
            {
              path:'audio',
              component:Audio,
            },
            {
              path:'video',
              component:Video,
            },
            {
              path:'image',
              component: Image,
            }
          ]
        }
      ]
    }
  ]
})

export default router
