<script setup lang="ts">
import {Delete, Download, Position, Setting, UploadFilled, VideoPlay} from '@element-plus/icons-vue'
import {
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";
import {onUnmounted, ref} from 'vue'
import * as musicMetadata from 'music-metadata-browser';
import {useAudioStore} from "@/stores/audio";
import {useFFMpegStore} from '@/stores/ffmpegStore'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const uploadRef = ref<UploadInstance>()
const audioList=ref<UploadUserFile[]>([])
const audioStore=useAudioStore()
const audioTable=audioStore.audioTable

const allowedFileTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a', 'audio/ogg'];

const ffmpegStore=useFFMpegStore()
const ffmpeg=ffmpegStore.ffmpeg

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
      "目前只能上传10个文件，请重试"
  )
}

const handleRemove: UploadProps['onRemove']=(file, fileList)=>{
  ElMessage.error(
      "当前上传文件 "+file.name+' 格式不受支持！'
  )
}

const handleDelete=(index:number,row: { title:string,name:string })=>{
  if(index===-1){
    audioList.value=[]
    audioStore.clearAudioTable()
  }
  else{
    audioList.value=audioList.value.filter(obj=>obj.name!==row.name)
    audioStore.deleteRow(index,row)
  }
}

// 播放音频
const audioRef=ref()
const handlePlay=(index:number,row:{name:string})=>{
  const raw:File=audioList.value.find(obj=>obj.name===row.name)?.raw
  const blob=new Blob([raw],{type:raw.type})
  audioRef.value.src=URL.createObjectURL(blob)
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
    value:'64k',
    label:'64 kbps',
  },
  {
    value:'128k',
    label:'128 kbps',
  },
  {
    value:'192k',
    label:'192 kbps',
  },
  {
    value:'256k',
    label:'256 kbps',
  },
  {
    value:'320k',
    label:'320 kbps',
  },
]

const wavBitRateOptions=[
  {
    value:'pcm_s8',
    label:'8 Bit',
  },
  {
    value:'pcm_s16le',
    label:'16 Bit',
  },
  {
    value:'pcm_s24le',
    label:'24 Bit',
  },
  {
    value:'pcm_f32le',
    label:'32 Bit Float',
  },
]

const flacBitRateOptions=[
  {
    value:'s16',
    label:'16 Bit',
  },
  {
    value:'s24',
    label:'24 Bit',
  },
  {
    value:'s32',
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

// 转换相关
const startProcess=async (index:number,row:{name:string, sample:string, exportFormat:string, bit:string, compress:number})=>{
  const raw:File=audioList.value.find(obj=>obj.name===row.name)?.raw
  await ffmpeg.writeFile(row.name, await fetchFile(raw))
  const exportFormat=row.exportFormat
  const exportName=row.name.split('.')[0]+'.'+exportFormat
  if(exportFormat==='wav'){
    await ffmpeg.exec(['-i',row.name,'-ar',row.sample,'-acodec',row.bit,exportName])
  }
  else if(exportFormat==='mp3'){
    await ffmpeg.exec(['-i',row.name,'-ar',row.sample,'-ab',row.bit,exportName])
  }
  else if(exportFormat==='flac'){
    await ffmpeg.exec(['-i',row.name,'-ar',row.sample,'-sample_fmt',row.bit,'-compression_level',row.compress.toString(),exportName])
  }
  const data=await ffmpeg.readFile(exportName)
  const exportPath=URL.createObjectURL(new Blob([(data as Uint8Array).buffer],{type:'audio/wav'}))
  audioStore.addExport(index,exportPath,exportName)
}

const handleProcess=async (index:number,row:{title:string,name:string, sample:string, exportFormat:string, bit:string, compress:number, exportPath:string})=>{
  if(index===-1){
    for (let i = 0; i < audioTable.length; i++) {
      const currentRow = audioTable[i];
      if (audioStore.checkOption(i)) {
        ElMessage.error('输出格式尚未设置完毕！');
      } else {
        ElMessage.info(currentRow.title+' 开始转换，请耐心等候！');
        await startProcess(i, currentRow);
        ElMessage.success(currentRow.title+' 转换完成！');
      }
    }
  }
  else{
    if(audioStore.checkOption(index)){
      ElMessage.error('输出格式尚未设置完毕！')
    }
    else{
      ElMessage.info(row.title+' 开始转换，请耐心等候！')
      await startProcess(index, row)
      ElMessage.success(row.title+' 转换完成！')
      audioRef.value.src=row.exportPath
    }
  }
}

const startDownload=(index:number,row:{exportPath:string,exportName:string, title:string})=>{
  if(typeof row.exportPath==='undefined'){
    ElMessage.error(row.title+' 尚未执行转换！')
  }
  else{
    // 创建一个隐藏的链接元素
    const link = document.createElement('a');
    link.style.display = 'none';

    // 设置链接元素的 href 属性为 Blob URL
    link.href = row.exportPath;

    // 设置下载的文件名（可选）
    link.download = row.exportName;

    // 将链接元素添加到页面中
    document.body.appendChild(link);

    // 触发点击事件以开始下载
    link.click();

    // 移除链接元素
    document.body.removeChild(link);
  }
}

const handleDownload=(index:number,row:{exportPath:string,exportName:string})=>{
  if(index===-1){
    for (let i = 0; i < audioTable.length; i++) {
      startDownload(i,audioTable[i])
    }
  }
  else{
    startDownload(index,row)
  }
}

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
      <el-row justify="space-evenly">
        <el-col :span="3">
          <el-button size="large" type="danger" :icon="Delete" @click="handleDelete(-1,{})">
            清空
          </el-button>
        </el-col>
        <el-col :span="11">
          <audio ref="audioRef" controls autoplay style="height:40px; width:90%;">
          </audio>
        </el-col>
        <el-col :span="3">
          <el-button size="large" type="info" :icon="Setting" @click="handleConfig(-1,{})">
            批量设置
          </el-button>
        </el-col>
        <el-col :span="3">
          <el-button size="large" type="primary" :icon="Position" @click="handleProcess(-1,{})">
            批量处理
          </el-button>
        </el-col>
        <el-col :span="3">
          <el-button size="large" type="primary" :icon="Download" @click="handleDownload(-1,{})">
            批量下载
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
          <div class="table-button">
            <el-button size="default" @click="handlePlay(scope.$index, scope.row)" :icon="VideoPlay"></el-button>
            <el-button size="default" type="info" @click="handleConfig(scope.$index, scope.row)" :icon="Setting"></el-button>
          </div>
          <div class="table-button">
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
          </div>
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
    padding-top: 10px;
    padding-left: 5px;
    -webkit-app-region:no-drag;
  }

  .table{
    padding-top: 5px;
    -webkit-app-region:no-drag;
  }

  .table-button{
    padding-top: 10px;
    margin:auto;
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