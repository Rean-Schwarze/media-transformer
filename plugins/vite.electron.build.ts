import type {Plugin} from "vite";
import fs from 'node:fs'
import * as electronBuilder from 'electron-builder';
import * as path from "node:path";

// 防止没有npm run dev，直接npm run build而找不到js
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
    require('esbuild').buildSync({
        entryPoints:['src/preload.ts'],
        bundle:true,
        outfile:'dist/preload.js',
        platform:'node',
        target:'node12',
        external:['electron']
    })
}}

export const electronBuildPlugin=():Plugin=>{
    return{
        name:'electron-build',
        // 等vite打包完成
        closeBundle() {
            buildBackground()
            // electron-builder需要指定package.json
            const packageJson=JSON.parse(fs.readFileSync('package.json','utf-8'))
            packageJson.main='background.js'
            fs.writeFileSync('dist/package.json',JSON.stringify(packageJson,null,4))
            fs.mkdirSync('dist/node_modules') // 弄一个空的文件夹防止bug

        //     打包
            electronBuilder.build({
                config:{
                    directories:{
                        output:path.resolve(process.cwd(),'release'),
                        app:path.resolve(process.cwd(),'dist'),
                    },
                    files:['**/*'],
                    asar:true, // 压缩
                    // appId:'com.example.app',
                    productName:'media-transformer',
                    nsis:{
                        oneClick:false, // 取消一键安装
                        allowToChangeInstallationDirectory: true, //允许用户选择安装目录
                    }
                },
            })
        },
    }
}