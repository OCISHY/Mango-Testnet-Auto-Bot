import { accountList } from "./accounts/accounts.js";
import "./src/chain/dest_chain.js";
import { COINS } from "./src/coin/coins.js";
import { CoreService } from "./src/service/core-service.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

// Main operation function
// 主操作函数
async function operation(account) {
  const coreService = new CoreService(account);
  try {
    await coreService.getAccountInfo();
    await coreService.getBalance(true);
    await coreService.connectMango();
    await coreService.getMangoUser(true);
    //await Helper.refCheck(coreService.address, coreService.user.Premium);
    await coreService.getFaucet();
    await coreService.checkIn();
    await coreService.getSwapTask();
    if (
      coreService.swapTask.step.find((step) => step.status == "0") != undefined
    ) {
      await coreService.swap(COINS.MGO, COINS.USDT);
      await coreService.swap(COINS.USDT, COINS.MAI);
      await coreService.swap(COINS.MAI, COINS.USDT);
      await coreService.swap(COINS.USDT, COINS.MGO);
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
      await coreService.getMangoUser(true);
    }
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
    await coreService.getExchangeTask();
    if (
      coreService.exchangeTask.step.find((step) => step.status == "0") !=
      undefined
    ) {
      await coreService.swap(COINS.MGO, COINS.USDT);
      await coreService.exchange(COINS.USDT, COINS.AI);
      await coreService.exchange(COINS.AI, COINS.USDT);
      await coreService.swap(COINS.USDT, COINS.MGO);
      for (const step of coreService.exchangeTask.step) {
        if (step.status == "0") {
          await coreService.addStep(coreService.exchangeTask.detail.ID, step);
        }
      }
      await Helper.delay(
        2000,
        account,
        coreService.exchangeTask.detail.title + " Task is now Synchronizing",
        coreService
      );
      await coreService.getMangoUser(true);
    }
    await Helper.delay(
      86400000,
      account,
      "Accounts Processing Complete, Delaying For " +
        Helper.msToTime(86400000) +
        "...",
      coreService
    );
  } catch (error) {
    logger.info(error.message);
    await Helper.delay(5000, account, error.message, coreService);
    operation(account);
  }
}

// Start the bot
// 启动机器人
async function startBot() {
  try {
    logger.info("BOT STARTED");
    if (accountList.length == 0) {
      throw Error("Please input your account first on accounts.js file");
    }
    const operations = [];
    for (const account of accountList) {
      operations.push(operation(account));
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
