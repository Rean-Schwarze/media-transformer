<script setup lang="ts">

</script>

<template>
  <footer class="app_footer">
    <!-- 其它 -->
    <div class="extra">
      <div class="container">
      </div>
      <!-- 版权信息 -->
      <div class="copyright">
        <p>
          <a href="javascript:;">关于我们</a>
        </p>
        <p>CopyRight © Rean</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang='scss'>
.app_footer {
  overflow: hidden;
  background-color: transparent;
  //padding-top: 20px;


  .extra {
    background-color: transparent;
  }

  .copyright {
    height: 80px;
    //padding-top: 10px;
    text-align: center;
    color: #999;
    font-size: 15px;

    p {
      line-height: 1;
      padding-top: 10px;
      font-family: "PingFang SC",sans-serif;
      //padding-bottom: 20px;
      -webkit-app-region:no-drag;
    }

    a {
      color: #999;
      font-family: "Harmony_Regular",sans-serif;
      line-height: 1;
      padding-top: 10px;
      border-right: 1px solid #999;

      &:last-child {
        border-right: none;
      }
    }
  }
}
</style>