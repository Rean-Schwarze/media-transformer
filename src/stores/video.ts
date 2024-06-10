import {defineStore} from "pinia";
import {ref, type Ref} from "vue";
import {ElMessage} from "element-plus";

export const useVideoStore=defineStore('video',()=>{
    const videoTable:Ref<Object[]>=ref([])

    const addVideoTable=(name:string, type:string)=>{
        const match=name.match(/(.*)\.[^.]+$/)
        let shortType=''
        if(type==='x-matroska') shortType='mkv'
        else if(type==='quicktime') shortType='mov'
        else shortType=type
        const videoData:{name:string, type:string, title:string}= {
            type: shortType,
            name:name,
            title:match?.[1],
            resolution:'',
            frame:'',
            crf:18,
            bit:1000,
            status:'待设置输出格式'
        }
        const isExists=videoTable.value.some(item=>item.name===name)
        if(!isExists){
            videoTable.value.push(videoData)
        }
        else{
            ElMessage.warning('该文件已添加于列表中！')
        }
    }

    const clearVideoTable=()=>{
        if(videoTable.value.length>0){
            videoTable.value.splice(0,videoTable.value.length)
            ElMessage.success('视频列表已清空！')
        }
    }

    const deleteRow=(index:number, row:{name:string})=>{
        let title=row.name
        videoTable.value.splice(index,1)
        ElMessage.warning('成功删除：'+title)
    }

    const setOptions=(index:number,option:{exportFormat:string,mode:string,bit:number,resolution:string,frame:string,transcodeMode:string,preset:string,crf:number})=>{
        const updateItem = (item: any) => {
            item.exportFormat = option.exportFormat;
            item.mode=option.mode;
            item.bit=option.bit.toString()+'k'
            item.resolution=option.resolution
            item.frame=option.frame
            item.transcodeMode=option.transcodeMode
            item.preset=option.preset
            item.crf=option.crf
            item.status='待处理'
            return item;
        };

        if (index === -1) {
            videoTable.value = videoTable.value.map(updateItem);
        } else {
            videoTable.value[index] = updateItem(videoTable.value[index]);
        }
        ElMessage.success('设置成功！')
    }

    const addExport=(index:number,exportPath:string, exportName:string)=>{
        videoTable.value[index].exportPath=exportPath
        videoTable.value[index].exportName=exportName
    }

    const checkOption = (index: number) => {
        if (index === -1) {
            return videoTable.value.every(row => {
                return typeof row.exportFormat === 'undefined'
                    || (row.exportFormat!=='aac' && typeof row.mode==='undefined')
                    || (row.mode==='transcode' && typeof row.transcodeMode==='undefined')
                    || (row.transcodeMode==='preset' && typeof row.preset==='undefined');
            });
        } else {
            const { exportFormat ,mode,transcodeMode,preset} = videoTable.value[index] as { exportFormat: string,mode:string,transcodeMode:string,preset:string};
            return typeof exportFormat === 'undefined' || (exportFormat!=='aac' && typeof mode==='undefined')
                || (mode==='transcodeMode' && typeof transcodeMode==='undefined')
                || (transcodeMode==='preset' && typeof preset==='undefined');
        }
    }

    const updateStatus=(index:number,status:string)=>{
        const updateItem = (item: any) => {
            item.status=status
            return item;
        };
        if(index===-1){
            videoTable.value = videoTable.value.map(updateItem);
        }
        else{
            videoTable.value[index] = updateItem(videoTable.value[index]);
        }
    }

    return{
        videoTable,
        addVideoTable,
        clearVideoTable,
        deleteRow,
        setOptions,
        addExport,
        checkOption,
        updateStatus,
    }
},{
    persist:true,
})