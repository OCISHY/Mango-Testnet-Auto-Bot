import {
  getFullnodeUrl,
  MgoClient,
  MgoHTTPTransport,
} from "@mgonetwork/mango.js/client";
import { Ed25519Keypair } from "@mgonetwork/mango.js/keypairs/ed25519";
import { Helper } from "../utils/helper.js";
import {
  bcs,
  decodeMgoPrivateKey,
  MIST_PER_MGO,
  TransactionBlock,
} from "@mgonetwork/mango.js";
import { API } from "./api.js";
import { SIGNPACKAGE } from "../packages/sign-package.js";
import { AMMPACKAGE } from "../packages/amm-package.js";
import { COINS } from "../coin/coins.js";
import { BEINGDEXPACKAGE } from "../packages/beingdex.js";
import { accountList } from "../../accounts/accounts.js";
import { proxyList } from "../../config/proxy_list.js";
import { MANGOBRIDGEPACKAGE } from "../packages/mangobridge.js";
import { BRIDGE } from "../chain/dest_chain.js";

export class CoreService extends API {
  constructor(account) {
    let proxy;
    const accountIndex = accountList.indexOf(account);
    if (proxyList.length != accountList.length && proxyList.length != 0) {
      throw Error(
        "如何配置 proxy 请保证配置的数量和 account 数量一致: You Have " +
          accountList.length +
          " Accounts But Provide " +
          proxyList.length
      );
    }
    proxy = proxyList[accountIndex];
    super(proxy);
    this.acc = account;
    this.explorer = "https://mgoscan.com";
    this.client = new MgoClient({
      transport: new MgoHTTPTransport({
        url: getFullnodeUrl("testnet"),
      }),
    });
  }

  // Get account information
  // 获取账户信息
  async getAccountInfo() {
    try {
      await Helper.delay(
        500,
        this.acc,
        "Getting Wallet Information... 获取钱包信息...",
        this
      );
      const privateKey = decodeMgoPrivateKey(this.acc);
      this.wallet = Ed25519Keypair.fromSecretKey(privateKey.secretKey);
      this.address = this.wallet.getPublicKey().toMgoAddress();
      await Helper.delay(
        1000,
        this.acc,
        "Successfully Get Account Information",
        this
      );
    } catch (error) {
      throw error;
    }
  }

