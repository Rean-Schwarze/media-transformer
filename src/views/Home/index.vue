<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {Sunny,Moon, Film, Mic, House} from '@element-plus/icons-vue';
import PubSub from 'pubsub-js'

const isCollapse =ref(false)

const handleCollapse=()=>{
  PubSub.subscribe('handleCollapse',()=>{
    isCollapse.value = isCollapse.value === false;
  })
}

onMounted(()=>handleCollapse())

</script>

<template>
  <div class="home-layout">
    <el-container>
      <el-aside width="isCollapse===true?100px:220px">
        <el-menu default-active="/" class="el-menu-vertical" :collapse="isCollapse" router>
          <el-menu-item index="/">
            <el-icon :icon="House"><House/></el-icon>
            <template #title>
              <span>首页</span>
            </template>
          </el-menu-item>
          <el-menu-item index="audio">
            <el-icon><Mic/></el-icon>
            <template #title>
              <span>音频压缩/格式转换</span>
            </template>
          </el-menu-item>
          <el-menu-item index="video">
            <el-icon><Film/></el-icon>
            <template #title>
              <span>视频压缩/格式转换</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <!--  三级路由出口-->
        <RouterView />
      </el-main>
    </el-container>
  </div>
</template>

<style lang='scss'>

.el-menu-vertical{
  -webkit-app-region:no-drag;
}

.el-menu-vertical{
  min-height: 550px;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width:220px;
}

.home-mode{
  margin-left: 10px;
  width:100%;
  -webkit-app-region:no-drag;
}
</style>