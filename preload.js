const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fasadlab', {
  savePdfDocument: options => ipcRenderer.invoke('document:save-pdf', options)
});
