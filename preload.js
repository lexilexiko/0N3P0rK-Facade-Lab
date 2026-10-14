const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fasadLab', Object.freeze({
  unlock: password => ipcRenderer.invoke('auth:unlock', password)
}));
