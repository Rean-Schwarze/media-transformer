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
        const audioMetadata:{album:string,artist:string,title:string,cover:string,type:string}= {
            album: common?.album,
            artist: common?.artist,
            title: typeof (common?.title) === 'undefined' ? name.split('.')[0] : common?.title,
            cover: blobUrl,
            type: type==='mpeg'?'mp3':type
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
        audioTable.value=[]
    }

    return{
        audioTable,
        addAudioTable,
        clearAudioTable
    }

},{
    persist:true,
})