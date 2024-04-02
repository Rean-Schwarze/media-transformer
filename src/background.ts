// electron 主进程
import {app,BrowserWindow} from 'electron'

app.whenReady().then(()=>{
    const win=new BrowserWindow({
        width:1280,
        height:720,
        webPreferences: {
            nodeIntegration:true, // 可以在渲染进程中使用node的api
            contextIsolation:false, // 关闭渲染进程的沙箱
            webSecurity:false // 关闭CORS
        }
    })

    if(process.argv[2]){
        win.loadURL(process.argv[2]) // 开发环境
    }
    else{
        win.loadFile('index.html') // 生产环境
    }

})