## 基本资料

项目名称：O9P (Omniverse Swap)

项目立项日期 (哪年哪月)：2022.12

## 项目整体简介

### Background
In current technology state of the art, there are two ways to exchange tokens deployed on different public chains, the one is through CEX, the other is transferring through bridges first and then swapping.  
In Web3 world, CEX is just a temporary solution because there's no need for Web3 if centralized.  
With bridges, the assets should be locked on one chain and minted on another chain so that your assets are cut into different parts on different chains and one part can be only used on one chain at a time. Moreover, many [secure events](https://github.com/xiyu1984/Blog/blob/main/docs/Multi-Chain%20Events.md) happened on current bridges.  

We are building an absolute decentralized and cryptographic-based solution to solve these problems, through which the exchanging between tokens deployed on different chains can be processed and verified determinedly. Besides, there's no need to divide of your assets into different isolated parts, and, on the contrary, your assets can be accessed from any chain to be treated as a whole.

### Introduction
Our solution is called `Omniverse Protocol Stack`, **`O20k`** for short.  
`O20k` works on top of different blockchains, which provides an `OTP`(Omniverse Token Protocol) with a related `OSP`(Omniverse Swap Protocol).  
The core workflow of `O20k` is driven by a Substrate Parachain we will build, which can connect the other Parachains by `XCM` so that `O20k` could provide services for the whole ecosystem of Polkadot.  
* The `OTP` has the following features:  
  * The token based on `OTP` deployed on different chains is not separated but as a whole. If someone has one `OT`P based token $X$ on Polkadot, he will have one on Ethereum and other chains at the same time.   
  * The state of the tokens based on `OTP` is synchronous on different chains. If someone sends/receives one token $X$ on Polkadot, he will send/receive one token $X$ on Ethereum and other chains at the same time.  
  * The `OTP` works as below:  
![img](./docs/assets/OTP.png)
<p align="center">Figure.1 Workflow of OTP</p>

* The `OSP` has the following features:  
  * `OSP` is a decentralized DEX platform for Omniveser Tokens. Omniverse token $X$ can be exchanged with Omniverse token $Y$ through `OSP`. Similiar to `OTP`, the swap happens as a whole on Polkadot and other blockchains. If someone initiate a swap of $X$ with $Y$, he will give out some amount of $X$ and get related amount of $Y$ on Polkadot and all blockchains where `O20k` deployed.  
  * `OSP` is based on an AMM mechanism, which is called as `O-AMM`. Here are the details of the principle of [O-AMM](./docs/Principle%20of%20Omniverse%20AMM.md).
  * The Omniverse account of `OSP` is managed by the consensus of the `O20k` Parachain.
  * The `OSP` works as below:
![img](./docs/assets/OSP.png)
<p align="center">Figure.2 Workflow of OSP</p>

### Demo

### Architecture
![img](./docs/assets/OmniverseProtocolStack.png)  
<p align="center">Figure.3 Architecture of Omniverse Protocol Stack</p>  


### logo

## 黑客松期间计划完成的事项

**On-Chain**

- `pallet-OmniverseProtocol`
  - [ ] NFT 创建及数据结构定义 (`fn create_nft()`)
  - [ ] NFT 转帐函数 (`fn transfer()`)
  - [ ] NFT 销毁函数 (`fn burn_token()`)

- `pallet-OmniverseToken`
  - [ ] NFT 创建及数据结构定义 (`fn create_nft()`)
  - [ ] NFT 转帐函数 (`fn transfer()`)
  - [ ] NFT 销毁函数 (`fn burn_token()`)

- `pallet-OmniverseSwap`
  - [ ] NFT 创建及数据结构定义 (`fn create_nft()`)
  - [ ] NFT 转帐函数 (`fn transfer()`)
  - [ ] NFT 销毁函数 (`fn burn_token()`)

**Client**

- Command Line
  - [ ] 用户注册页面
  - [ ] NFT 产品创建流程
  - [ ] NFT 产品购买流程



## 黑客松期间所完成的事项 (2022年12月27日初审前提交)

- 2022年12月27日前，在本栏列出黑客松期间最终完成的功能点。
- 把相关代码放在 `src` 目录里，并在本栏列出在黑客松期间打完成的开发工作/功能点。我们将对这些目录/档案作重点技术评审。
- 放一段不长于 **5 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/docs/demo.mp4`。初审时这视频是可选，demo day 这是计分项。

## 队员信息

包含参赛者名称及介绍
在团队中担任的角色
GitHub 帐号
微信账号（如有请留下，方便及时联系）