<script setup lang="ts">
import { UploadFilled, VideoPlay, Delete, Position, Download, Setting} from '@element-plus/icons-vue'
import {
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";
import {ref, onUnmounted} from 'vue'
import * as musicMetadata from 'music-metadata-browser';
import {useAudioStore} from "@/stores/audio";

const uploadRef = ref<UploadInstance>()
const audioList=ref<UploadUserFile[]>([])
const audioStore=useAudioStore()
const audioTable=audioStore.audioTable

const allowedFileTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a', 'audio/ogg'];

onUnmounted(()=>audioStore.clearAudioTable())

// 上传文件
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

const handleDelete=(index:number,row: { title:string })=>{
  audioStore.deleteRow(index,row)
}

// 转换设置相关
const dialogConfigVisible=ref(false)
const formatOptions=[
  {
    value:'mp3',
    label:'mp3',
  },
  {
    value:'wav',
    label:'wav',
  },
  {
    value:'flac',
    label:'flac',
  },
  // {
  //   value:'ogg',
  //   label:'ogg',
  // }
]

const sampleRateOptions=[
  {
    value:'44100',
    label:'44100 Hz',
  },
  {
    value:'48000',
    label:'48000 Hz',
  },
]

const mp3BitRateOptions=[
  {
    value:'64',
    label:'64 kbps',
  },
  {
    value:'128',
    label:'128 kbps',
  },
  {
    value:'192',
    label:'192 kbps',
  },
  {
    value:'256',
    label:'256 kbps',
  },
  {
    value:'320',
    label:'320 kbps',
  },
]

const wavBitRateOptions=[
  {
    value:'8',
    label:'8 Bit',
  },
  {
    value:'16',
    label:'16 Bit',
  },
  {
    value:'24',
    label:'24 Bit',
  },
  {
    value:'32',
    label:'32 Bit Float',
  },
]

const flacBitRateOptions=[
  {
    value:'16',
    label:'16 Bit',
  },
  {
    value:'24',
    label:'24 Bit',
  },
  {
    value:'32',
    label:'32 Bit',
  },
]

const selectedIndex=ref(-1)
const selectedOption=ref({exportFormat:'',sample:'',bit:'',compress:0})
const changeOption=()=>{
  selectedOption.value.bit=''
}
const handleConfig=(index:number,row:{exportFormat:string,sample:string,bit:string,compress:number})=>{
  dialogConfigVisible.value=true
  selectedIndex.value=index
  if(index===-1){
    selectedOption.value={exportFormat:'',sample:'',bit:'',compress:0}
  }
  else{
    selectedOption.value.exportFormat=row.exportFormat
    selectedOption.value.sample=row.sample
    selectedOption.value.bit=row.bit
    selectedOption.value.compress=row.compress
  }
}
const handleConfirm=()=>{
  audioStore.setOptions(selectedIndex.value,selectedOption.value)
  dialogConfigVisible.value=false
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

    <div class="option">
      <el-row>
        <el-col :span="3">
          <el-button size="large" type="danger" :icon="Delete" @click="audioStore.clearAudioTable">
            清空
          </el-button>
        </el-col>
        <el-col :span="15">
          <el-button>123345</el-button>
        </el-col>
        <el-col :span="3">
          <el-button size="large" type="info" :icon="Setting" @click="handleConfig(-1,{})">
            批量设置
          </el-button>
        </el-col>
        <el-col :span="3">
          <el-button size="large" type="primary" :icon="Position" @click="handleProcess(-1)">
            批量处理
          </el-button>
        </el-col>
      </el-row>
    </div>

    <el-table :data="audioTable" :table-layout="'auto'" class="table" :header-cell-style="{'text-align':'center'}"
              stripe empty-text="暂无数据">
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
      <el-table-column prop="exportFormat" label="输出格式" align="center"/>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="default" @click="handlePlay(scope.$index, scope.row)" :icon="VideoPlay"></el-button>
          <el-button size="default" @click="handleConfig(scope.$index, scope.row)" :icon="Setting"></el-button>
          <el-button
              size="default"
              type="primary" :icon="Position"
              @click="handleProcess(scope.$index, scope.row)"
          ></el-button>
          <el-button
              size="default"
              type="primary" :icon="Download"
              @click="handleDownload(scope.$index, scope.row)"
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

  <el-dialog v-model="dialogConfigVisible" title="转换设置" width="330px">
    <div class="dialog-row">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        输出格式
      </el-text>
      <el-select v-model="selectedOption.exportFormat" placeholder="输出格式" size="large" style="width:200px; padding-left: 25px;" @change="changeOption">
        <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div class="dialog-row">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        采样率
      </el-text>
      <el-select v-model="selectedOption.sample" placeholder="采样率" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in sampleRateOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.exportFormat==='mp3'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        比特率
      </el-text>
      <el-select v-model="selectedOption.bit" placeholder="比特率" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in mp3BitRateOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.exportFormat==='wav'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        位深
      </el-text>
      <el-select v-model="selectedOption.bit" placeholder="位深" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in wavBitRateOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.exportFormat==='flac'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        位深
      </el-text>
      <el-select v-model="selectedOption.bit" placeholder="位深" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in flacBitRateOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.exportFormat==='flac'?'dialog-row-slider':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        压缩
      </el-text>
      <el-slider v-model="selectedOption.compress" :step="1" max="8" style="padding-left:25px; width:200px;" />
    </div>

    <template #footer>
      <el-button @click="dialogConfigVisible=false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
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

  .option{
    padding-top: 5px;
    padding-left: 5px;
    -webkit-app-region:no-drag;
  }

  .table{
    padding-top: 10px;
    -webkit-app-region:no-drag;
  }
}

.dialog-row{
  padding-top:5px;
}

.dialog-row-slider{
  display:inline-flex;
  padding-top: 10px;
  max-width: 330px;
}

.dialog-row-hidden{
  display:none;
}
</style>