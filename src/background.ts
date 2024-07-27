// electron 主进程
import {app,BrowserWindow,screen,ipcMain } from 'electron'
import * as path from "path";
import Store from 'electron-store'

const store = new Store();

const win=null
app.whenReady().then(()=>{
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    const realWidth=width/1.5;
    const realHeight=height/1.5;
    const win=new BrowserWindow({
        width:realWidth,
        height:realHeight,
        resizable:false,
        maximizable:false,
        // frame:false, // 无边框窗口
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration:true, // 可以在渲染进程中使用node的api
            contextIsolation:true,
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

    // 获取设置
    ipcMain.handle('get-settings', (event, key) => {
        return store.get(key);
    });

    // 存储设置
    ipcMain.handle('set-settings', (event, key, value) => {
        store.set(key, value);
    });
})