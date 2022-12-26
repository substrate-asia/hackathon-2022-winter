Translations: [English](README.md) | [简体中文](README_zh.md)

## 基本资料

项目名称：Salvado Finance

项目立项日期：2022年11月

## 项目简介

### 项目背景

今年开始加密市场缓慢进入寒冬，全球第二大交易所 FTX 的暴雷，加剧了投资者对加密市场的恐慌，也暴露了当前以中心化交易所为核心的加密市场的安全问题，加密市场的全面去中心化进程不可阻挡。

虽然距离中本聪2008年11月1日发布比特币白皮书至今，加密生态已经走过了14个年头，加密生态也发生了翻天覆地的变化。然而进入 Web3 的高学习门槛，高风险以及对加密领域的不了解，挡住了很多Web2 用户进入Web3的脚步。

Salvado Finance 旨在创建一个安全的，资金非托管的，Web2用户易进入的去中心化投资平台。类似去中心化版的[派网](https://www.pionex.com/)。

Salvado 名称是为了致敬以萨尔瓦多总统为代表的加密货币信仰者在推特上发起的Bitcoin定投运动。
![img](./docs/twitter.png)
推特原文：https://twitter.com/nayibbukele/status/1593113857261965312

### 项目介绍

对于投资者来说，定投是规避风险的最好的投资方式，不管是对新手投资者还是经验丰富的投资者同样有效。

Salvado Finance 为用户提供一站式定投服务：
1. 价值资产的历史投资回报率分析

    我们对包括Ethereum、Moonbeam在内的多条链上的核心资产做了历史投资回报率回溯分析，用户可以清晰的看出他想要投资的资产在一段时间内的投资回报率以及走势图，也可以清楚的发现哪些资产近期有比较好的回报率，从而做出正确的投资。
2. 多种定投策略

    我们通过智能合约实现了多种定投策略: 
   - 定期定额投资法（DCA）
   - 均值定投法
   - BL定投法
   - 组合定投法 
3. 群定投

    用户可以创建一个群定投合约，在群合约里指定定投策略、参与条件、定投目标以及推出策略，其他用户如果看好该策略可以加入该定投群，一起定投
4. 定投即挖矿

    在我们平台定投用户资金是无需托管的，用户定投支付资产和购买的资产都在用户自己的钱包里。用户也可以选择将资产托管在平台合约，并由平台合约帮助用户去参与质押，借贷，添加流动性等，来赚取额外的收益。
5. 投资图谱

    用户在平台上的所有投资行为都会通过 SBT 记录下来，平台会通过分析用户的投资行为，判断用户的投资经验，从而指导用户做出更好的投资，让用户在投资中学习。
6. 定投做市商 

    Salvado V1 版本用户定投是平台 relayer 帮助用户从 DEX 或聚合器购买目标代币，完成定投的，在未来的V2 版本中，我们将加入定投做市商，以Order Book 的形式由做市商帮助用户零滑点完成定投，同时做市商也可以得到激励。

### 项目Demo

  Demo 体验地址(只支持测试网)：http://salvado.finance/
  ![img](./docs/tokens.png)
  ![img](./docs/auto-invest.png)
  ![img](./docs/active-positions.png)
  ![img](./docs/closed-positions.png)
  ![img](./docs/position-activity.png)

### 技术架构

![img](./docs/architecture.png)

Salvado 协议中主要由以下5个角色：
1. Broker (Controller)
   
    Broker合约是创建/执行定投策略的入口，负责校验定投交易是否合法
2. Strategy
   
    Strategy合约提供给用户不同定投策略，常用的如：DCA策略，我们实现了IStrategy.sol标准接口，用户也可以部署/分享自己定制的策略，并且在我们平台上使用，策略的可组合性，是Salvado 协议的核心。
3. Exchange

   Exchange 合约实现了代币兑换的逻辑，比如：USDT 从Uniswap兑换ETH。我们将提供多种兑换方式：Dex、Dex Aggregator、Market Maker。其中从Market Maker方案中兑换将实现零滑点兑换。
4. Oracle

   Oracle 合约为Salvado协议提供资产定价功能，保证用户从Exchange 兑换的代币价格没有便宜代币的实际价格，确保用户的资产安全。同时也因为Oracle的存在为用户提供了更丰富的投资方式，比如：限价定投、网格交易等。
5. Position

    Position 合约管理着用户创建的所有定投，用户可以随时创建、更新、暂停、终止定投。
6. Relayer Service

   定投中继器是任何人都可以运行的服务，他们需要为用户支付定投手续费，帮助用户完成定投交易，同样他们可以获得0.2%的手续费奖励。

## 项目 logo

![img](./docs/logos/logo_white_128.png)

![img](./docs/logos/logo_black_128.png)

![img](./docs/logos/Frame2.png)

## 黑客松期间所完成的事项

**On-Chain: Contracts**

- `Broker`
  - [x] 创建定投Position (`fn createPosition()`)
  - [x] 执行定投Position (`fn autoMatchPosition()`)
- `Strategy`
  - [x] DCA 策略 (`fn mintPositionNFT()`)
- `Exchange`
  - [x] 支持Dex(UNI) Swap (`fn swapExactTokensForTokens()`)
- `Position`
  - [x] 创建 Position (`fn createPosition()`)
  - [x] Pause/Unpause Position (`fn rotatePosition()`)
  - [x] Edit Position (`fn editPosition()`)
  - [x] 终止 Position (`fn rotatePosition()`)

**Off-Chain**
- [x] 多链高价值代币历史价格同步、历史投资回报率分析
- [x] 用户Position 列表管理
- [x] Relayer Service

**web 端 (react-native)**
  - [x] Tokens List 高价值代币信息展示
  - [x] 定投创建流程
  - [x] 定投管理流程
  - [x] 定投事件历史记录

## 队员信息

|Name|Function|GitHub|Twitter|
|---------|---------|---------|---------|
|Tyler|Tech|https://github.com/tyler2sv||
|Muniz|Tech|https://github.com/1160007652||
|Lester|Tech|https://github.com/HinadaC||
|Walter|Tech|https://github.com/walter1129||
|Jessica|UI/UX||@BFlAMbF1oUST0Bm|
|Wendy|Operations||@CryptoWendyz|
|Judis|Operations||@nft_sofa|
|Hannah|Operations||@morninghannah_|
