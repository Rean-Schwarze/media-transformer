const { contextBridge,ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myApi', {
    // 这里注意避免将ipcRenderer等致命api直接挂载在window上，可能会导致安全问题
    sendMsg: (msg:string) => ipcRenderer.send(msg),
    // 设置相关api
    getSettings: (key) => ipcRenderer.invoke('get-settings', key),
    setSettings: (key, value) => ipcRenderer.invoke('set-settings', key, value)
})