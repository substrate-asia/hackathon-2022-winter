## 基本资料

项目名称：O20k (Omniverse Protocol Stack)

项目立项日期 (哪年哪月)：2022.12

## 项目整体简介

### Background
In current technology state of the art, there are two ways to exchange tokens deployed on different public chains, the one is through CEX, the other is transferring through bridges first and then swapping.  
CEX is very convenient and efficient, but as we all know, it's and very easy to manipulate under the table. As a user of CEX, you don't really control your own assets, FTX is the best case recently. 

DEX is decentralized，and the assets is on your own hand, we always say that code is law, it means you can handle your assets under the established and transparent rules, no one can manipulate your assets outside of these rules.
But the fagmentation is a problem that has plagued DEX for a long time, that is, we cannot swap tokens of different chains easily. 

That's why some token bridges emerge.
With bridges, the assets should be locked on one chain and minted on another chain so that your assets are cut into different parts on different chains and one part can be only used on one chain at a time. Moreover, many [secure events](https://github.com/xiyu1984/Blog/blob/main/docs/Multi-Chain%20Events.md) happened on current bridges.  
The bridge is just like a bank, issue wrapped tokens, anyway, when you ues the bridge, you just deal the wrapped token, not the really token of your own.

To solve these problems, we will provide an absolutely decentralized and cryptographic-based solution, through which the exchange between tokens deployed on different chains can be processed with determining security. Besides, there's no need to divide your assets into different isolated parts, on the contrary, your assets can be accessed from any chain and be treated as a whole.

### Introduction
We are building an advanced swap platform with features below:
1. decentralized
2. omnichain integrated
3. efficient and convenient
4. smooth transaction

We named it `Omniverse Protocol Stack` (`O20k` for short) , which can do exchanges for different kinds of tokens distributed in diverse chains.  
First, we provide a brand new token protocol called `Omniverse Token Protocol`(`OTP` for short), whose legality can be synchronized to any chain where `OTP` is deployed so that it to be accessed and operated anywhere at the same time as a whole, which is unlike being divided into isolated parts by token bridges. Besides, `OTP` is able to be compatible with current single-chain token protocols.  
Second, an `Omniverse Swap Protocol` (`OSP` for short) is provided to make exchanges for different kinds of OTP tokens just like a CEX did but in a decentralized way. One `OTP` token can directly exchange with another `OTP` token on Polkadot, and the related states could be verifiable on other `O20k` deployed ecosystems such as Ethereum, NEAR, Flow, Move chains, etc.  
Moreover, AMM is used to make calculations for exchanges and we innovatively worked out a new mathematical model called `O-AMM` to implement it, which can provide a wider "smooth trading range" than state of art and still keep the price sensitivity. 

We will build a Substrate Parachain to make out `O20k`, which can connect the other Parachains by `XCM` so that `O20k` could provide services for the whole ecosystem of Polkadot.  

* The `OTP` has the following features:  
  * The token based on `OTP` deployed on different chains is not separated but as a whole. If someone has one `OT`P based token $X$ on Polkadot, he will have one on Ethereum and other chains at the same time.   
  * The state of the tokens based on `OTP` is synchronous on different chains. If someone sends/receives one token $X$ on Polkadot, he will send/receive one token $X$ on Ethereum and other chains at the same time.  
  * The `OTP` works as below:  
![img](./docs/assets/OTP.png)
<p align="center">Figure.1 Workflow of OTP</p>

* The `OSP` has the following features:  
  * `OSP` is a decentralized DEX platform for Omniveser Tokens. Omniverse token $X$ can be exchanged with Omniverse token $Y$ through `OSP`. Similiar to `OTP`, the swap happens as a whole on Polkadot and other blockchains. If someone initiate a swap of $X$ with $Y$, he will give out some amount of $X$ and get related amount of $Y$ on Polkadot and all blockchains where `O20k` deployed.  
  * The Omniverse account of `OSP` is managed by the consensus of the `O20k` Parachain.
  * The `OSP` works as below:  
![img](./docs/assets/OSP.png)
<p align="center">Figure.2 Workflow of OSP</p>

* The [O-AMM](./docs/Principle%20of%20Omniverse%20AMM.md) is the core mechanism supporting the underlying exchanges of the `OSP`, which has the following features:  
  * Ability to balance smoothness and price sensitivity at the same time.
  * The curve is as below:  
![img](./docs/assets/Figure_1.png)  
<p align="center">Figure.3 Mathematic Model of `O-AMM`</p>  

### Demo

### Architecture
![img](./docs/assets/OmniverseProtocolStack.png)  
<p align="center">Figure.4 Architecture of Omniverse Protocol Stack</p>  

The full protocol stack of `O20k` includes several layers. From the top to the bottom, they are `OSP`(Omniverse Swap Protocol), `OTP`(Omniverse Token Protocol), Omniverse Account and Transaction Protocol, verification and consensus layer, and Trust-Free Off-Chain Synchronizers.  

The `OSP`(Omniverse Swap Protocol) is a direct swap platform for exchanges of Omniverse tokens. The calculation of the transaction amount is done by an `O-AMM` model we create. The details of the underlying mechanisms can be found in the [Principle of Omniverse-AMMM](./docs/Principle%20of%20Omniverse%20AMM.md). An omniverse swap operation can be initiated based on the `OTP`(Omniverse Token Protocol). `OSP` is implemented as a `substrate pallet`, and a mechanism similar to [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) is made out to operate an abstract account for the omniverse swap along with the substrate consensus.     

The `OTP`(Omniverse Token Protocol) is implemented as a `substrate pallet` on Polkadot, and as a smart contract on other chains(EVM chains for instance). A special cryptographic commitment is used to make a verification when a change in ownership of the token occurs, which can be verified in an equivalent approach on different tech stacks of different blockchains. The special commitment is unfakeable and non-deniable. Moreover, the transfer of Omniverse tokens happened on an Omniverse Account Protocol, and be guaranteed by an Omniverse Transaction Protocol.  
The implementation of the `Omniverse Account Protocol` is not very hard, and we temporarily choose a common elliptic curve `secp256k1` to make it out, which has been already supported by many blockchains. The `Omniverse Transaction Protocol` guarantees the ultimate consistency of transactions across all chains. These two protocols are working together to ensure the effectiveness of the `OTP`.  

The commitment verification protocol and consensus are underly mechanisms. The former provides an absolute cryptographic way to make verifications for special designed operations of `OTP`, in which malicious things could be found out determinedly. The latter is provided by the framework of `Substrate`, and an EIP-4337 like abstract account and a [verifiable computation for `O-AMM` calculation](./docs/Principle%20of%20Omniverse%20AMM.md#gas-mechanism) is made out along with the consensus mechanism.

The bottom is the off-chain synchronizer layer. The synchronizer is a very light off-chain procedure, and it just listens to the Omniverse events happening on-chain and makes the information synchronization. As everything in Omniverse paradigm is along with a commitment and is verified by cryptographic algorithms, there's no need to worry about synchronizers doing malicious things. So the off-chain part of `O20k` is indeed trust-free. Everyone can launch a synchronizer to get rewards by helping synchronize information.  

### logo
![img](./docs/assets/logo.png)  

## 黑客松期间计划完成的事项

**On-Chain**

- `pallet-OmniverseProtocol`
  - [ ] Omniverse Account Management
  - [ ] Omniverse Nonce Synchronization
  - [ ] Omniverse Commitment Verification

- `pallet-OmniverseToken`
  - [ ] Omniverse Token Factory
  - [ ] Omniverse Token Processor

- `pallet-OmniverseSwap`
  - [ ] Omniverse Swap Platform

**Algorithm**
- `O-AMM`
  - [ ] The ptototype of O-AMM (Omniverse AMM) algorithm.

**Client**
- Command-Line Interface
  - [ ] Omniverse Transaction Tools
  - [ ] Omniverse Swap Tools
  - [ ] Omniverse Account Tools  

## 黑客松期间所完成的事项 (2022年12月27日初审前提交)

- 2022年12月27日前，在本栏列出黑客松期间最终完成的功能点。
- 把相关代码放在 `src` 目录里，并在本栏列出在黑客松期间打完成的开发工作/功能点。我们将对这些目录/档案作重点技术评审。
- 放一段不长于 **5 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/docs/demo.mp4`。初审时这视频是可选，demo day 这是计分项。

## 队员信息
`Omniverse Labs` was established in December of this year. The first product of our team is [Dante Network](https://github.com/dantenetwork). `O20k` is an Web3 application based on Dante.  
Our team consists of the following members:  
|Name|Function|GitHub|Weixin|
|---------|---------|---------|---------|
|Jason|CEO|https://github.com/dantenetwork|HopeOfTown|
|Xiyu|Tech Guy|https://github.com/xiyu1984|xiyu_meta|
|Virgil|Tech Guy|https://github.com/virgil2019|cherima|
|kay404|Tech Guy|https://github.com/kay404|linkai528|

