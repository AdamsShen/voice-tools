/**
 * 卡密生成命令行工具
 */

const path = require('path');
const { 
  generateSecureKey, 
  parseSecureKey, 
  generateMultipleKeys, 
  saveKeysToFile,
  saveKeysToExcel 
} = require('./key_generator');

// 命令行工具部分
const args = process.argv.slice(2);

// 显示帮助信息
if (args.includes('-h') || args.includes('--help')) {
  console.log('安全卡密生成工具');
  console.log('用法:');
  console.log('  node generate_keys.js [选项]');
  console.log('');
  console.log('选项:');
  console.log('  -m, --minutes <分钟>   设置卡密有效期（分钟），默认为43200（30天）');
  console.log('  -c, --count <数量>     生成卡密的数量，默认为1');
  console.log('  -o, --output <文件>    将生成的卡密保存到JSON文件');
  console.log('  -e, --excel <文件>     将生成的卡密保存到Excel文件');
  console.log('  -v, --verify <卡密>    验证指定的卡密');
  console.log('  -h, --help             显示帮助信息');
  process.exit(0);
}

// 验证卡密
const verifyIndex = args.indexOf('-v') !== -1 ? args.indexOf('-v') : args.indexOf('--verify');
if (verifyIndex !== -1 && args[verifyIndex + 1]) {
  const cardKey = args[verifyIndex + 1];
  const parsed = parseSecureKey(cardKey);
  console.log('验证卡密:', cardKey);
  if (parsed) {
    console.log('生成时间:', new Date(parsed.generatedAt).toISOString());
    console.log('过期时间:', new Date(parsed.expiresAt).toISOString());
    console.log('是否有效:', parsed.isValid ? '有效' : '已过期');
  } else {
    console.log('验证失败: 无效的卡密');
  }
  process.exit(0);
}

// 解析参数
const validMinutes = (() => {
  const index = args.indexOf('-m') !== -1 ? args.indexOf('-m') : args.indexOf('--minutes');
  return index !== -1 && args[index + 1] ? parseInt(args[index + 1]) : 43200;
})();

const count = (() => {
  const index = args.indexOf('-c') !== -1 ? args.indexOf('-c') : args.indexOf('--count');
  return index !== -1 && args[index + 1] ? parseInt(args[index + 1]) : 1;
})();

const outputFile = (() => {
  const index = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
})();

// 添加Excel输出参数解析
const excelFile = (() => {
  const index = args.indexOf('-e') !== -1 ? args.indexOf('-e') : args.indexOf('--excel');
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
})();

// 生成卡密
const keys = generateMultipleKeys(count, validMinutes);

// 输出结果
keys.forEach((result, index) => {
  console.log(`卡密 ${index + 1}:`);
  console.log('  卡密:', result.key);
  console.log('  生成时间:', result.generatedAt);
  console.log('  过期时间:', result.expiresAt);
  console.log('  有效期(分钟):', result.validMinutes);
  console.log('');
});

// 保存到JSON文件
if (outputFile) {
  saveKeysToFile(keys, outputFile);
}

// 保存到Excel文件
if (excelFile) {
  saveKeysToExcel(keys, excelFile);
} 