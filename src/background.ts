// electron 主进程
import {app,BrowserWindow,screen,ipcMain } from 'electron'
import * as path from "path";


const win=null
app.whenReady().then(()=>{
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    const realWidth=width/1.5;
    const realHeight=height/1.5;
    console.log(path.join(__dirname, 'preload.js'))
    const win=new BrowserWindow({
        width:realWidth,
        height:realHeight,
        // frame:false, // 无边框窗口
        titleBarStyle: 'hidden',
        // titleBarOverlay: {
        //     height: 30
        // },
        webPreferences: {
            nodeIntegration:true, // 可以在渲染进程中使用node的api
            contextIsolation:true, // 关闭渲染进程的沙箱
            webSecurity:false, // 关闭CORS
            // 预加载脚本
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    if(process.argv[2]){
        win.loadURL(process.argv[2]) // 开发环境
    }
    else{
        win.loadFile('index.html') // 生产环境
    }


// 关闭窗口
    ipcMain.on('close', () => {
        win.close();
    });

// 最小化窗口
    ipcMain.on('minimize', () => {
        win.minimize();
    });

})
