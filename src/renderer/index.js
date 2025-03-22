/**
 * 卡密生成工具 - 渲染进程脚本
 */

// DOM 元素
const countInput = document.getElementById('count');
const filenameInput = document.getElementById('filename');
const generateBtn = document.getElementById('generate-btn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const keysCountSpan = document.getElementById('keysCount');
const savePathSpan = document.getElementById('savePath');
const keysList = document.getElementById('keysList');
const versionSpan = document.getElementById('version');

// 设置版本号
versionSpan.textContent = window.api.getVersion();

// 处理生成卡密按钮点击
generateBtn.addEventListener('click', async () => {
  try {
    // 隐藏之前的结果和错误
    resultDiv.classList.remove('active');
    errorDiv.classList.remove('active');
    
    // 获取表单值
    const count = parseInt(countInput.value);
    const filename = filenameInput.value.trim();
    
    // 简单验证
    if (!count || count <= 0) {
      showError('请输入有效的卡密数量');
      return;
    }
    
    if (!filename) {
      showError('请输入有效的文件名');
      return;
    }
    
    // 禁用按钮，显示加载状态
    setLoading(true);
    
    // 调用主进程生成卡密
    const result = await window.api.generateKeys({ count, filename });
    
    // 处理结果
    if (result.success) {
      // 显示成功结果
      keysCountSpan.textContent = result.count;
      savePathSpan.textContent = result.savePath;
      
      // 显示卡密列表
      keysList.innerHTML = '';
      result.keys.forEach(key => {
        const li = document.createElement('li');
        li.textContent = key;
        keysList.appendChild(li);
      });
      
      // 显示结果区域
      resultDiv.classList.add('active');
    } else {
      // 显示错误信息
      showError(result.error || '生成卡密失败');
    }
  } catch (error) {
    // 显示错误信息
    showError('操作失败: ' + error.message);
  } finally {
    // 恢复按钮状态
    setLoading(false);
  }
});

// 设置加载状态
function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.textContent = isLoading ? '正在生成...' : '生成卡密';
}

// 显示错误信息
function showError(message) {
  const errorMessageElement = document.getElementById('error-message');
  errorMessageElement.textContent = message;
  errorDiv.classList.add('active');
} 