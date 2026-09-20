const { contextBridge, ipcRenderer } = require('electron');

function bind(channel, callback) {
  const handler = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.off(channel, handler);
}

contextBridge.exposeInMainWorld('trayMenu', {
  invoke: (command, payload = {}) => ipcRenderer.send('tray:invoke', { command, ...payload }),
  onState: (callback) => bind('tray:state', callback),
});
