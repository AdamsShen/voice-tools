# Voice-Tools 卡密生成工具

一个简单高效的卡密生成和验证工具，用于创建和验证带有过期时间的安全卡密。

## 功能特点

- ✨ 生成安全的24位卡密，包含过期时间和校验和
- 🔍 验证卡密的有效性和完整性
- 🔄 批量生成多个卡密
- 💾 将卡密保存为JSON格式文件
- 🔒 基于密钥和MD5哈希的安全机制
- 🕒 卡密自带过期时间，无需数据库支持
- 🖥️ 支持命令行和GUI桌面应用两种使用方式

## 安装

### 前提条件

- Node.js 12.0 或更高版本

### 安装步骤

1. 克隆或下载此仓库
   ```bash
   git clone https://github.com/yourusername/voice-tools.git
   cd voice-tools
   ```

2. 安装依赖
   ```bash
   npm install
   ```

## 使用方法

### 命令行选项

```bash
node generate_keys.js [选项]
```

选项:
- `-m, --minutes <分钟>`：设置卡密有效期（分钟），默认为43200（30天）
- `-c, --count <数量>`：生成卡密的数量，默认为1
- `-o, --output <文件>`：将生成的卡密保存到指定文件
- `-v, --verify <卡密>`：验证指定的卡密
- `-h, --help`：显示帮助信息

### 示例

1. 生成单个默认卡密（有效期30天）
   ```bash
   node generate_keys.js
   ```

2. 生成有效期为7天的卡密
   ```bash
   node generate_keys.js -m 10080
   ```

3. 批量生成10个卡密并保存到文件
   ```bash
   node generate_keys.js -c 10 -o keys.json
   ```

4. 验证卡密
   ```bash
   node generate_keys.js -v ABC123DEF456GHI789JKL012
   ```

## 卡密格式说明

生成的卡密为24位字符串，由三部分组成：
- 8位随机部分
- 8位过期时间（16进制表示的时间戳）
- 8位校验和（使用MD5算法）

示例: `5B7DE4F160D432AB6FC91A03`

## 作为模块使用

您也可以在自己的Node.js项目中引入并使用此工具：

```javascript
const { 
  generateSecureKey, 
  parseSecureKey, 
  generateMultipleKeys, 
  saveKeysToFile 
} = require('./key_generator');

// 生成单个卡密
const key = generateSecureKey(4320); // 3天有效期
console.log(key);

// 解析卡密
const parsed = parseSecureKey(key.key);
console.log(parsed);

// 批量生成
const keys = generateMultipleKeys(5, 1440); // 5个卡密，每个1天有效期
console.log(keys);

// 保存到文件
saveKeysToFile(keys, 'my_keys.json');
```

## GUI桌面应用版本

除了命令行工具外，您还可以将其构建为带图形界面的桌面应用程序，便于非技术用户使用。

### 技术方案

使用Electron框架将命令行工具转换为GUI应用，主要优势：
- 保留原有Node.js代码逻辑
- 使用HTML/CSS/JavaScript构建界面
- 跨平台支持（Windows、macOS、Linux）
- 打包为独立可执行文件，无需安装Node.js环境

### 实现步骤

#### 1. 创建Electron项目

```bash
# 创建项目目录
mkdir voice-tools-gui
cd voice-tools-gui

# 初始化package.json
npm init -y

# 安装Electron及相关依赖
npm install --save-dev electron electron-builder
npm install --save electron-store
```

#### 2. 配置项目结构

```
voice-tools-gui/
├── src/
│   ├── main.js          # 主进程文件
│   ├── preload.js       # 预加载脚本
│   ├── key_generator.js # 移植的卡密生成逻辑
│   └── renderer/
│       ├── index.html   # 主界面HTML
│       ├── style.css    # 样式文件 
│       └── index.js     # 渲染进程脚本
├── package.json         # 项目配置
└── build/               # 构建相关资源
```

#### 3. 创建必要的文件

**package.json 配置**
```json
{
  "name": "voice-tools-gui",
  "version": "1.0.0",
  "description": "卡密生成工具 - 桌面版",
  "main": "src/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "build": {
    "appId": "com.yourcompany.voice-tools",
    "productName": "卡密生成工具",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    }
  }
}
```

**主进程文件 (main.js)**
```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { generateMultipleKeys } = require('./key_generator');

let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

// 处理窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 处理生成卡密请求
ipcMain.handle('generate-keys', async (event, options) => {
  try {
    const { count, minutes, filename } = options;
    
    // 生成卡密
    const keys = generateMultipleKeys(count, minutes);
    
    // 构建保存路径（默认在应用同级目录）
    const savePath = path.join(app.getPath('exe'), '..', filename || 'keys.json');
    
    // 准备数据
    const data = {
      generated_at: new Date().toISOString(),
      keys: keys.map(key => ({
        key: key.key,
        generated_at: key.generatedAt,
        expires_at: key.expiresAt,
        valid_minutes: key.validMinutes
      }))
    };
    
    // 保存文件
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
    
    return { success: true, keys, savePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 处理选择保存位置
ipcMain.handle('select-save-path', async (event, defaultFilename) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存卡密文件',
    defaultPath: path.join(app.getPath('exe'), '..', defaultFilename || 'keys.json'),
    filters: [
      { name: 'JSON文件', extensions: ['json'] }
    ]
  });
  
  return result.canceled ? null : result.filePath;
});
```

**更多完整代码示例可参考GUI桌面应用源码**。

#### 4. 打包应用

```bash
# 构建可执行文件
npm run build
```

打包后的应用将位于 `dist` 目录下，包含安装版和便携版两种格式。

### 使用方法

1. 双击已编译的可执行文件启动应用
2. 在界面中设置卡密数量和有效期
3. 设置保存文件名（默认为keys.json）
4. 点击"生成卡密"按钮
5. 卡密将自动保存到应用所在目录

### 开发与定制

如需修改界面或增加功能：

1. 克隆GUI应用源码
2. 安装开发依赖：`npm install`
3. 启动开发模式：`npm start`
4. 修改源码后重新打包：`npm run build`

## 安全注意事项

在生产环境中使用时，请确保：

1. 修改代码中的 `SECRET_KEY` 为您自己的密钥
2. 妥善保管密钥，避免泄露
3. 考虑将密钥存储在环境变量或配置文件中

## 使用场景

此工具适用于多种场景：
- 软件授权系统
- 会员验证服务
- 付费API访问控制
- 临时服务授权

## 贡献

欢迎提交问题和改进建议！

## 许可证

[MIT](LICENSE) 