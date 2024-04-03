<script setup lang="ts">
import {useDark, useToggle} from "@vueuse/core";
import {ref} from 'vue';
import {Sunny,Moon, Film, Mic, House} from '@element-plus/icons-vue';

// 切换浅色/深色模式
const isDark = useDark()
const toggleDark = () => useToggle(isDark)

const isCollapse =ref(false)

</script>

<template>
  <div class="home-layout">
    <el-container>
      <el-aside width="220px">
        <el-menu default-active="/" class="el-menu-vertical" :collapse="isCollapse" router>
          <el-menu-item index="/">
            <template #title>
              <el-icon><House/></el-icon>
              <span>首页</span>
            </template>
          </el-menu-item>
          <el-menu-item index="audio">
            <template #title>
              <el-icon><Mic/></el-icon>
              <span>音频压缩/格式转换</span>
            </template>
          </el-menu-item>
          <el-menu-item index="video">
            <template #title>
              <el-icon><Film/></el-icon>
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

    <div class="home-mode">
      <el-text style="padding-right:20px">切换浅/深色主题</el-text>
      <el-switch v-model="isDark" @change="toggleDark" size="large"
                 :active-action-icon="Moon" :inactive-action-icon="Sunny"></el-switch>
    </div>
  </div>
</template>

<style lang='scss'>

.el-menu-vertical{
  -webkit-app-region:no-drag;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width:220px;
  min-height: 520px;
}

.home-mode{
  margin-left: 10px;
  -webkit-app-region:no-drag;
}
</style>