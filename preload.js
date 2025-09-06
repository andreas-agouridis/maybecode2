const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pythonAPI', {
  run: (code) => ipcRenderer.invoke('run-python', code),
  check: () => ipcRenderer.invoke('check-python')
});