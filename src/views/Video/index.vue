<script setup lang="ts">
import {Delete, Download, Position, Setting, UploadFilled, VideoPlay} from '@element-plus/icons-vue'
import {
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";
import {onMounted, ref} from 'vue'
import {useVideoStore} from "@/stores/video";
import {useFFMpegStore} from '@/stores/ffmpegStore'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const uploadRef = ref<UploadInstance>()
const videoList=ref<UploadUserFile[]>([])
const videoStore=useVideoStore()
const videoTable=videoStore.videoTable

const allowedFileTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/vnd.dlna.mpeg-tts'];

const ffmpegStore=useFFMpegStore()
const ffmpeg=ffmpegStore.ffmpeg

onMounted(()=>videoStore.clearVideoTable())

// 上传相关
const videoUpload=(uploadFile: UploadFile, uploadFiles: UploadFiles)=>{
  let type=uploadFile.raw?.type.split('/')[1]
  if (!allowedFileTypes.includes(uploadFile.raw?.type!)) {
    uploadRef.value!.handleRemove(uploadFile);
    return
  }
  videoStore.addVideoTable(<string>uploadFile.raw?.name,<string>type)
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

const handleDelete=(index:number,row: { title:string,name:string,exportPath:string })=>{
  if(index===-1){
    videoList.value=[]
    // 清空播放器
    audioRef.value.src=null
    videoTable.forEach((item,index)=>{
      window.URL.revokeObjectURL(item?.exportPath)
    })
    videoStore.clearVideoTable()
  }
  else{
    videoList.value=videoList.value.filter(obj=>obj.name!==row.name)
    if(audioRef.value.src===row.exportPath){
      audioRef.value.src=null
    }
    window.URL.revokeObjectURL(row.exportPath)
    videoStore.deleteRow(index,row)
  }
}

// 播放相关
const dialogVideoVisible=ref(false)
const videoRef=ref()
const audioRef=ref()
const videoSrc=ref('')
const handlePlay=async (index:number,row:{name:string})=>{
  dialogVideoVisible.value=true
  const raw:File=videoList.value.find(obj=>obj.name===row.name)?.raw
  const blob=await new Blob([raw],{type:'video/mp4'})
  videoSrc.value=URL.createObjectURL(blob)
  videoRef.value.src=videoSrc.value
}
const handleClose=()=>{
  dialogVideoVisible.value=false
  videoRef.value.pause()
  videoRef.value.src=null
  window.URL.revokeObjectURL(videoSrc.value)
  videoSrc.value=''
}

// 设置相关
const dialogConfigVisible=ref(false)
const selectedIndex=ref(-1)
const selectedOption=ref({exportFormat:'',mode:'',resolution:'',frame:'', bit:1000,transcodeMode:'',preset:'',crf:18})

const formatOptions=[
  {
    value:'aac',
    label:'抽取音频（复制）',
  },
  {
    value:'mp4',
    label:'mp4',
  },
  {
    value:'mov',
    label:'mov',
  },
]

const modeOption=[
  {
    value:'transcode',
    label:'转换编码'
  },
  {
    value:'transmux',
    label:'转换容器'
  }
]

const sizeOption=[
  {
    value:'',
    label:'与源相同'
  },
  {
    value:'854x480',
    label:'480p'
  },
  {
    value:'1280x720',
    label:'720p'
  },
  {
    value:'1920x1080',
    label:'1080p'
  },
  {
    value:'2560x1440',
    label:'2K'
  },
  {
    value:'3840x2160',
    label:'4K'
  }
]

const frameOption=[
  {
    value:'-1',
    label:'与源相同'
  },
  {
    value:'24',
    label:'24'
  },
  {
    value:'25',
    label:'25'
  },
  {
    value:'30',
    label:'30'
  },
  {
    value:'60',
    label:'60'
  }
]

const transcodeOption=[
  {
    value:'-preset',
    label:'预设'
  },
  {
    value:'-crf',
    label:'crf（恒定速率因子模式）'
  },
  {
    value:'-b:v',
    label:'固定比特率'
  }
]

const presetOption = [
  {
    value: 'ultrafast',
    label: 'ultrafast'
  },
  {
    value: 'superfast',
    label: 'superfast'
  },
  {
    value: 'veryfast',
    label: 'veryfast'
  },
  {
    value: 'faster',
    label: 'faster'
  },
  {
    value: 'fast',
    label: 'fast'
  },
  {
    value: 'medium',
    label: 'medium'
  },
  {
    value: 'slow',
    label: 'slow'
  },
  {
    value: 'slower',
    label: 'slower'
  },
  {
    value: 'veryslow',
    label: 'veryslow'
  }
];


const handleConfig=(index:number,row:{exportFormat:string,mode:string,bit:any,resolution:string,frame:string,transcodeMode:string,preset:string,crf:number})=>{
  dialogConfigVisible.value=true
  selectedIndex.value=index
  if(index===-1){
    selectedOption.value={exportFormat:'',mode:'',resolution:'',frame:'', bit:1000,transcodeMode:'',preset:'',crf:18}
  }
  else{
    selectedOption.value.exportFormat=row.exportFormat
    selectedOption.value.mode=row.mode
    selectedOption.value.bit=typeof row.bit==='number'?row.bit:Number(row.bit.split('k')[0])
    selectedOption.value.resolution=row.resolution
    selectedOption.value.frame=row.frame
    selectedOption.value.transcodeMode=row.transcodeMode
    selectedOption.value.preset=row.preset
    selectedOption.value.crf=row.crf
  }
}

// 选中输出格式变化时触发
const handleConfigChange=()=>{
  if(selectedOption.value.exportFormat==='aac'){
    selectedOption.value.mode=''  // 清空转换模式
    selectedOption.value.transcodeMode=''
  }
  if(selectedOption.value.mode==='transmux'){
    selectedOption.value.transcodeMode=''
  }
}
const handleConfirm=()=>{
  videoStore.setOptions(selectedIndex.value,selectedOption.value)
  dialogConfigVisible.value=false
}

// 处理相关
const startProcess=async (index:number,row:{name:string, exportFormat:string,mode:string,bit:number,resolution:string,frame:string,transcodeMode:string,preset:string,crf:number})=>{
  const raw:File=videoList.value.find(obj=>obj.name===row.name)?.raw
  await ffmpeg.writeFile(row.name, await fetchFile(raw))
  const exportFormat=row.exportFormat
  const exportName=row.name.split('.')[0]+'.'+exportFormat
  let type=''
  // 抽取音频
  if(exportFormat==='aac'){
    await ffmpeg.exec(['-i',row.name,'-vn','-c:a','copy',exportName])
    type='audio/wav'
  }
  else{
    type='video/mp4'
    if(row.mode==='transmux'){ // 封装
      await ffmpeg.exec(['-i',row.name,'-c','copy',exportName])
    }
    else{ // 编码
      let transcodeValue=undefined
      if(row.transcodeMode==='-preset'){
        transcodeValue=row.preset
      }
      else if(row.transcodeMode==='-crf'){
        transcodeValue=row.crf.toString()
      }
      else if(row.transcodeMode==='-b:v'){
        transcodeValue=row.bit.toString()
      }

      let ffOption=['-i',row.name]
      if(row.frame!=='-1'){
        ffOption.push('-r',row.frame)
      }
      if(row.resolution!=''){
        ffOption.push('-s',row.resolution)
      }
      ffOption.push(row.transcodeMode,transcodeValue,exportName)
      await ffmpeg.exec(ffOption)
    }
  }
  const data=await ffmpeg.readFile(exportName)
  const exportPath=URL.createObjectURL(new Blob([(data as Uint8Array).buffer],{type:type}))
  videoStore.addExport(index,exportPath,exportName)
}

const handleProcess=async (index:number,row:{title:string,name:string, sample:string, exportFormat:string, bit:string, compress:number, exportPath:string})=>{
  if(index===-1){
    for (let i = 0; i < videoTable.length; i++) {
      const currentRow = videoTable[i];
      if (videoStore.checkOption(i)) {
        ElMessage.error('输出格式尚未设置完毕！');
      } else {
        ElMessage.info(currentRow.title+' 开始转换，请耐心等候！');
        videoStore.updateStatus(i,'处理中')
        await startProcess(i, currentRow);
        videoStore.updateStatus(i,'处理完毕')
        ElMessage.success(currentRow.title+' 转换完成！');
      }
    }
  }
  else{
    if(videoStore.checkOption(index)){
      ElMessage.error('输出格式尚未设置完毕！')
    }
    else{
      ElMessage.info(row.title+' 开始转换，请耐心等候！')
      videoStore.updateStatus(index,'处理中')
      await startProcess(index, row)
      videoStore.updateStatus(index,'处理完毕')
      ElMessage.success(row.title+' 转换完成！')
      if(row.exportFormat==='aac'){
        audioRef.value.src=row.exportPath
      }
    }
  }
}

// 下载
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
    for (let i = 0; i < videoTable.length; i++) {
      startDownload(i,videoTable[i])
    }
  }
  else{
    startDownload(index,row)
  }
}
</script>

