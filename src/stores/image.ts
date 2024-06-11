import {defineStore} from "pinia";
import {ref, type Ref} from "vue";
import {ElMessage} from "element-plus";

export const useImageStore=defineStore('image',()=>{
    const imageTable:Ref<Object[]>=ref([])

    const maxLength=20

    const getImageDimensions=(blob:Blob)=> {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();

            img.onload = () => {
                const width = img.width;
                const height = img.height;
                URL.revokeObjectURL(url); // 释放内存
                resolve({ width, height });
            };

            img.onerror = (error) => {
                URL.revokeObjectURL(url); // 释放内存
                reject(error);
            };

            img.src = url;
        });
    }

    const addImageTable=async (raw: File) => {
        let match = raw?.name.match(/(.*)\.[^.]+$/)
        let name=match?.[1]
        if(name.length>maxLength){
            const regex = new RegExp(`(.{1,${maxLength}})`, 'g');
            name=name?.match(regex)?.[0]+'...'
        }
        let type = raw?.type.split('/')[1]
        let size = raw?.size
        let sizeInKB = size / 1024;
        let sizeInMB = size / 1024 / 1024;
        let sizeString = ''
        let width = 0
        let height = 0
        let resolution = ''
        if (sizeInMB < 1) {
            sizeString = sizeInKB.toFixed(2) + ' KB'
        } else {
            sizeString = sizeInMB.toFixed(2) + ' MB'
        }
        // 读取图片，获取分辨率
        const reader = new FileReader()
        const blob = new Blob([raw], {type: raw.type})
        const blobUrl = URL.createObjectURL(blob)
        const dimensions = await getImageDimensions(blob)
            .catch(error => {
                console.error('Error loading image:', error);
            });
        width = dimensions.width
        height = dimensions.height
        resolution=width+' x '+height
        const imageData = {
            src: blobUrl,
            name: name,
            type: type,
            resolution: resolution,
            width: width,
            height: height,
            size: sizeString,
            raw:raw,
        }
        const isExists = imageTable.value.some(item => item.name === name)
        if (!isExists) {
            imageTable.value.push(imageData)
        } else {
            ElMessage.warning('该文件已添加于列表中！')
        }
    }

    const getMaxResolution=()=>{
        return imageTable.value.reduce((max, item) => {
            return {
                width: Math.max(max.width, item.width),
                height: Math.max(max.height, item.height)
            };
        }, { width: 0, height: 0 });
    }

    const clearImageTable=()=>{
        if(imageTable.value.length>0){
            imageTable.value.splice(0,imageTable.value.length)
            ElMessage.success('图片列表已清空！')
        }
    }

    const deleteRow=(index:number, row:{name:string})=>{
        let title=row.name
        imageTable.value.splice(index,1)
        ElMessage.warning('成功删除：'+title)
    }

    const setOptions=(index:number,option:{exportFormat:string,newWidth:number,newHeight:number})=>{
        const updateItem = (item: any) => {
            item.exportFormat = option.exportFormat;
            item.newWidth=option.newWidth;
            item.newHeight=option.newHeight;
            return item;
        };

        if (index === -1) {
            imageTable.value = imageTable.value.map(updateItem);
        } else {
            imageTable.value[index] = updateItem(imageTable.value[index]);
        }
        ElMessage.success('设置成功！')
    }

    const checkOption=(index:number)=>{
        if (index === -1) {
            return imageTable.value.every(row => {
                return typeof row.exportFormat === 'undefined';
            });
        } else {
            const { exportFormat } = imageTable.value[index] as { exportFormat: string };
            return typeof exportFormat === 'undefined';
        }
    }

    return {
        imageTable,
        addImageTable,
        clearImageTable,
        deleteRow,
        getMaxResolution,
        setOptions,
        checkOption
    }

},{
    persist:true,
})