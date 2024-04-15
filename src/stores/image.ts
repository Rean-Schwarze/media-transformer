import {defineStore} from "pinia";
import {ref, type Ref} from "vue";
import {ElMessage} from "element-plus";

export const useImageStore=defineStore('image',()=>{


},{
    persist:true,
})