<template>
  <div class="audio-container">
<!--    上传区域-->
    <el-upload
        class="upload" ref="uploadRef"
        drag multiple
        accept=".mp4, .mov, .mkv, .ts"
        :on-change="videoUpload"
        :on-remove="handleRemove"
        :limit="10"
        v-model:file-list="videoList"
        :auto-upload="false"
        :on-exceed="handleExceed"
        :show-file-list="false"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或 <em>点击选择</em>
      </div>
    </el-upload>

<!--    批量区域-->
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

<!--    展示表格-->
    <el-table :data="videoTable" :table-layout="'auto'" class="table" :header-cell-style="{'text-align':'center'}"
              stripe empty-text="暂无数据">
      <el-table-column prop="title" label="文件名" align="center"/>
      <el-table-column prop="type" label="格式" align="center"/>
      <el-table-column prop="exportFormat" label="输出格式" align="center"/>
      <el-table-column prop="status" label="处理状态" align="center"/>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <div class="table-button">
            <el-button size="default" @click="handlePlay(scope.$index, scope.row)" :icon="VideoPlay"></el-button>
            <el-button size="default" type="info" @click="handleConfig(scope.$index, scope.row)" :icon="Setting"></el-button>
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

<!--  设置Dialog-->
  <el-dialog v-model="dialogConfigVisible" title="转换设置" width="330px">
    <div class="dialog-row">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        输出格式
      </el-text>
      <el-select v-model="selectedOption.exportFormat" placeholder="输出格式" size="large" style="width:200px; padding-left: 25px;" @change="handleConfigChange">
        <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.exportFormat!=='aac'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        转换模式
      </el-text>
      <el-select v-model="selectedOption.mode" placeholder="转换模式" size="large" style="width:200px; padding-left: 25px;" @change="handleConfigChange">
        <el-option v-for="item in modeOption" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
