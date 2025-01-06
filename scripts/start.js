import fs from 'fs';
import path from 'path';

// 复制文件夹
async function copyFolder(src, dest) {
  try {
    // 创建目标文件夹
    await fs.promises.mkdir(dest, { recursive: true });

    // 读取源文件夹内容
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    // 遍历文件夹内容
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // 如果是文件夹，递归复制
      if (entry.isDirectory()) {
        await copyFolder(srcPath, destPath);
      } else {
        // 如果是文件，直接复制
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
    console.log("已将 " + src + " 复制到 " + dest);
  } catch (error) {
    console.error("复制文件夹从 " + src + " 到 " + dest + " 时出错:", error);
  }
}

// 定义源文件夹和目标文件夹路径
const accountsSrc = path.join(process.cwd(), "accounts");
const configSrc = path.join(process.cwd(), 'config');
const accountsDest = path.join(process.cwd(), "app", "accounts");
const configDest = path.join(process.cwd(), "app", "config");

// 主函数
(async () => {
  // 复制 accounts 文件夹
  await copyFolder(accountsSrc, accountsDest);

  // 复制 config 文件夹
  await copyFolder(configSrc, configDest);

  console.log("启动应用程序...");
  
  // 导入并启动应用程序
  await import("../app/index.js");
})();