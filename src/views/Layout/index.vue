<script setup lang="ts">
import LayoutFooter from './components/LayoutFooter.vue'
import LayoutHeader from "@/views/Layout/components/LayoutHeader.vue";
import {useFFMpegStore} from "@/stores/ffmpegStore";
import {onMounted} from "vue";

const ffmpegStore=useFFMpegStore()
onMounted(async ()=> await ffmpegStore.initFFMpeg()  )

</script>

<template>
  <LayoutHeader class="fixed-header" />
  <!--  二级路由出口  -->
  <RouterView class="content" />
  <LayoutFooter />
</template>

<style scoped>
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 98%;
  z-index: 1000; /* 确保它在其他内容之上 */
  background-color: var(--el-bg-color);
}

.content{
  padding-top: 60px;
}
</style>