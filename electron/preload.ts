const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args);
    }
  },
  systemInfo: {
    os: {
      platform: process.platform,
      release: os.release(),
      version: os.version(),
      arch: os.arch()
    },
    versions: process.versions
  }
});

// Listen for window size changes from main process
ipcRenderer.on('update-settings', (_, settings) => {
  const currentSettings = JSON.parse(localStorage.getItem('teleprompterSettings') || '{}');
  localStorage.setItem('teleprompterSettings', JSON.stringify({
    ...currentSettings,
    ...settings
  }));
}); 