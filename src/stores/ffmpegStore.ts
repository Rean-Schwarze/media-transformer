import {defineStore} from "pinia";
import {ElMessage} from "element-plus";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {toBlobURL} from "@ffmpeg/util";

export const useFFMpegStore=defineStore('ffmpeg',()=>{
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm/'
    const ffmpeg = new FFmpeg();

    const initFFMpeg=async ()=>{
        ffmpeg.on('log', (e) => {
            console.log(e.message);
        });

        await ffmpeg.load({
            coreURL: await toBlobURL(`./ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`./ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`./ffmpeg-core.worker.js`, 'text/javascript')
        })
        ElMessage.success('FFMpeg 已加载')
    }


    return{
        ffmpeg,
        initFFMpeg,
    }
},{
    persist:true,
})