/**
 * 卡密生成工具 - 主进程
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { generateMultipleKeys, saveKeysToExcel } = require('./key_generator');

// 保持对窗口对象的全局引用，避免JavaScript对象被垃圾回收时窗口关闭
let mainWindow;

// 创建主窗口
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 700,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    resizable: false,
    icon: path.join(__dirname, '..', 'build', 'icon.ico')
  });

  // 加载应用的index.html
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // 去掉菜单栏
  mainWindow.setMenu(null);

  // 当窗口关闭时触发
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 应用程序准备好后创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  // 在macOS上，除非用户用Cmd+Q确定退出，否则应用和菜单栏通常会保持活动状态
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // 在macOS上，当点击dock图标且没有其他窗口打开时，通常在应用程序中重建一个窗口
  if (mainWindow === null) createWindow();
});

// 处理生成卡密请求
ipcMain.handle('generate-keys', async (event, options) => {
  try {
    // 从选项中获取参数
    const { count, filename } = options;
    const validMinutes = 43200; // 默认30天

    // 检查参数有效性
    if (!count || count <= 0 || !filename) {
      return { 
        success: false, 
        error: '无效的参数，请确保卡密数量和文件名有效'
      };
    }

    // 确保文件名有.xlsx后缀
    let outputFilename = filename;
    if (!outputFilename.toLowerCase().endsWith('.xlsx')) {
      outputFilename += '.xlsx';
    }

    // 构建保存路径（相对于应用目录）
    const savePath = path.join(app.getPath('exe'), '..', outputFilename);

    // 生成卡密
    console.log(`生成${count}个卡密，有效期${validMinutes}分钟，保存到${savePath}`);
    const keys = generateMultipleKeys(count, validMinutes);

    // 保存到Excel文件
    await new Promise((resolve, reject) => {
      // 创建工作簿和工作表
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('卡密列表');
      
      // 设置列头
      worksheet.columns = [
        { header: '卡密', key: 'key', width: 30 },
        { header: '有效期(分钟)', key: 'valid_minutes', width: 15 }
      ];
      
      // 添加数据行
      keys.forEach(key => {
        worksheet.addRow({
          key: key.key,
          valid_minutes: key.validMinutes
        });
      });
      
      // 设置标题行样式
      worksheet.getRow(1).font = { bold: true };
      
      // 保存工作簿
      workbook.xlsx.writeFile(savePath)
        .then(() => {
          console.log(`已将${keys.length}个卡密保存到Excel文件: ${savePath}`);
          resolve();
        })
        .catch(error => {
          console.error('保存Excel文件时出错:', error);
          reject(error);
        });
    });

    return { 
      success: true, 
      count: keys.length,
      savePath,
      // 只返回前5个卡密进行显示
      keys: keys.slice(0, 5).map(k => k.key)
    };
  } catch (error) {
    console.error('生成卡密出错:', error);
    return { 
      success: false, 
      error: error.message || '生成卡密时发生未知错误'
    };
  }
}); 