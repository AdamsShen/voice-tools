/**
 * 安全卡密生成工具
 * 生成的卡密包含时间信息，可以直接从卡密中解析出生成时间和有效期
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs'); // 导入ExcelJS库

// 密钥，实际应用中应该保密存储
const SECRET_KEY = 'voice-card-secret-key-2023-secure';

/**
 * 生成安全卡密
 * @param {number} validMinutes 有效期（分钟）
 * @returns {object} 生成的卡密信息
 */
function generateSecureKey(validMinutes = 43200) { // 默认30天 (43200分钟)
  // 获取当前时间戳和过期时间戳
  const now = Math.floor(Date.now() / 1000); // 转换为秒
  const expires = now + validMinutes * 60; // 过期时间（秒）
  
  // 将过期时间转换为16进制字符串（8个字符）
  const expiresHex = expires.toString(16).padStart(8, '0').toUpperCase();
  
  // 生成随机部分（8个字符）
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  // 计算哈希值作为校验和
  const hash = crypto.createHash('md5')
    .update(randomPart + expiresHex + SECRET_KEY)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  // 组合成24位卡密: 8位随机部分 + 8位过期时间 + 8位校验和
  const cardKey = randomPart + expiresHex + hash;
  
  return {
    key: cardKey,
    generatedAt: new Date(now * 1000).toISOString(),
    expiresAt: new Date(expires * 1000).toISOString(),
    validMinutes: validMinutes
  };
}

/**
 * 解析安全卡密
 * @param {string} cardKey 卡密
 * @returns {object|null} 解析结果，包含生成时间和过期时间，如果解析失败则返回null
 */
function parseSecureKey(cardKey) {
  try {
    if (!cardKey || cardKey.length !== 24) {
      return null;
    }
    
    // 提取各部分
    const randomPart = cardKey.substring(0, 8);
    const expiresHex = cardKey.substring(8, 16);
    const hashPart = cardKey.substring(16);
    
    // 验证校验和
    const expectedHash = crypto.createHash('md5')
      .update(randomPart + expiresHex + SECRET_KEY)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
    
    if (hashPart !== expectedHash) {
      return null;
    }
    
    // 解析过期时间
    const expires = parseInt(expiresHex, 16);
    if (isNaN(expires)) {
      return null;
    }
    
    // 估算生成时间（假设有效期为30天）
    const generatedAt = expires - 30 * 24 * 60 * 60;
    
    return {
      generatedAt: generatedAt * 1000, // 转换为毫秒
      expiresAt: expires * 1000, // 转换为毫秒
      isValid: Math.floor(Date.now() / 1000) < expires
    };
  } catch (error) {
    console.error('解析卡密时出错:', error);
    return null;
  }
}

/**
 * 生成多个卡密
 * @param {number} count 卡密数量
 * @param {number} validMinutes 有效期（分钟）
 * @returns {Array} 生成的卡密信息数组
 */
function generateMultipleKeys(count, validMinutes) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateSecureKey(validMinutes));
  }
  return keys;
}

/**
 * 将卡密保存到文件
 * @param {Array} keys 卡密信息数组
 * @param {string} filePath 文件路径
 */
function saveKeysToFile(keys, filePath) {
  const data = {
    generated_at: new Date().toISOString(),
    keys: keys.map(key => ({
      key: key.key,
      generated_at: key.generatedAt,
      expires_at: key.expiresAt,
      valid_minutes: key.validMinutes
    }))
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`已将${keys.length}个卡密保存到文件: ${filePath}`);
}

/**
 * 将卡密保存到Excel文件
 * @param {Array} keys 卡密信息数组
 * @param {string} filePath 文件路径
 */
function saveKeysToExcel(keys, filePath) {
  // 创建工作簿和工作表
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('卡密列表');
  
  // 设置列头 - 只保留卡密和有效期列
  worksheet.columns = [
    { header: '卡密', key: 'key', width: 30 },
    { header: '有效期(分钟)', key: 'valid_minutes', width: 15 }
  ];
  
  // 添加数据行 - 只添加key和valid_minutes
  keys.forEach(key => {
    worksheet.addRow({
      key: key.key,
      valid_minutes: key.validMinutes
    });
  });
  
  // 设置标题行样式
  worksheet.getRow(1).font = { bold: true };
  
  // 保存工作簿
  workbook.xlsx.writeFile(filePath)
    .then(() => {
      console.log(`已将${keys.length}个卡密保存到Excel文件: ${filePath}`);
    })
    .catch(error => {
      console.error('保存Excel文件时出错:', error);
    });
}

module.exports = {
  generateSecureKey,
  parseSecureKey,
  generateMultipleKeys,
  saveKeysToFile,
  saveKeysToExcel
}; 