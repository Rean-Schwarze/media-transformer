<script setup lang="ts">
import LayoutFooter from './components/LayoutFooter.vue'
import LayoutHeader from "@/views/Layout/components/LayoutHeader.vue";
import {useFFMpegStore} from "@/stores/ffmpegStore";
import {onMounted} from "vue";

const ffmpegStore=useFFMpegStore()
onMounted(async ()=> await ffmpegStore.initFFMpeg()  )

</script>

<template>
  <LayoutHeader />
  <!--  二级路由出口  -->
  <RouterView />
  <LayoutFooter />
</template>

<style scoped>

</style>