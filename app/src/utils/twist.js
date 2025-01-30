import "../service/core-service.js";
import { Twisters } from "twisters";
import logger from "./logger.js";
import eventBus from "./eventBus.js";

class Twist {
  constructor() {
    this.twisters = new Twisters();
  }

  // Log function
  // 日志函数
  log(message = "", account = "", coreService, delay) {
    if (delay == undefined) {
      logger.info("Account: " + account + " - " + message);
      delay = "-";
    }
    const address = coreService.address ?? "-";
    const balance = coreService.balance ?? [];
    const user = coreService.user ?? {};
    const mgoUser = user.MgoUser ?? {};
    const score = mgoUser.integral ?? "-";

    const eventBusInfo = `Process: ${eventBus.getIndex()} / ${eventBus.getTotalAccounts()}, Total Complete: ${eventBus.getTotalCompleteAccounts()?.length}, Complete Account: ${eventBus
      .getTotalCompleteAccounts()
      ?.sort((a, b) => parseInt(a.account.remark) - parseInt(b.account.remark))
      .map((a) => a.account.remark)
      .join(",")}`;

    const logInfo = ` Check: ${coreService?.taskStatus?.checkIn}, DC: ${coreService?.taskStatus?.discord}, Swap: ${coreService?.taskStatus?.swap}, Exchange: ${coreService?.taskStatus?.exchange}, Seq: ${coreService.remark}, Balance: ${balance.map((b) => `${b.totalBalance} ${b.coinType.split("::").pop()}`).join(", ")}, Score: ${score}, Func: ${message}, Delay: ${delay}, SIG: ${coreService?.token ? "📶" : "❌"}`;

    const logText = `${logInfo}`;
    this.twisters.put("logInformation", {
      text: eventBusInfo,
    });

    this.twisters.put(account, {
      text: logText,
    });
  }

  // Info function
  // 信息函数
  info(message = "") {
    this.twisters.put("2", {
      text: `
==============================================
Info : ${message}
==============================================
`,
    });
  }

  // Clear info function
  // 清除信息函数
  clearInfo() {
    this.twisters.remove("2");
  }

  // Clear specific log
  // 清除特定日志
  clear(account) {
    this.twisters.remove(account);
  }
}

export default new Twist();
