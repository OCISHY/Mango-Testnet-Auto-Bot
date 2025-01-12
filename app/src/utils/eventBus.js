// filepath: /Users/spike/Dev/Crypto/Tools/Mango-Testnet-Auto-Bot/app/src/utils/eventBus.js
import { EventEmitter } from "events";

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.index = 0;
    this.totalAccounts = 0;
    this.totalCompleteAccounts = [];
  }

  setIndex(index) {
    this.index = index;
    this.emit("indexChanged", index);
  }

  setTotalCompleteAccounts(account) {
    this.totalCompleteAccounts.push(account);
    this.emit("totalCompleteAccountsChanged", this.totalCompleteAccounts);
  }

  setTotalAccounts(totalAccounts) {
    this.totalAccounts = totalAccounts;
    this.emit("totalAccountsChanged", totalAccounts);
  }

  getIndex() {
    return this.index;
  }

  getTotalAccounts() {
    return this.totalAccounts;
  }

  getTotalCompleteAccounts() {
    return this.totalCompleteAccounts;
  }
}

const eventBus = new EventBus();
export default eventBus;
