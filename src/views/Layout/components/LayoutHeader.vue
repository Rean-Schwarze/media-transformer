<script setup lang="ts">
import {Minus, Close} from '@element-plus/icons-vue';


// function minimize(){
//   ipcRenderer.send('minimize');
// }
// function close(){
//   ipcRenderer.send('close');
// }
const minimize=()=>{

}
</script>

<template>
  <div class="header">
    <el-row>
      <el-col :span="2">
        <el-text size="large" type="primary">
          标题
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
  padding-top: 10px;
  margin-bottom: 10px;

  .button{
    border:none;
    -webkit-app-region:no-drag;
  }
}


</style>