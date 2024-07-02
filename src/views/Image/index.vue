<script setup lang="ts">
import {Delete, Download, Position, Setting,UploadFilled, View} from "@element-plus/icons-vue";

import {
  type UploadFile,
  type UploadFiles,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile,
} from "element-plus";
import {onMounted, ref} from 'vue'
import {useImageStore} from "@/stores/image";

const uploadRef = ref<UploadInstance>()
const imageList=ref<UploadUserFile[]>([])
const imageStore=useImageStore()
const imageTable=imageStore.imageTable

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

onMounted(()=>imageStore.clearImageTable())

const getStyle=(row:{width:number,height:number})=> {
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

const imageUpload=(uploadFile: UploadFile, uploadFiles: UploadFiles)=>{
  let sizeInMB = uploadFile.raw?.size! / 1024 / 1024;
  if(sizeInMB>20){
    ElMessage.error("上传文件大小需 <= 20 MB！")
    return
  }
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

const handleDelete=(index:number,row: { title:string,name:string,src:string,exportPath:string })=>{
  if(index===-1){
    imageList.value=[]
    imageTable.forEach((item,index)=>{
      window.URL.revokeObjectURL(item?.exportPath)
      window.URL.revokeObjectURL(item?.src)
    })
    imageStore.clearImageTable()
  }
  else{
    imageList.value=imageList.value.filter(obj=>obj.name!==row.name)
    window.URL.revokeObjectURL(row.src)
    window.URL.revokeObjectURL(row.exportPath)
    imageStore.deleteRow(index,row)
  }
}

// 设置相关
const dialogConfigVisible=ref(false)
const selectedIndex=ref(-1)
const selectedOption=ref({exportFormat:'',width:1,height:1,newWidth:1,newHeight:1})

const formatOptions=[
  {
    value:'jpeg',
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

const handleConfig=(index:number,row:{exportFormat:string,width:number,height:number})=>{
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
const handlePreview=(index:number,row:{src:string})=>{
  dialogImageUrl.value=row.src
  dialogPreviewVisible.value=true
}

// 处理相关
/**
 * 根据 jpeg、png 的 File 文件对象，获取 指定输出格式 的 File 文件对象
 * @param {File} imageFile jpeg、png图片文件对象
 * @param {string} newType 输出格式
 * @returns image/newType File
 */
const convertImage = (imageFile:File,newType:string,newWidth:number,newHeight:number) => {
  const base64ToFile = (base64, fileName:string) => {
    let arr = base64.split(','),
        type = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, {
      type
    });
  };
  return new Promise((resolve, reject) => {
    const imageFileReader = new FileReader();
    imageFileReader.onload = function(e) {
      const image = new Image();
      typeof e.target.result === "string" ? image.src = e.target.result :"";
      image.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        canvas.getContext("2d")?.drawImage(image, 0, 0,newWidth,newHeight);
        resolve(base64ToFile(canvas.toDataURL("image/"+newType), imageFile.name.split(".")[0] + "."+newType))
      }
    }
    imageFileReader.readAsDataURL(imageFile)
  });
}

const startProcess=async (index:number,row:{exportFormat:string,raw:File,newWidth:number,newHeight:number})=>{
  const exportFile=await convertImage(row.raw,row.exportFormat,row.newWidth,row.newHeight)
  imageStore.addExport(index,URL.createObjectURL(new Blob([exportFile],{type:"image/"+row.exportFormat})))
}

const handleProcess=async (index:number,row:{exportFormat:string,raw:File,newWidth:number,newHeight:number})=>{
  if(index===-1){
    for (let i = 0; i < imageTable.length; i++) {
      const currentRow = imageTable[i];
      if (imageStore.checkOption(i)) {
        ElMessage.error('输出格式尚未设置完毕！');
      }
      else{
        await startProcess(i,currentRow)
      }
    }
  }
  else{
    if(imageStore.checkOption(index)){
      ElMessage.error('输出格式尚未设置完毕！')
    }
    else{
      await startProcess(index,row)
    }
  }
  ElMessage.success("转换完成！")
}

// 下载相关
const startDownload=(index:number,row:{exportPath:string,exportName:string,name:string})=>{
  if(typeof row.exportPath==='undefined'){
    ElMessage.error(row.name+' 尚未执行转换！')
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

const handleDownload=(index:number,row:{exportPath:string,exportName:string,name:string})=>{
  if(index===-1){
    for (let i = 0; i < imageTable.length; i++) {
      startDownload(i,imageTable[i])
    }
  }
  else{
    startDownload(index,row)
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
<!--        <el-col :span="3">-->
<!--          <el-button size="large" type="info" :icon="Setting" @click="handleConfig(-1,{})">-->
<!--            批量设置-->
<!--          </el-button>-->
<!--        </el-col>-->
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
  <el-dialog v-model="dialogPreviewVisible" title="图片预览" width="1000px" style="-webkit-app-region:no-drag;">
    <div class="dialog-content">
      <img :src="dialogImageUrl" alt="Preview Image" />
    </div>
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

  .dialog-content{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%; /* 使其占满父容器的高度 */
    -webkit-app-region:no-drag;
  }

  .dialog-content img{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* 保持图片比例 */
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