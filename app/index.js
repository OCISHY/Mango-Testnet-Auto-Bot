// filepath: /Users/spike/Dev/Crypto/Tools/Mango-Testnet-Auto-Bot/app/index.js
import { accounts } from "./config/index.js";
import "./src/chain/dest_chain.js";
import { COINS } from "./src/coin/coins.js";
import { TaskStatus, CoreService } from "./src/service/core-service.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import eventBus from "./src/utils/eventBus.js";

// Main operation function
// 主操作函数
async function operation(account, index) {
  const coreService = new CoreService(account);

  try {
    await coreService.getAccountInfo();

    // 获取MGO余额
    await coreService.getBalance(true);
    // 连接钱包
    await coreService.connectMango();
    // 获取用户信息
    await coreService.getMangoUser(true);
    await Helper.refCheck(coreService.address, coreService.user.Premium);
    // 领取水龙头
    await coreService.getFaucet();

    // 签到
    let checkInRes = await coreService.checkIn();

    // Swap 三分任务
    await coreService.getSwapTask();
    if (
      coreService.swapTask.step.find((step) => step.status == "0") != undefined
    ) {
      await coreService.swap(COINS.MGO, COINS.USDT);

      await coreService.swap(COINS.USDT, COINS.MAI);

      // 随机干扰事件
      if (Math.random() < 0.5) {
        await coreService.swap(COINS.MGO, COINS.MAI);
      }
      // 随机干扰事件
      if (Math.random() < 0.2) {
        await coreService.swap(COINS.MGO, COINS.USDT);
      }
      await coreService.swap(COINS.MAI, COINS.USDT);
      // 随机干扰事件
      if (Math.random() < 0.1) {
        await coreService.swap(COINS.MGO, COINS.USDT);
      }
      // await coreService.swap(COINS.USDT, COINS.MGO);
      for (const step of coreService.swapTask.step) {
        if (step.status == "0") {
          await coreService.addStep(coreService.swapTask.detail.ID, step);
        }
      }
      await Helper.delay(
        2000,
        account,
        coreService.swapTask.detail.title + " Task is now Synchronizing",
        coreService
      );
      coreService.taskStatus.swap = TaskStatus.COMPLETED;
      await coreService.getMangoUser(true);
    } else {
      coreService.taskStatus.swap = TaskStatus.ALREADY_COMPLETED;
    }

    // if (checkInRes !== true) {
    //   // 签到
    //   checkInRes = await coreService.checkIn();
    // }
    // discord 任务
    await coreService.getDiscordTask();
    if (
      coreService.discordTask.step.find((step) => step.status == "0") !=
      undefined
    ) {
      await coreService.addStep(
        coreService.discordTask.detail.ID,
        coreService.discordTask.step[0]
      );
    }

    // AI <=> USDT 任务
    // await coreService.getExchangeTask();
    // if (
    //   coreService.exchangeTask.step.find((step) => step.status == "0") !=
    //   undefined
    // ) {
    // await coreService.swap(COINS.MGO, COINS.USDT);
    // await Helper.delay(15000);
    // await coreService.exchange(COINS.USDT, COINS.AI);

    // await Helper.delay(12000);
    // await coreService.exchange(COINS.AI, COINS.USDT);
    // await Helper.delay(10000);
    // if (Math.random() < 0.5) {
    //   await coreService.swap(COINS.MGO, COINS.USDT);
    //   await coreService.swap(COINS.USDT, COINS.MGO);
    // } else {
    //   await coreService.swap(COINS.USDT, COINS.MGO);
    // }

    // for (const step of coreService.exchangeTask.step) {
    //   if (step.status == "0") {
    //     await coreService.addStep(coreService.exchangeTask.detail.ID, step);
    //   }
    // }
    // coreService.taskStatus.exchange = TaskStatus.COMPLETED;
    // await Helper.delay(
    //   2000,
    //   account,
    //   coreService.exchangeTask.detail.title + " Task is now Synchronizing",
    //   coreService
    // );
    // await coreService.getMangoUser(true);
    // } else {
    //   coreService.taskStatus.exchange = TaskStatus.ALREADY_COMPLETED;
    // }

    // if (checkInRes !== true) {
    //   // 签到
    //   checkInRes = await coreService.checkIn();
    // }

    if (checkInRes) {
      coreService.taskStatus.checkIn = TaskStatus.COMPLETED;
    } else if (coreService?.taskStatus?.checkIn) {
      coreService.taskStatus.checkIn = TaskStatus.FAILED;
    }
    // Handle Exchange Task
    await coreService.getExchangeTask();
    if (
      coreService.exchangeTask.step.find((step) => step.status === "0") !==
      undefined
    ) {
      let usdtBalance = coreService.balance.find(
        (balance) => balance.coinType.split("::").pop() === "USDT"
      );

      if (usdtBalance.totalBalance < 0.4) {
        await coreService.swap(COINS.MGO, COINS.USDT);
      }

      if (usdtBalance.totalBalance > 1) {
        await coreService.swap(COINS.USDT, COINS.MGO);
        await coreService.swap(COINS.MGO, COINS.USDT);
      }

      usdtBalance = coreService.balance.find(
        (balance) => balance.coinType.split("::").pop() === "USDT"
      );
      await coreService.exchange(COINS.USDT, COINS.AI);
      await coreService.exchange(COINS.AI, COINS.USDT);
      if (Math.random() < 0.5) {
        await coreService.exchange(COINS.USDT, COINS.AI);
        await coreService.exchange(COINS.AI, COINS.USDT);
      }
      usdtBalance = coreService.balance.find(
        (balance) => balance.coinType.split("::").pop() === "USDT"
      );
      // if (usdtBalance.totalBalance > 1) {
      //   await coreService.swap(COINS.USDT, COINS.MGO);
      // }

      for (const step of coreService.exchangeTask.step) {
        if (step.status === "0") {
          await coreService.addStep(coreService.exchangeTask.detail.ID, step);
        }
      }
      coreService.taskStatus.exchange = TaskStatus.COMPLETED;
      await Helper.delay(
        2000,
        account,
        `${coreService.exchangeTask.detail.title} Task is now Synchronizing`,
        coreService
      );
      await coreService.getMangoUser(true);
    } else {
      coreService.taskStatus.exchange = TaskStatus.ALREADY_COMPLETED;
    }

    eventBus.setTotalCompleteAccounts({
      index: index,
      account: account,
    });

    await Helper.delay(
      86400000,
      account,
      "Accounts Processing Complete, Delaying For " +
        Helper.msToTime(86400000) +
        "...",
      coreService
    );
  } catch (error) {
    console.log(error, "error");
    logger.info(error.message);
    await Helper.delay(5000, account, error.message, coreService);
    operation(account, index);
  }
}

