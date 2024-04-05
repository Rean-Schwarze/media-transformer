<script setup lang="ts">

</script>

<template>
  <div class="welcome-title">
    <div class="title-main">
      <el-text class="el-text-very-large">
        欢迎使用
      </el-text>
    </div>
    <div class="title-sub">
      <el-text class="el-text-sub-large">
        请选择左侧侧边栏中功能以开始
      </el-text>
    </div>
  </div>
</template>

<style scoped>
.el-text-very-large{
  font-weight: normal;
  font-size:45px;
}
.el-text-sub-large{
  font-weight: bold;
  font-size:20px;
}
.welcome-title{
  padding-top: 180px;
  margin: auto;
  text-align: center;
}
.title-sub{
  padding-top: 10px;
}
</style>