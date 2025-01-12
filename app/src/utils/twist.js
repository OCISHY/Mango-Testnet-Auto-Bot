import "../service/core-service.js";
import { Twisters } from "twisters";
import logger from "./logger.js";
import Table from "cli-table3";
import eventBus from "./eventBus.js";

class Twist {
  constructor() {
    this.twisters = new Twisters();
  }

  // Log function
  // 日志函数
  log(message = "", account = "", coreService, delay) {
    // const accountIndex = accountList.indexOf(account);
    if (delay == undefined) {
      logger.info("Account: " + account + " - " + message);
      delay = "-";
    }
    const address = coreService.address ?? "-";
    const balance = coreService.balance ?? [];
    const user = coreService.user ?? {};
    const mgoUser = user.MgoUser ?? {};
    const score = mgoUser.integral ?? "-";

    const eventBusTable = new Table({
      head: ["Process", "Total Complete", "Complete Account"],
      colWidths: [15, 20, 25],
      wordWrap: true,
    });

    eventBusTable.push([
      `${eventBus.getIndex()} / ${eventBus.getTotalAccounts()}`,
      eventBus.getTotalCompleteAccounts()?.length,
      eventBus
        .getTotalCompleteAccounts()
        ?.map((a) => a.account.remark)
        .join(","),
    ]);

    const table = new Table({
      head: [
        "Seq",
        "Address",
        "Balance",
        "Score",
        "Func",
        "Delay",
        "CheckIn",
        "Discord",
        "Swap",
        "Exchange",
        "SIG",
      ],
      colWidths: [5, 10, 15, 8, 30, 30],
      wordWrap: true,
    });
    table.push([
      coreService.remark,
      address,
      balance
        .map((b) => `${b.totalBalance} ${b.coinType.split("::").pop()}`)
        .join("\n"),
      score,
      message,
      delay,
      coreService?.taskStatus?.checkIn,
      coreService?.taskStatus?.discord,
      coreService?.taskStatus?.swap,
      coreService?.taskStatus?.exchange,
      coreService?.token ? "📶" : "❌",
    ]);

    this.twisters.put("eventLog", {
      text: eventBusTable.toString(),
    });

    this.twisters.put(account, {
      text: table.toString(),
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
