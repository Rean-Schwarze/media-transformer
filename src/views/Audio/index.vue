<script setup lang="ts">
import { UploadFilled, VideoPlay, Delete, Position } from '@element-plus/icons-vue'
import {
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";
import {ref, onMounted} from 'vue'
import * as musicMetadata from 'music-metadata-browser';
import {useAudioStore} from "@/stores/audio";

const uploadRef = ref<UploadInstance>()
const audioList=ref<UploadUserFile[]>([])
const audioStore=useAudioStore()
const audioTable=audioStore.audioTable

const allowedFileTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a', 'audio/ogg'];

const audioUpload=(uploadFile: UploadFile, uploadFiles: UploadFiles)=>{
  if (!allowedFileTypes.includes(uploadFile.raw?.type!)) {
    uploadRef.value!.handleRemove(uploadFile);
  }
  else{
    musicMetadata.parseBlob(uploadFile.raw).then(metadata=>{
      audioStore.addAudioTable(metadata.common,uploadFile.name,uploadFile.raw?.type.split('/')[1])
    })
  }
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(
      "目前只能上传10个文件，请删除后重试"
  )
}

const handleRemove: UploadProps['onRemove']=(file, fileList)=>{
  ElMessage.error(
      "当前上传文件 "+file.name+' 格式不受支持！'
  )
}

import {FFmpeg} from "@ffmpeg/ffmpeg";
import fs from "node:fs";
const ffmpeg = new FFmpeg();
ffmpeg.on('log', (e) => {
  console.log(e.message);
});

</script>

<template>
  <div class="audio-container">
    <el-upload
        class="upload" ref="uploadRef"
        drag multiple
        accept=".mp3, .ogg, .wav, .flac, .m4a"
        :on-change="audioUpload"
        :on-remove="handleRemove"
        :limit="10"
        v-model:file-list="audioList"
        :auto-upload="false"
        :on-exceed="handleExceed"
        :show-file-list="false"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或 <em>点击选择</em>
      </div>
    </el-upload>

    <el-table :data="audioTable" :table-layout="'auto'" class="table" :header-cell-style="{'text-align':'center'}" stripe>
      <el-table-column prop="cover" label="封面" align="center">
        <!-- 图片的显示 -->
        <template   #default="scope">
          <img :src="scope.row.cover"  min-width="90" height="90" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="歌名" align="center"/>
      <el-table-column prop="artist" label="歌手" align="center"/>
      <el-table-column prop="album" label="专辑" align="center"/>
      <el-table-column prop="type" label="格式" align="center"/>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="default" @click="handlePlay(scope.$index, scope.row)" :icon="VideoPlay"></el-button>
          <el-button
              size="default"
              type="primary" :icon="Position"
              @click="handleProcess(scope.$index, scope.row)"
          ></el-button>
          <el-button
              size="default"
              type="danger" :icon="Delete"
              @click="handleDelete(scope.$index, scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.audio-container{
  margin: auto;
  align-items: center;
  overflow: auto;

  .upload{
    margin: auto;
    width:40%;
    -webkit-app-region:no-drag;
  }

  .table{
    padding-top: 15px;
    -webkit-app-region:no-drag;
  }
}
</style>