<script setup lang="ts">
import {Minus, Close} from '@element-plus/icons-vue';
import * as electron from "electron";

const minimize=()=>{
  window.myApi.sendMsg('minimize');
}

const close=()=>{
  window.myApi.sendMsg('close');
}
</script>

<template>
  <div class="header">
    <el-row>
      <el-col :span="22">
        <el-text size="large" type="primary">
          多媒体文件格式转换
        </el-text>
      </el-col>
      <el-col :span="1">
        <el-button :icon="Minus" class="button" @click="minimize"></el-button>
      </el-col>
      <el-col :span="1">
        <el-button :icon="Close" class="button" @click="close"></el-button>
      </el-col>
    </el-row>
  </div>

</template>

<style scoped>
.header{
  margin-left: 20px;
  padding-top: 15px;
  margin-bottom: 10px;

  .button{
    border:none;
    -webkit-app-region:no-drag;
  }
}


</style>