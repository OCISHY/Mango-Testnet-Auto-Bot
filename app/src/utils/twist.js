import "../service/core-service.js";
import { Twisters } from "twisters";
import logger from "./logger.js";
import { accountList } from "../../accounts/accounts.js";

class Twist {
  constructor() {
    this.twisters = new Twisters();
  }

  // Log function
  // 日志函数
  log(message = "", account = "", coreService, delay) {
    const accountIndex = accountList.indexOf(account);
    if (delay == undefined) {
      logger.info("Account " + (accountIndex + 1) + " - " + message);
      delay = "-";
    }
    const address = coreService.address ?? "-";
    const balance = coreService.balance ?? [];
    const user = coreService.user ?? {};
    const mgoUser = user.MgoUser ?? {};
    const score = mgoUser.integral ?? "-";
    this.twisters.put(account, {
      text: `
================== Account ${accountIndex + 1} =================
Address钱包地址      : ${address}
Balance余额      : ${balance.map((b) => `\n- ${b.totalBalance} ${b.coinType.split("::").pop()}`)}
Score积分        : ${score}
               
Status状态 : ${message}
Delay延迟  : ${delay}
==============================================

==== 连接状态: ${coreService.token ? "连接成功 Token: " + coreService.token : "未连接"}====
`,
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
