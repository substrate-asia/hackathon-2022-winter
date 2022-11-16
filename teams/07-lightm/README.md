## 基本资料

项目名称：Lightm

项目立项日期 (哪年哪月)：2022.9

## 项目整体简介

### Background

I am optimistic and firmly believe that [RMRK](https://docs.rmrk.app/concepts) can become the next-generation NFT standard (RMRK defines a composable NFT standard and is compatible with ERC721 in the implementation of EVM contracts). I believe that based on composability, it can bring a new and infinite imagination to the NFT field, so I set out to try to build the next generation of decentralized NFT platform.

### Introduction

Lightm is a batch of smart contracts I forked from the [RMRK smart contract](https://github.com/rmrk-team/evm) and refactored in [ERC2535 Diamond 2](https://github.com/mudgen/diamond-2-hardhat) way, and it's also the name of NFT platform I'm building now.
Lightm optimized the RMRK contract using ERC2535:
- Due to [the size limit of a single contract of EVM](https://ethereum.org/en/developers/tutorials/downsizing-contracts-to-fight-the-contract-size-limit/), RMRK has compromised the contract implementation, and they have provided two countermeasures:
  1.  Use separate contracts to provide full functionality. This actually brings a higher level of understanding complexity to the developer, as well as the inefficiency brought about by the compromise mechanism itself.
  2.  Use a consolidated contract that provides full functionality. But this also requires a functional compromise to reduce the size of the contract, that is, it still cannot handle the need for more custom logic (in this case, the size of the contract will still exceed the limit).

  ![RMRK Contract Structure](https://raw.githubusercontent.com/rmrk-team/evm-sample-contracts/master/RMRKLegoInfographics.png)

  One of the core capabilities of ERC2535 is to allow unlimited contract size. Lightm optimizes RMRK based on ERC2535 to perfectly solve this situation.
- In addition, Lightm can passively enjoy other advantages brought by ERC2535:
  - ERC2535 is based on the function multiplexing capability of Delegatecall, which can effectively reduce unnecessary redundant contract deployment costs.
  - ERC2535 native support upgradable contract. Upgradable contracts are indeed a double-edged sword, but they are also **optional**.
- And Lightm have **different implementation on Equippable**.

### Technology Architecture

- UI: Next.js + Rainbowkit + Ethers
- Smart Contract: RMRK smart contract optimized by Lightm based on ERC2535

### Logo
![Lightm Logo](./assets/Lightm.png)

## 黑客松期间计划完成的事项

**智能合约端**
- [ ] 以ERC2535方式对RMRK合约的重构已 **基本（处于暂时可用的状态后，就把精力投入在了UI实现，这里依然有细节待优化，以及后续对Equippable实现的测试）** 在黑客松前完成。
- （持续）跟进RMRK多源Lego EIP-5773以及Nesting Lego的最新改动，并同步更新Lightm代码。
- [ ] 提供可选的验证器Validator合约（后续在docs中补充说明它是什么）。
- 改进优化链下部署脚本（高自由度，低易用性，更多为开发者准备）以及链上部署工厂（低自由度，高易用性，更多为创作者准备）：
	- [ ] 链下部署脚本
	- [ ] 链上部署工厂
- [ ] 完整专业的README文档
- [ ] 基于Sudo Swap的AMM合约部署

**客户端**
- [ ] 支持Nesting（嵌套，即NFT持有NFT）特性，已**基本（仍有细节优化工作，需要跟随可能发生的智能合约的改动）** 于黑客松前完成：
	- [ ] 针对移动端UI优化
	- [ ] 支持多选批量（通过LightmInit继承的multicall方法做到）操作Children列表
- [ ] 支持MultiResource（多资源，即NFT可以包含多个输出）特性，已**基本（仍有细节优化工作，需要跟随可能发生的智能合约的改动）** 于黑客松前完成：
	- [ ] 支持在提交Resource Proposal时指定资源覆盖(overwrites)
- [ ] 支持Equippable（可装备，即NFT A持有NFT B情况下，NFT A可以装备NFT B，客户端能够基于链上关系渲染出NFT A装备NFT B的图像或其他表现形式）特性：
	- [ ] UI
	- [ ] 支持Base创建与配置
	- [ ] 支持BaseRelatedResource添加
	- 支持装备效果展示：
		- [ ] image
		- [ ] video
		- [ ] audio
		- [ ] 3D model
- [ ] 支持NFT创建：
	- [ ] 支持调用链上部署工厂合约部署Collection，已**基本（仍然需要同步合约端可能存在的改动）** 完成
	- [ ] 允许用户进行常用的NFT Mint策略选择
- [ ] 使用Validator合约对嵌套关系以及装备状态进行校验
- NFT渲染类型支持：
	- [x] image
	- [ ] video
	- [ ] audio
	- [ ] PDF
	- [ ] 3D model
- [ ] 添加基于SudoSwap lssvm的AMM支持【低优先】
	- [ ] AMM浏览页
	- [ ] AMM Pool创建
	- [ ] AMM Pool详情页
- （持续）优化用户体验:

## 黑客松期间所完成的事项 (2022年12月27日初审前提交)

- 2022年12月27日前，在本栏列出黑客松期间最终完成的功能点。
- 把相关代码放在 `src` 目录里，并在本栏列出在黑客松期间打完成的开发工作/功能点。我们将对这些目录/档案作重点技术评审。
- 放一段不长于 **5 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/docs/demo.mp4`。初审时这视频是可选，demo day 这是计分项。

## 队员信息
[@Ayuilos](https://github.com/Ayuilos)
职责：
- 前端开发
- Solidity开发
- UI设计
- 产品

[@WhiskeyRomeoTango](https://github.com/WhiskeyRomeoTango)
职责：
- 前端开发

[@BoynChan](https://github.com/BoynChan)
职责：
- 合约开发