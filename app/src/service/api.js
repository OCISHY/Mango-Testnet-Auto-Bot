import fetch, { Response } from "node-fetch";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { HttpsProxyAgent } from "https-proxy-agent";

export class API {
  constructor(proxy) {
    this.proxy = proxy;
    // 随机生成 user-agent 信息
    this.ua = Helper.randomUserAgent();
  }

  // Generate headers for the request
  // 生成请求的头部信息
  generateHeaders(token, additionalHeaders) {
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Site": "same-site",
      "Sec-Fetch-Mode": "cors",
      origin: "https://task.testnet.mangonetwork.io",
      priority: "u=1, i",
      referer: "https://task.testnet.mangonetwork.io/",
      "sec-ch-ua-mobile": "?0",
      "User-Agent": this.ua,
    };
    if (token) {
      // headers["mgo-token"] = "" + token;
      headers["mgo-token"] = `${token}`;
    }
    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }
    return headers;
  }

  // Fetch data from the API
  // 从API获取数据
  async fetch(url, method = "GET", body, token, additionalHeaders) {
    const options = {
      method: method,
      headers: this.generateHeaders(token, additionalHeaders),
      body: body ? JSON.stringify(body) : undefined,
      agent: this.proxy ? new HttpsProxyAgent(this.proxy) : undefined,
    };
    try {
      logger.info(method + " : " + url + " " + (this.proxy ? this.proxy : ""));
      logger.info("Request Header : " + JSON.stringify(options.headers));
      logger.info("Request Body : " + JSON.stringify(options.body));
      const response = await fetch(url, options);
      if (!response.ok) {
        throw response;
      }
      const status = response.status;
      const contentType = response.headers.get("Content-Type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = {
          message: await response.text(),
        };
      }
      logger.info("Response : " + response.status + " " + response.statusText);
      logger.info("Response Data : " + JSON.stringify(data) + "...");
      return {
        status: status,
        data: data,
      };
    } catch (error) {
      if (error instanceof Response) {
        const status = error.status;
        const contentType = error.headers.get("Content-Type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await error.json();
        } else {
          data = {
            message: await error.text(),
          };
        }
        logger.info("Response : " + error.status + " " + error.statusText);
        logger.info("Response Data : " + JSON.stringify(data) + "...");
        if (status === 403) {
          return {
            status: status,
            data: data,
          };
        } else if (status === 500 || status === 404) {
          console.error("DETECT API CHANGE.. EXIT");
          process.exit(1);
        } else {
          throw new Error(status + " - " + error.statusText);
        }
      } else {
        throw new Error("Unexpected error: " + (error.message || error));
      }
    }
  }
}
