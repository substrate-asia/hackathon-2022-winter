## 基本资料

项目名称：We3social

项目立项日期：2022/10/31

## 项目整体简介

We3social是moonbeam上构建的多链DID社交项目，是Web3人才身份数据社交的基础设施，致力于解决点对点的联系。在web2到web3的过程中，有一个问题是被大家所忽视的。区块链加密属于的是少部分的圈子，同时用户的社交存在较高的信息传递障碍，彼此互不认识，且不感兴趣。We3social基于隐私计算与AI推荐系统，智能的根据用户需求推送用户社交。形成以AI兴趣数据驱动的新的社交行为范式。例如一个加密爱好者希望发行新的项目，大学生想要交友学习solidity，投资者想要找到合适的开发者，社群KOL想获得更多的粉丝， We3social都能够智能的为其推送数据，且行为模式交互数据只点对点可见，不用担心任何隐私泄露问题。![img](./docs/w3logo.jpg)

## 项目架构
合理的平衡链上与链下是Web3应用的重要一环。本MD文档将主要从链上与链下来阐述整个项目。链上为部署在Moonbeam上的DID智能合约，链下则为运行We3social的必要基础web应用程序。Hackthon期间链上合约为完成的最小功能单元。

**On-Chain DID设计architecture**

Layer 1：代理层，将合约调用代理到协议层。使用代理的好处是合约可升级，且用户入口的合约地址不变.

Layer 2：协议层（逻辑层），这层实现了W3C的DID协议，并且逻辑可以更改。不存储自己的状态变量，只使用Layer 3的存储，以避免升级后的存储冲突。

Layer 3：数据存储层，使用iterable map存储数据。数据的存储格式为bytes

合约升级：由于数据和协议相分离，所以有升级需要时，直接修改Layer 2的合约即可。Layer 3的数据存储形式直接就是K-V结构，这是与协议无关的，所以升级时无修改动。

**Off-chain architecture**

We3social链下系统采用分布式微服务的架构方式来确保整个系统的稳定可靠。开发语言主要基于RUST+JAVA接口模块化的方式来处理各类型事物。数据层面上使用Mysql+redis来确保数据的持久化与高并发的场景。整个系统有四大模块，推荐系统、用户系统、网络工具箱、功能模块。整个系统组件化，可随时根据需求动态的替代。

## User interface details：
我们的前端DAPP开发使用的是React，相关的设计地址可查看下面地址。

![img](./docs/user.jpg)

The figma address (https://www.figma.com/file/Vlj722FwD01NUAnxopys3W/Brief_9_18?node-id=79%3A1226)



## 黑客松期间所完成的事项 (2022年12月27日初审前提交)


**On-Chain: Contracts**

- `SimpleDID`
  - [x] 部署Moonbeam合约 (`deploy`)
  - [x] 链上DID身份测试版注册 (`fn mint()`)

**Off-Chain**
- [x] We3social DAPP前后端应用
- [x] Java 主服节点
- [x] Rust 微服务节点

**web Dapp 端 (react)**
  - [x] 登录注册
  - [x] 灵魂绑定问卷系统
  - [x] DID信息浏览
  - [x] Moonbeam合约交互
  - [x] 需求动态及发帖
  - [x] 设置和用户协议

**We3social Java 后端 (主节点)**
  - [x] 登录注册
  - [x] 邮件验证码功能
  - [x] 动态推送
  - [x] 微服务转发
  - [x] Redis高并发和Mysql数据库的初始化
  - [x] 后端API接口


**DID-Server Rust 后端 (分布式功能节点)**
  - [x] DID推送
  - [x] 消息推送
  - [x] 好友列表
  - [x] Mysql数据库的初始化
  - [x] 测试模块

## 下一个阶段的目标
- 1.构建多链的DID数字身份钱包应用
- 2.与10家以上的社区取得区块链合作
- 3.基于Flutter开发Android、IOS版本的应用
- 4.重构DID智能合约

## 更多严实:

- DAPP 演示，请在钱包中打开 (http://dapp.w3social.chat)｜TestAccount  123@qq.com｜password 123456｜ 

- We3social 官网 (http://www.w3social.chat)

- API 文档 （https://docs.qq.com/doc/DRG9wdll4UlFlckJt）



## 队员信息

|Name|Function|GitHub|Twitter|
|---------|---------|---------|---------|
|DengLiangjun|Rust|https://github.com/peter-jim||
|Liulei|operation||
|Dingyulong|JAVA|https://github.com/ed-stan||
|Konglili|React|https://github.com/AutumnDeSea||
|Tanxuan|React|https://github.com/Sihan-Tan||
|Lanqiao|UI/UX|||