<!--    <div :class="selectedOption.mode==='transcode'?'dialog-row':'dialog-row-hidden'">-->
<!--      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">-->
<!--        分辨率-->
<!--      </el-text>-->
<!--      <el-select v-model="selectedOption.resolution" placeholder="分辨率" size="large" style="width:200px; padding-left: 25px;">-->
<!--        <el-option v-for="item in sizeOption" :key="item.value" :label="item.label" :value="item.value" />-->
<!--      </el-select>-->
<!--    </div>-->
    <div :class="selectedOption.mode==='transcode'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        帧率
      </el-text>
      <el-select v-model="selectedOption.frame" placeholder="帧率" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in frameOption" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.mode==='transcode'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        编码模式
      </el-text>
      <el-select v-model="selectedOption.transcodeMode" placeholder="编码模式" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in transcodeOption" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.transcodeMode==='-preset'?'dialog-row':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        预设
      </el-text>
      <el-select v-model="selectedOption.preset" placeholder="预设" size="large" style="width:200px; padding-left: 25px;" placement="right">
        <el-option v-for="item in presetOption" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div :class="selectedOption.transcodeMode==='-crf'?'dialog-row-slider':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        crf：{{selectedOption.crf}}
      </el-text>
      <el-slider v-model="selectedOption.crf" :step=1 :min=18 :max=28 style="padding-left:25px; width:200px;"/>
    </div>
    <div :class="selectedOption.transcodeMode==='-b:v'?'dialog-row-slider':'dialog-row-hidden'">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        比特率(kbps)
      </el-text>
      <el-input-number v-model="selectedOption.bit" :step=500 :min=1000 :max=12000 controls-position="right"
                       size="large" style="padding-left:25px; width:200px;" />
    </div>

    <template #footer>
      <el-button @click="dialogConfigVisible=false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>

<!--  播放视频Dialog-->
  <el-dialog v-model="dialogVideoVisible" title="视频预览" width="1000px" :before-close="handleClose" style="-webkit-app-region:no-drag;">
    <video ref="videoRef" controls autoplay style="height:100%; width:100%;">
    </video>
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

.dialog-video{
  -webkit-app-region:no-drag;
}
</style>