import twist from "./twist.js";

export class Helper {
  // Delay function
  // 延迟函数
  static delay = (ms, account, message, coreService) => {
    return new Promise(async (resolve) => {
      let remainingTime = ms;
      if (account != undefined) {
        await twist.log(
          message,
          account,
          coreService,
          "Delaying for " + this.msToTime(ms)
        );
      } else {
        twist.info("Delaying for " + this.msToTime(ms));
      }
      const interval = setInterval(async () => {
        remainingTime -= 1000;
        if (account != undefined) {
          await twist.log(
            message,
            account,
            coreService,
            "Delaying for " + this.msToTime(remainingTime)
          );
        } else {
          twist.info("Delaying for " + this.msToTime(remainingTime));
        }
        if (remainingTime <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
      setTimeout(async () => {
        clearInterval(interval);
        await twist.clearInfo();
        if (account) {
          await twist.log(message, account, coreService);
        }
        resolve();
      }, ms);
    });
  };

  // Convert milliseconds to time string
  // 将毫秒转换为时间字符串
  static msToTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const remainingMs = ms % 3600000;
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.round((remainingMs % 60000) / 1000);
    return hours + " Hours " + minutes + " Minutes " + seconds + " Seconds";
  }

  // Reference check function (currently empty)
  // 引用检查函数（当前为空）
  static refCheck(address, premium) {}

  // Generate a random user agent string
  // 生成一个随机的 agent 信息，这里可以用 GPT 生成自己的随机 agent 信息
  static randomUserAgent() {
    const userAgents = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.77 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 EdgiOS/91.0.4472.77 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36 EdgA/91.0.4472.77",
      "Mozilla/5.0 (Linux; Android 11; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36 EdgA/91.0.4472.77",
      "Mozilla/5.0 (Linux; Android 11; HUAWEI P40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36 OPR/63.3.3216.58675",
      "Mozilla/5.0 (Linux; Android 11; SM-N986B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36 OPR/63.3.3216.58675",
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Static method placeholder
  // 静态方法占位符
  static() {
    console.log();
  }
}
