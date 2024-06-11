<script setup lang="ts">
import {Delete, Download, Position, Setting,UploadFilled, View} from "@element-plus/icons-vue";

import {
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile,
  type UploadRawFile,
} from "element-plus";
import {onMounted, ref} from 'vue'
import {useImageStore} from "@/stores/image";
import sharp from "sharp";

const uploadRef = ref<UploadInstance>()
const imageList=ref<UploadUserFile[]>([])
const imageStore=useImageStore()
const imageTable=imageStore.imageTable

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

onMounted(()=>imageStore.clearImageTable())

const getStyle=(row)=> {
  const maxWidth = 180;
  const maxHeight = 180;
  let width = row.width;
  let height = row.height;
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  else if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
  };
}

const handleBeforeUpload:UploadProps['beforeUpload']=(raw:UploadRawFile)=>{

}

const imageUpload=(uploadFile: UploadFile, uploadFiles: UploadFiles)=>{
  if (!allowedFileTypes.includes(uploadFile.raw?.type!)) {
    uploadRef.value!.handleRemove(uploadFile);
  }
  else{
    const raw=uploadFile.raw
    imageStore.addImageTable(raw)
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
    imageList.value=[]
    imageStore.clearImageTable()
  }
  else{
    imageList.value=imageList.value.filter(obj=>obj.name!==row.name)
    imageStore.deleteRow(index,row)
  }
}

// 设置相关
const dialogConfigVisible=ref(false)
const selectedIndex=ref(-1)
const selectedOption=ref({exportFormat:'',width:1,height:1,newWidth:1,newHeight:1})

const formatOptions=[
  {
    value:'jpg',
    label:'jpg/jpeg',
  },
  {
    value:'png',
    label:'png',
  },
  {
    value:'webp',
    label:'webp',
  }
]

const handleConfig=(index:number,row)=>{
  dialogConfigVisible.value=true
  selectedIndex.value=index
  if(index===-1) {
    const maxResolution=imageStore.getMaxResolution()
    selectedOption.value={exportFormat:'',width:maxResolution.width,height:maxResolution.height,newWidth:1,newHeight:1}
  }
  else{
    selectedOption.value.exportFormat=row.exportFormat
    selectedOption.value.width=row.width
    selectedOption.value.height=row.height
    selectedOption.value.newWidth=row.width
    selectedOption.value.newHeight=row.height
  }
}

const handleConfirm=()=>{
  imageStore.setOptions(selectedIndex.value,selectedOption.value)
  dialogConfigVisible.value=false
}

// 图片预览
const dialogPreviewVisible=ref(false)
const dialogImageUrl=ref('')
const handlePreview=(index:number,row)=>{
  dialogImageUrl.value=row.src
  dialogPreviewVisible.value=true
}

// 处理相关
const startProcess=async (index:number,row)=>{
  console.log(123)
}
const handleProcess=(index:number,row)=>{
  if(index===-1){
    for (let i = 0; i < imageTable.length; i++) {
      const currentRow = imageTable[i];
      if (imageStore.checkOption(i)) {
        ElMessage.error('输出格式尚未设置完毕！');
      }
      else{

      }
    }
  }
  else{
    if(imageStore.checkOption(index)){
      ElMessage.error('输出格式尚未设置完毕！')
    }
    else{

    }
  }
}

</script>

<template>
  <div class="image-container">
    <!--    上传区域-->
    <el-upload
        class="upload" ref="uploadRef"
        drag multiple
        accept=".jpg, .jpeg, .png, .bmp, .webp, .jfif"
        :on-change="imageUpload"
        :on-remove="handleRemove"
        :limit="10"
        v-model:file-list="imageList"
        :auto-upload="false"
        :before-upload="handleBeforeUpload"
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

    <!--    表格区域-->
    <el-table :data="imageTable" :table-layout="'auto'" class="table" :header-cell-style="{'text-align':'center'}"
              stripe empty-text="暂无数据">
      <el-table-column prop="cover" label="图片" align="center">
        <!-- 图片的显示 -->
        <template   #default="scope">
          <img :src="scope.row.src"  :style="getStyle(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="文件名" align="center"/>
      <el-table-column prop="type" label="格式" align="center"/>
      <el-table-column prop="resolution" label="分辨率" align="center"/>
      <el-table-column prop="size" label="图片大小" align="center"/>
      <el-table-column prop="exportFormat" label="输出格式" align="center"/>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <div class="table-button">
            <el-button size="default" type="info" @click="handlePreview(scope.$index, scope.row)" :icon="View"></el-button>
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

  <!--  设置的Dialog-->
  <el-dialog v-model="dialogConfigVisible" title="转换设置" width="330px">
    <div class="dialog-row">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        输出格式
      </el-text>
      <el-select v-model="selectedOption.exportFormat" placeholder="输出格式" size="large" style="width:200px; padding-left: 25px;">
        <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <div class="dialog-row">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        宽度
      </el-text>
      <el-input-number v-model="selectedOption.newWidth" placeholder="宽度" size="large" style="width:200px; padding-left: 25px;"
                       controls-position="right" :min="1" :max="selectedOption.width"/>
    </div>
    <div class="dialog-row">
      <el-text style="display:inline-flex; width:80px; padding-left: 15px;">
        高度
      </el-text>
      <el-input-number v-model="selectedOption.newHeight" placeholder="高度" size="large" style="width:200px; padding-left: 25px;"
                       controls-position="right" :min="1" :max="selectedOption.height"/>
    </div>

    <template #footer>
      <el-button @click="dialogConfigVisible=false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>

  <!--    图片预览的dialog-->
  <el-dialog v-model="dialogPreviewVisible" title="图片预览" width="1000px" style="margin-top: 80px; -webkit-app-region:no-drag;">
    <img class="preview-image" :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>

</template>

<style scoped>
.image-container{
  margin: auto;
  align-items: center;
  overflow: auto;

  :deep(.el-table) {
    white-space: pre-line;
  }

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

  .preview-image{
    margin:auto;
    display: inline-flex;
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