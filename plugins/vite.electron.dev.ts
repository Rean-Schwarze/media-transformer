import type {Plugin} from "vite";
import type {AddressInfo} from "net";
import {spawn} from 'child_process';
import fs from 'node:fs'


const buildBackground=()=>{{
    // vite的开发环境使用esbuild，打包环境使用rollup, 将ts编译为js
    require('esbuild').buildSync({
        entryPoints:['src/background.ts'],
        bundle:true,
        outfile:'dist/background.js',
        platform:'node',
        target:'node12',
        external:['electron']
    })
}}
export const electronDevPlugin=():Plugin=>{
    return{
        name:'electron-dev',
        configureServer(server){
            buildBackground()
            server?.httpServer?.once('listening',()=>{
                // 读取vite服务的信息
                const addressInfo=server.httpServer?.address() as AddressInfo
                // 拼接ip地址
                const IP=`http://localhost:${addressInfo.port}`
                // 利用进程传递参数, 第0个参数：require()返回路径（electron的入口文件），electron不认识ts文件，第1个参数：路径，第2个参数：IP
                let electronProcess = spawn(require('electron'),['dist/background.js',IP])
                // 监控文件，热更
                fs.watchFile('src/background.ts',()=>{
                    electronProcess.kill()
                    buildBackground()
                    electronProcess=spawn(require('electron'),['dist/background.js',IP])
                })
                // 监听日志
                electronProcess.stderr.on('data',(data)=>{
                    console.log(data.toString())
                })
            })
        }
    }
}