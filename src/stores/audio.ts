import {defineStore} from "pinia";
import {ref, type Ref} from "vue";
import {ElMessage} from "element-plus";

export const useAudioStore=defineStore('audio',()=>{
    const audioTable:Ref<Object[]>=ref([])

    const addAudioTable=(common:{picture:Array<any>,album:string,artist:string,title:string}, name:string, type:string)=>{
        // 创建一个 Blob 对象
        const blob = new Blob([common?.picture?.[0].data], { type: 'image/jpeg' });
        // 创建一个 Blob URL
        const blobUrl = typeof common.picture==='undefined'?'':URL.createObjectURL(blob);
        const audioMetadata:{album:string,artist:string,title:string,cover:string,type:string,name:string}= {
            album: common?.album,
            artist: common?.artist,
            title: typeof (common?.title) === 'undefined' ? name.split('.')[0] : common?.title,
            cover: blobUrl,
            type: type==='mpeg'?'mp3':type,
            name:name,
        }
        const isExists=audioTable.value.some(item=>item.album===audioMetadata.album && item.artist===audioMetadata.artist && item.title===audioMetadata.title)
        if(!isExists){
            audioTable.value.push(audioMetadata)
        }
        else{
            ElMessage.warning('该文件已添加于列表中！')
        }
    }

    const clearAudioTable=()=>{
        if(audioTable.value.length>0){
            audioTable.value.splice(0,audioTable.value.length)
            ElMessage.success('音频列表已清空！')
        }
    }

    const deleteRow=(index:number, row:{title:string})=>{
        let title=row.title
        audioTable.value.splice(index,1)
        ElMessage.warning('成功删除：'+title)
    }

    const setOptions=(index:number,option:{exportFormat:string,sample:string,bit:string,compress:number})=>{
        const updateItem = (item: any) => {
            item.exportFormat = option.exportFormat;
            item.sample = option.sample;
            item.bit = option.bit;
            item.compress = option.compress;
            return item;
        };

        if (index === -1) {
            audioTable.value.forEach((item,index)=>{
                audioTable.value[index]=updateItem(item)
            })
        } else {
            audioTable.value[index] = updateItem(audioTable.value[index]);
        }
        ElMessage.success('设置成功！')
    }

    const addExport=(index:number,exportPath:string, exportName:string)=>{
        audioTable.value[index].exportPath=exportPath
        audioTable.value[index].exportName=exportName
    }

    const checkOption = (index: number) => {
        if (index === -1) {
            return audioTable.value.every(row => {
                return typeof row.bit === 'undefined' || typeof row.exportFormat === 'undefined' || typeof row.sample === 'undefined' || (row.exportFormat === 'flac' && typeof row.compress === 'undefined');
            });
        } else {
            const { exportFormat, sample, bit, compress } = audioTable.value[index] as { exportFormat: string, sample: string, bit: string, compress?: number };
            return typeof bit === 'undefined' || typeof exportFormat === 'undefined' || typeof sample === 'undefined' || (exportFormat === 'flac' && typeof compress === 'undefined');
        }
    }

    return{
        audioTable,
        addAudioTable,
        clearAudioTable,
        deleteRow,
        setOptions,
        checkOption,
        addExport,
    }

},{
    persist:true,
})