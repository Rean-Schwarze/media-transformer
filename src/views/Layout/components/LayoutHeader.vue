<script lang="ts">
import {Minus, Close, Moon, Sunny, Menu} from '@element-plus/icons-vue';
import {useDark, useToggle} from "@vueuse/core";
import PubSub from 'pubsub-js'

// 切换浅色/深色模式
const isDark = useDark()
const toggleDark = () => useToggle(isDark)
export default {
  computed: {
    Sunny() {
      return Sunny
    },
    Moon() {
      return Moon
    }
  },
  data(){
    return{
      Minus:Minus,
      Close:Close,
      Menu:Menu,
      isDark:isDark,
    }
  },
  methods:{
    minimize(){
      window.myApi.sendMsg('minimize');
    },
    close(){
      window.myApi.sendMsg('close');
    },
    emitExpand(){
      PubSub.publish('handleCollapse')
    },
    toggleDark(){
      isDark.value = !isDark.value;
      toggleDark()
    }
  }
}
</script>

<template>
  <div class="header">
    <el-row>
      <el-col :span="1">
        <el-button :icon="Menu" class="button" @click="emitExpand"></el-button>
      </el-col>
      <el-col :span="20">
        <div class="title">
          <el-text size="large" type="primary">
            多媒体文件格式转换
          </el-text>
        </div>
      </el-col>
      <el-col :span="1">
        <el-button :icon="isDark?Moon:Sunny" class="button" @click="toggleDark"></el-button>
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
  margin-left: 12px;
  padding-top: 15px;
  margin-bottom: 10px;

  .button{
    border:none;
    -webkit-app-region:no-drag;
  }

  .title{
    padding-top: 4px;
    margin: auto;
  }
}


</style>