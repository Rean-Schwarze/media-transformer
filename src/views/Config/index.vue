<script setup lang="ts">
import {Coin,VideoPlay} from '@element-plus/icons-vue'
import {ref, onMounted} from 'vue'

const init=async () => {
  await getSettings()
  // 初次加载
  if (typeof uploadExceedNum.value === 'undefined' || typeof autoPlay.value === 'undefined') {
    await handleReset()
  }
}

const getSettings=async ()=>{
  uploadExceedNum.value = await window.myApi.getSettings('upload-exceed')
  autoPlay.value = await window.myApi.getSettings('auto-play')
}

const handleReset=async ()=>{
  await window.myApi.setSettings('upload-exceed', 10)
  await window.myApi.setSettings('auto-play', true)
  await getSettings()
}

const uploadExceedNum=ref(0)
const handleExceedNumChange=async ()=>{
  await window.myApi.setSettings('upload-exceed',uploadExceedNum.value)
}

const autoPlay=ref(true)
const handleAutoPlayChange=async ()=>{
  await window.myApi.setSettings('auto-play',autoPlay.value)
}

onMounted(()=>{
  init()
})
</script>

<template>
  <el-button size="large" class="el-button-larger" @click="handleReset">恢复默认设置</el-button>
  <div class="config-container">
    <el-text class="el-text-very-large">全局设置</el-text>
    <div class="global-config">
      <el-space direction="vertical" fill fill-ratio="100" style="width:100%;">
        <el-card shadow="hover">
          <el-row class="config-row">
            <el-col :span="1">
              <el-icon size="25"><Coin /></el-icon>
            </el-col>
            <el-col :span="18">
              <el-text class="el-text-config-item">上传数量上限</el-text>
            </el-col>
            <el-col :span="5">
              <el-input-number size="large" v-model="uploadExceedNum" :min="1" :max="100" @change="handleExceedNumChange" />
            </el-col>
          </el-row>
        </el-card>
        <el-card shadow="hover">
          <el-row class="config-row">
            <el-col :span="1">
              <el-icon size="25"><VideoPlay /></el-icon>
            </el-col>
            <el-col :span="20">
              <el-text class="el-text-config-item">转换后是否自动播放</el-text>
            </el-col>
            <el-col :span="2">
              <el-switch v-model="autoPlay" size="large" @change="handleAutoPlayChange"/>
            </el-col>
          </el-row>
        </el-card>
      </el-space>
    </div>
  </div>
</template>

<style scoped>
  .config-container{
    padding-left: 20px;
    padding-right: 20px;

    .global-config{
      padding-top: 15px;
      -webkit-app-region:no-drag;
    }

    .config-row{
      margin: auto;
      align-items: center;
    }
  }

  .el-text-very-large{
    font-weight: normal;
    font-size:30px;
  }

  .el-text-config-item{
    padding-left: 20px;
    font-weight: normal;
    font-size:16px;
  }

  .el-button-larger{
    -webkit-app-region:no-drag;
    margin-left: 830px;
  }
</style>