// Start the bot
// 启动机器人
async function startBot() {
  try {
    logger.info("BOT STARTED");
    if (accounts.length === 0) {
      throw Error(
        "Please input your account first on app/config/index.js file"
      );
    }
    const operations = [];
    // 将账号执行顺序列表打乱
    const accountList = Helper.shuffle(accounts);
    console.log(accountList, "accountList");
    eventBus.setTotalAccounts(accountList.length);
    for (let index = 0; index < accountList.length; index++) {
      const account = accountList[index];
      eventBus.setIndex(index + 1);

      if (index > 0) {
        // Add any specific logic for index > 0 here
        const randomDelay =
          Math.floor(Math.random() * (120000 - 6000 + 1)) + 6000;
        await Helper.delay(randomDelay);
      }
      operations.push(operation(account, index));
    }
    await Promise.all(operations);
  } catch (error) {
    logger.info("BOT STOPPED");
    logger.error(JSON.stringify(error));
    throw error;
  }
}

// Main entry point
// 主入口点
(async () => {
  try {
    logger.clear();
    logger.info("");
    logger.info("Application Started");
    console.log();
    console.log(`
         █████╗ ██╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ 
        ██╔══██╗██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
        ███████║██║██████╔╝██║  ██║██████╔╝██║   ██║██████╔╝
        ██╔══██║██║██╔══██╗██║  ██║██╔══██╗██║   ██║██╔═══╝ 
        ██║  ██║██║██║  ██║██████╔╝██║  ██║╚██████╔╝██║     
        ╚═╝  ╚═╝╚═╝╚═╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     

        ██╗███╗   ██╗███████╗██╗██████╗ ███████╗██████╗     
        ██║████╗  ██║██╔════╝██║██╔══██╗██╔════╝██╔══██╗    
        ██║██╔██╗ ██║███████╗██║██║  ██║█████╗  ██████╔╝    
        ██║██║╚██╗██║╚════██║██║██║  ██║██╔══╝  ██╔══██╗    
        ██║██║ ╚████║███████║██║██████╔╝███████╗██║  ██║    
        ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
    `);
    console.log("MANGO TESTNET AUTO BOT");
    console.log("原作者TG频道 : https://t.me/AirdropInsiderID");
    console.log("我的推特: https://x.com/xwxboring");
    await startBot();
  } catch (error) {
    console.log("Error During executing bot", error);
    await startBot();
  }
})();