  // Connect to Mango DAPPS
  // 连接到芒果 DAPPS
  async connectMango() {
    try {
      await Helper.delay(500, this.acc, "Connecting to mango DAPPS...", this);
      const signTime = Math.floor(Date.now() / 1000);
      const signData = {
        address: this.address,
        signTime: signTime,
        signType: "Login",
      };
      const signDataString = JSON.stringify(signData);
      const encodedSignData = new TextEncoder().encode(signDataString);
      const signature = await this.wallet.signPersonalMessage(encodedSignData);
      const response = await this.fetch(
        "https://task-api.testnet.mangonetwork.io/mgoUser/loginMgoUserPublic",
        "POST",
        {
          signData: signature.signature,
          address: this.address,
          signTime: signTime,
        }
      );
      if (response.data.code == 0) {
        this.token = response.data.data.token;
        await Helper.delay(500, this.acc, response.data.msg, this);
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get Mango user information
  // 获取芒果用户信息
  async getMangoUser(showMessage = false) {
    try {
      if (showMessage) {
        await Helper.delay(500, this.acc, "Getting User Information..", this);
      }
      const response = await this.fetch(
        "https://task-api.testnet.mangonetwork.io/mgoUser/getMgoUser",
        "GET",
        undefined,
        this.token
      );
      if (response.data.code == 0) {
        this.user = response.data.data;
        if (showMessage) {
          await Helper.delay(500, this.acc, response.data.msg, this);
        }
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get swap task details
  // 获取交换任务详情
  async getSwapTask() {
    try {
      await Helper.delay(2000, this.acc, "Getting Swap Task Details..", this);
      const response = await this.fetch(
        "https://task-api.testnet.mangonetwork.io/base/taskDetail",
        "POST",
        {
          taskId: 2,
          type: 0,
        },
        this.token
      );
      if (response.data.code == 0) {
        this.swapTask = response.data.data;
        await Helper.delay(500, this.acc, response.data.msg, this);
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get exchange task details
  // 获取交换任务详情
  async getExchangeTask() {
    try {
      await Helper.delay(
        2000,
        this.acc,
        "Getting BeingDex Task Details..",
        this
      );
      const response = await this.fetch(
        "https://task-api.testnet.mangonetwork.io/base/taskDetail",
        "POST",
        {
          taskId: 5,
          type: 0,
        },
        this.token
      );
      if (response.data.code == 0) {
        this.exchangeTask = response.data.data;
        await Helper.delay(500, this.acc, response.data.msg, this);
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      throw error;
    }
  }

  // Get Discord task details
  // 获取 Discord 任务详情
  async getDiscordTask() {
    try {
      await Helper.delay(
        2000,
        this.acc,
        "Getting Discord Task Details..",
        this
      );
      const response = await this.fetch(
        "https://task-api.testnet.mangonetwork.io/base/taskDetail",
        "POST",
        {
          taskId: 3,
          type: 0,
        },
        this.token
      );
      if (response.data.code == 0) {
        this.discordTask = response.data.data;
        await Helper.delay(500, this.acc, response.data.msg, this);
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      throw error;
    }
  }
  // Add step to task
  // 添加步骤到任务
  async addStep(taskId, step, showMessage = true) {
    try {
      if (showMessage) {
        await Helper.delay(
          2000,
          this.acc,
          "Try Completing Step " + step.label + "...",
          this
        );
      }
      await this.fetch(
        "https://task-api.testnet.mangonetwork.io/base/addStep",
        "POST",
        {
          taskId: taskId,
          stepId: step.sort,
        },
        this.token
      );
    } catch (error) {
      throw error;
    }
  }

  // Get account balance
  // 获取账户余额
  async getBalance(showMessage = false) {
    try {
      if (showMessage) {
        await Helper.delay(500, this.acc, "Getting Account Balance...", this);
      }
      this.balance = await this.client.getAllBalances({
        owner: this.address,
      });
      this.balance = this.balance.map((balance) => {
        balance.totalBalance = parseFloat(
          (Number(balance.totalBalance) / Number(MIST_PER_MGO)).toFixed(5)
        );
        return balance;
      });
      if (showMessage) {
        await Helper.delay(
          1000,
          this.acc,
          "Successfully Get Account Balance",
          this
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // Request MGO faucet
  // 请求 MGO 水龙头
  async getFaucet() {
    try {
      await Helper.delay(1000, this.acc, "Requesting MGO Faucet", this);
      const response = await this.fetch(
        "https://task-api.testnet.mangonetwork.io/base/getFaucet",
        "POST",
        {
          chain: "0",
          type: false,
        },
        this.token
      );
      if (response.status == 200) {
        await Helper.delay(1000, this.acc, response.data.msg, this);
        await this.getBalance();
      } else {
        throw response;
      }
      await this.addStep(
        1,
        {
          label: "Connect to Mango test network and sign to receive Gas",
          value: "Gas",
          extend: "Download and use the Beingdex mobile app",
          sort: 0,
        },
        false
      );
    } catch (error) {
      await Helper.delay(3000, this.acc, error.data.msg, this);
    }
  }

  // Daily sign in
  // 每日签到
  async checkIn() {
    try {
      await Helper.delay(1000, this.acc, "Trying to Daily Sign In", this);
      const txBlock = new TransactionBlock();
      txBlock.moveCall({
        target: SIGNPACKAGE.ADDRESS + "::sign::sign_in",
        arguments: [
          txBlock.object(SIGNPACKAGE.MODULE.SIGN.SIGNPOOL),
          txBlock.object(SIGNPACKAGE.MODULE.SIGN.CLOCK),
        ],
      });
      await this.executeTx(txBlock);
      await Helper.delay(1000, this.acc, "Successfully Daily Sign In", this);
    } catch (error) {
      await Helper.delay(
        1000,
        this.acc,
        "Failed to Daily Sign In, Possible already Sign In",
        this
      );
    }
  }

  // Swap coins
  // 交换硬币
  async swap(fromCoin, toCoin) {
    try {
      const txBlock = new TransactionBlock();
      let coins = await this.client.getCoins({
        owner: this.address,
        coinType: fromCoin.TYPE,
      });
      if (coins.data.length == 0) {
        while (coins.data.length == 0) {
          coins = await this.client.getCoins({
            owner: this.address,
            coinType: fromCoin.TYPE,
          });
          await this.getBalance();
          await Helper.delay(
            10000,
            this.acc,
            "Delaying for " +
              Helper.msToTime(10000) +
              " until swap balance update",
            this
          );
        }
      }
      if (coins.data.length > 1) {
        await this.mergeCoin(fromCoin);
        coins = await this.client.getCoins({
          owner: this.address,
          coinType: fromCoin.TYPE,
        });
      }
      let amount = Number(0.1) * Number(MIST_PER_MGO);
      let splitCoin;
      if (fromCoin == COINS.MGO) {
        splitCoin = txBlock.splitCoins(txBlock.gas, [txBlock.pure(amount)]);
      } else {
        amount = Number(coins.data[0].balance);
        splitCoin = txBlock.splitCoins(
          txBlock.object(coins.data[0].coinObjectId),
          [txBlock.pure(amount)]
        );
      }
      await Helper.delay(
        1000,
        this.acc,
        "Try to Swapping " +
          (fromCoin == COINS.MGO
            ? parseFloat(
                (Number(amount) / Number(MIST_PER_MGO)).toString()
              ).toFixed(2)
            : parseFloat(
                (
                  Number(coins.data[0].balance) / Number(MIST_PER_MGO)
                ).toString()
              ).toFixed(5)) +
          " " +
          fromCoin.SYMBOL +
          " to ? " +
          toCoin.SYMBOL,
        this
      );
      const coinTypes = [fromCoin, toCoin].find((coin) => coin == COINS.MGO);
      const typeArguments =
        fromCoin == COINS.MGO || (!coinTypes && fromCoin == COINS.USDT)
          ? [fromCoin.TYPE, toCoin.TYPE]
          : [fromCoin.TYPE, toCoin.TYPE].reverse();
      const poolId = await this.getPool(typeArguments);
      let swapAmount = await this.swapCalculate(
        typeArguments,
        poolId,
        !!(fromCoin == COINS.MGO || (!coinTypes && fromCoin == COINS.USDT)),
        amount
      );
      swapAmount = Math.floor(swapAmount - (swapAmount * 10) / 100);
      await Helper.delay(
        1000,
        this.acc,
        "Try to Swapping " +
          parseFloat(
            (Number(amount) / Number(MIST_PER_MGO)).toString()
          ).toFixed(2) +
          " " +
          fromCoin.SYMBOL +
          " to " +
          parseFloat(
            (Number(swapAmount) / Number(MIST_PER_MGO)).toString()
          ).toFixed(2) +
          " " +
          toCoin.SYMBOL,
        this
      );
      txBlock.moveCall({
        target:
          AMMPACKAGE.ADDRESS +
          "::amm_script::" +
          (fromCoin == COINS.MGO || (!coinTypes && fromCoin == COINS.USDT)
            ? "swap_exact_coinA_for_coinB"
            : "swap_exact_coinB_for_coinA"),
        typeArguments: typeArguments,
        arguments: [
          txBlock.object(poolId),
          txBlock.object(AMMPACKAGE.MODULE.AMMCONFIG.GLOBALPAUSESTATUSID),
          splitCoin,
          txBlock.pure(amount),
          txBlock.pure(swapAmount),
        ],
      });
      await this.executeTx(txBlock);
      await Helper.delay(
        1000,
        this.acc,
        "Successfully Swapping " +
          parseFloat(
            (Number(amount) / Number(MIST_PER_MGO)).toString()
          ).toFixed(2) +
          " " +
          fromCoin.SYMBOL +
          " to " +
          parseFloat(
            (Number(swapAmount) / Number(MIST_PER_MGO)).toString()
          ).toFixed(2) +
          " " +
          toCoin.SYMBOL,
        this
      );
    } catch (error) {
      throw error;
    }
  }
  // 交换硬币
  async exchange(fromCoin, toCoin) {
    try {
      await Helper.delay(
        1000,
        this.acc,
        "Exchanging " + fromCoin.SYMBOL + " to " + toCoin.SYMBOL,
        this
      );
      const typeArguments =
        fromCoin == COINS.USDT
          ? [fromCoin.TYPE, toCoin.TYPE].reverse()
          : [fromCoin.TYPE, toCoin.TYPE];
      const txBlock = new TransactionBlock();
      let coins = await this.client.getCoins({
        owner: this.address,
        coinType: fromCoin.TYPE,
      });
      if (coins.data.length == 0) {
        while (coins.data.length == 0) {
          coins = await this.client.getCoins({
            owner: this.address,
            coinType: fromCoin.TYPE,
          });
          await this.getBalance();
          await Helper.delay(
            10000,
            this.acc,
            "Delaying for " +
              Helper.msToTime(10000) +
              " until swap balance update",
            this
          );
        }
      }
      if (coins.data.length > 1) {
        await this.mergeCoin(fromCoin);
        coins = await this.client.getCoins({
          owner: this.address,
          coinType: fromCoin.TYPE,
        });
      }
      const amount = Number(coins.data[0].balance);
      txBlock.moveCall({
        target:
          BEINGDEXPACKAGE.ADDRESS +
          "::clob::" +
          (fromCoin == COINS.USDT ? "market_buy" : "sell"),
        typeArguments: typeArguments,
        arguments:
          fromCoin == COINS.USDT
            ? [
                txBlock.object(BEINGDEXPACKAGE.MODULE.CLOB.AIUSDTPOOL),
                txBlock.object(coins.data[0].coinObjectId),
                txBlock.pure(amount),
              ]
            : [
                txBlock.object(BEINGDEXPACKAGE.MODULE.CLOB.AIUSDTPOOL),
                txBlock.object(coins.data[0].coinObjectId),
                txBlock.pure(1),
                txBlock.pure(amount),
              ],
      });
      await this.executeTx(txBlock);
      await Helper.delay(
        1000,
        this.acc,
        "Successfully Exchanging " +
          parseFloat(
            (Number(amount) / Number(MIST_PER_MGO)).toString()
          ).toFixed(2) +
          " " +
          fromCoin.SYMBOL +
          " to " +
          toCoin.SYMBOL,
        this
      );
    } catch (error) {
      throw error;
    }
  }

  // Merge coins
  // 合并硬币
  async mergeCoin(coin) {
    try {
      const coins = await this.client.getCoins({
        owner: this.address,
        coinType: coin.TYPE,
      });
      if (coin == COINS.MGO && coins.data.length < 3) {
        return;
      }
      if (coins.data.length < 2) {
        return;
      }
      const txBlock = new TransactionBlock();
      let primaryCoin;
      let coinsToMerge;
      if (coin == COINS.MGO) {
        primaryCoin = coins.data[1].coinObjectId;
        coinsToMerge = coins.data.slice(2).map((c) => c.coinObjectId);
      } else {
        primaryCoin = coins.data[0].coinObjectId;
        coinsToMerge = coins.data.slice(1).map((c) => c.coinObjectId);
      }
      await Helper.delay(1000, this.acc, "Merging " + coin.SYMBOL, this);
      await txBlock.mergeCoins(
        txBlock.object(primaryCoin),
        coinsToMerge.map((c) => txBlock.object(c))
      );
      await this.executeTx(txBlock);
      await this.getBalance();
    } catch (error) {
      throw error;
    }
  }

  // Bridge coins
  // 桥接硬币
  async bridge(destination) {
    try {
      if (destination == BRIDGE.MANGOBSC || destination == BRIDGE.MANGOETH) {
        const txBlock = new TransactionBlock();
        let coins = await this.client.getCoins({
          owner: this.address,
          coinType: COINS.USDT.TYPE,
        });
        if (coins.data.length == 0) {
          while (coins.data.length == 0) {
            coins = await this.client.getCoins({
              owner: this.address,
              coinType: COINS.USDT.TYPE,
            });
            await this.getBalance();
            await Helper.delay(
              10000,
              this.acc,
              "Delaying for " +
                Helper.msToTime(10000) +
                " until swap balance update",
              this
            );
          }
        }
        if (coins.data.length > 1) {
          await this.mergeCoin(COINS.USDT);
          coins = await this.client.getCoins({
            owner: this.address,
            coinType: COINS.USDT.TYPE,
          });
        }
        const amount = Number(0.1) * Number(MIST_PER_MGO);
        const splitCoin = txBlock.splitCoins(
          txBlock.object(coins.data[0].coinObjectId),
          [txBlock.pure(amount)]
        );
        await Helper.delay(
          1000,
          this.acc,
          "Try to Bridge " +
            parseFloat(
              (Number(amount) / Number(MIST_PER_MGO)).toString()
            ).toFixed(2) +
            " " +
            COINS.USDT.SYMBOL +
            " to BSC NETWORK ",
          this
        );
        txBlock.moveCall({
          target: MANGOBRIDGEPACKAGE.ADDRESS + "::bridge::bridge_token",
          typeArguments: [COINS.USDT.TYPE],
          arguments: [
            txBlock.object(MANGOBRIDGEPACKAGE.MODULE.BRIDGE.BRIDGEXECUTOR),
            splitCoin,
            txBlock.pure("0x1f0ea6e0b3590e1ab6c12ea0a24d3d0d9bf7707d"),
            txBlock.pure(destination),
            txBlock.object(MANGOBRIDGEPACKAGE.MODULE.BRIDGE.CLOCK),
          ],
        });
        await this.executeTx(txBlock);
        await Helper.delay(
          1000,
          this.acc,
          "Successfully Bridge " +
            parseFloat(
              (Number(amount) / Number(MIST_PER_MGO)).toString()
            ).toFixed(2) +
            " " +
            COINS.USDT.SYMBOL +
            " to BSC NETWORK",
          this
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // Calculate swap amount
  // 计算交换金额
  async swapCalculate(typeArguments, poolId, isExactInput, amount) {
    const txBlock = new TransactionBlock();
    txBlock.moveCall({
      target: AMMPACKAGE.ADDRESS + "::amm_router::compute_out",
      typeArguments: typeArguments,
      arguments: [
        txBlock.object(poolId),
        txBlock.pure(amount),
        txBlock.pure(isExactInput),
      ],
    });
    const result = await this.readTx(txBlock);
    return bcs.de(
      result.results[0].returnValues[0][1],
      Uint8Array.from(result.results[0].returnValues[0][0])
    );
  }

  // Get pool ID
  // 获取池 ID
  async getPool(typeArguments) {
    const txBlock = new TransactionBlock();
    txBlock.moveCall({
      target: AMMPACKAGE.ADDRESS + "::amm_swap::get_pool_id",
      typeArguments: typeArguments,
      arguments: [txBlock.object(AMMPACKAGE.MODULE.AMMSWAP.AMMFACTORY)],
    });
    const result = await this.readTx(txBlock);
    return bcs.de(
      result.results[0].returnValues[0][1],
      Uint8Array.from(result.results[0].returnValues[0][0])
    );
  }

  // Execute transaction
  // 执行交易
  async executeTx(txBlock) {
    try {
      await Helper.delay(1000, this.acc, "Executing Tx ...", this);
      const result = await this.client.signAndExecuteTransactionBlock({
        signer: this.wallet,
        transactionBlock: txBlock,
      });
      await Helper.delay(
        3000,
        this.acc,
        "Tx Executed : " + (this.explorer + "/txblock/" + result.digest),
        this
      );
      await this.getBalance();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Read transaction
  // 读取交易
  async readTx(txBlock) {
    try {
      const result = await this.client.devInspectTransactionBlock({
        sender: this.address,
        transactionBlock: txBlock,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
