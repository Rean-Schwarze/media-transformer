<script setup lang="ts">
import LayoutFooter from './components/LayoutFooter.vue'
import LayoutHeader from "@/views/Layout/components/LayoutHeader.vue";
</script>

<template>
  <LayoutHeader />
  <!--  二级路由出口  -->
  <RouterView />
  <LayoutFooter />
</template>

<style scoped>

</style>