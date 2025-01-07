import fs from "fs";
import path from "path";

// 检查文件是否存在
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 复制文件
async function copyFile(src, dest) {
  try {
    if (await fileExists(dest)) {
      console.log("文件已存在于 " + dest + "，跳过复制。");
    } else {
      await fs.promises.copyFile(src, dest);
      console.log("已将 " + src + " 复制到 " + dest);
    }
  } catch (error) {
    console.error("复制文件从 " + src + " 到 " + dest + " 时出错:", error);
  }
}

// 创建文件夹
async function createFolder(folderPath) {
  try {
    const folderExists = await fs.promises
      .access(folderPath)
      .then(() => true)
      .catch(() => false);
    if (!folderExists) {
      await fs.promises.mkdir(folderPath, { recursive: true });
      console.log("已创建文件夹: " + folderPath);
    }
  } catch (error) {
    console.error("创建文件夹 " + folderPath + " 时出错:", error);
  }
}

// 修复 mgo-types 和 mgo-system-state 的导入路径
async function fixMgoImports(directory) {
  try {
    const dirEntries = await fs.promises.readdir(directory, {
      withFileTypes: true,
    });
    for (const entry of dirEntries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await fixMgoImports(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        const fileContent = await fs.promises.readFile(fullPath, "utf-8");
        if (fileContent.includes('from "../utils/mgo-types"')) {
          const updatedContent = fileContent.replace(
            /from "\.\.\/utils\/mgo-types"/g,
            'from "../utils/mgo-types.js"'
          );
          await fs.promises.writeFile(fullPath, updatedContent, "utf-8");
          console.log("已修复导入路径: " + fullPath);
        }
        if (fileContent.includes('from "./mgo-system-state"')) {
          const updatedContent = fileContent.replace(
            /from "\.\/mgo-system-state"/g,
            'from "./mgo-system-state.js"'
          );
          await fs.promises.writeFile(fullPath, updatedContent, "utf-8");
          console.log("已修复导入路径: " + fullPath);
        }
      }
    }
  } catch (error) {
    console.error("修复目录 " + directory + " 中的导入路径时出错:", error);
  }
}

// 定义需要复制的文件操作
const copyOperations = [
  {
    src: path.join("config", "proxy_list_tmp.js"),
    dest: path.join("config", "proxy_list.js"),
  },
  {
    src: path.join("accounts", "accounts_tmp.js"),
    dest: path.join("accounts", "accounts.js"),
  },
];

// 主函数
(async () => {
  // 去掉复制文件步骤
  // console.log("复制模板文件");
  // await createFolder("accounts");
  // for (let { src, dest } of copyOperations) {
  //   await copyFile(src, dest);
  // }
  console.log("\n修复 @mgonetwork/mango.js 的导入路径...");
  const mangoJsDir = path.join("node_modules", "@mgonetwork", "mango.js");
  if (await fileExists(mangoJsDir)) {
    await fixMgoImports(mangoJsDir);
  } else {
    console.error("目录 " + mangoJsDir + " 未找到。跳过导入路径修复。");
  }
  console.log("\n设置完成");
  console.log("打开并配置\n- accounts/accounts.js\n- config/config.js\n ");
})();
