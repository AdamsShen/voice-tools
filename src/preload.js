/**
 * 卡密生成工具 - 预加载脚本
 * 用于安全地将主进程的API暴露给渲染进程
 */

const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('api', {
  // 生成卡密
  generateKeys: (options) => ipcRenderer.invoke('generate-keys', options),
  
  // 获取应用版本
  getVersion: () => '1.0.0'
}); 