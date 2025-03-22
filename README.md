# Voice-Tools 卡密生成工具

一个简单高效的卡密生成和验证工具，用于创建和验证带有过期时间的安全卡密。提供命令行和图形界面两种使用方式。

## 功能特点

- ✨ 生成安全的24位卡密，包含过期时间和校验和
- 🔍 验证卡密的有效性和完整性
- 🔄 批量生成多个卡密
- 💾 将卡密保存为JSON或Excel格式文件
- 🔒 基于密钥和MD5哈希的安全机制
- 🕒 卡密自带过期时间，无需数据库支持
- 🖥️ 支持命令行和GUI桌面应用两种使用方式

## 项目结构

```
voice-tools/
├── src/                      # GUI应用源代码
│   ├── main.js               # Electron主进程
│   ├── preload.js            # 预加载脚本
│   ├── key_generator.js      # 卡密生成逻辑
│   └── renderer/             # 渲染进程
│       ├── index.html        # GUI界面
│       └── index.js          # 界面交互逻辑
├── build/                    # 构建资源
├── key_generator.js          # 卡密生成核心模块
├── generate_keys.js          # 命令行工具入口
├── package.json              # 项目配置
└── README.md                 # 项目文档
```

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

## 使用方式

本项目提供两种使用方式：命令行工具和图形界面应用。

### 一、命令行工具

#### 命令选项

```bash
node generate_keys.js [选项]
```

选项:
- `-m, --minutes <分钟>`：设置卡密有效期（分钟），默认为43200（30天）
- `-c, --count <数量>`：生成卡密的数量，默认为1
- `-o, --output <文件>`：将生成的卡密保存到JSON文件
- `-e, --excel <文件>`：将生成的卡密保存到Excel文件
- `-v, --verify <卡密>`：验证指定的卡密
- `-h, --help`：显示帮助信息

#### 示例

1. 生成单个默认卡密（有效期30天）
   ```bash
   node generate_keys.js
   ```

2. 生成有效期为7天的卡密
   ```bash
   node generate_keys.js -m 10080
   ```

3. 批量生成10个卡密并保存到JSON文件
   ```bash
   node generate_keys.js -c 10 -o keys.json
   ```

4. 批量生成10个卡密并保存到Excel文件
   ```bash
   node generate_keys.js -c 10 -e keys.xlsx
   ```
   *注意：Excel文件中只包含卡密和有效期两列，简化了查看和使用。*

5. 验证卡密
   ```bash
   node generate_keys.js -v ABC123DEF456GHI789JKL012
   ```

### 二、GUI桌面应用

图形界面版提供了更加直观的操作方式，无需记忆命令参数。

#### 启动方式

开发环境下启动：
```bash
npm start
```

#### 使用说明

1. 在界面中设置以下参数：
   - **卡密数量**：需要生成的卡密数量
   - **文件名**：保存的Excel文件名称（如未包含.xlsx后缀，将自动添加）

2. 点击"生成卡密"按钮，系统会自动生成指定数量的卡密
   
3. 成功生成后，可以查看：
   - 生成的卡密总数
   - 文件保存路径
   - 示例卡密（显示前5个）

4. 生成的Excel文件将保存在应用程序所在目录下，包含"卡密"和"有效期(分钟)"两列

#### 打包为可执行文件

```bash
npm run build
```

打包后的可执行文件将位于`dist`目录下，用户可以直接双击运行，无需安装Node.js环境。

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
  saveKeysToFile,
  saveKeysToExcel
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

// 保存到JSON文件
saveKeysToFile(keys, 'my_keys.json');

// 保存到Excel文件（仅包含卡密和有效期）
saveKeysToExcel(keys, 'my_keys.xlsx');
```

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

## 许可证

[MIT](LICENSE) 