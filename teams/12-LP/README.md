## 基本资料

项目名称：PStorage基于零知识证明的波卡数据可用性解决方案

项目立项日期 (哪年哪月)：2022/11/01

## 项目整体简介

随着波卡生态上交易量的不断增加，尤其是XCM跨链交易的增加，如何有效维护数据可用性将成为区块链可扩展性的主要挑战。单纯依赖Relay Chain或者Parallel Chain来维护数据可用性将是高成本和低效率的，尤其是对于某些需要大数据吞吐量的应用而言，比如社交网络等，将是非常困难的。因此PStorage将使用零知识证明技术，来在实现只有数据承诺上链存储的同时，维护数据的完整性。并通过使用数据编码和采样等技术，保护数据的高可用性。PStorage将为波卡生态提供安全、可扩展、模块化的存储空间，增强波卡生态的数据可用性和富媒体处理能力。

With the increasing volume of transactions on the Polkadot ecosystem, especially the increase of XCM cross-chain transactions, how to effectively maintain data availability will become a major challenge for blockchain scalability. Relying on Relay Chain or Parallel Chain alone to maintain data availability will be costly and inefficient, especially for certain applications that require large data throughput, such as social networks, etc. It will be very difficult to maintain data availability. Therefore PStorage will use zero-knowledge proof technology to maintain data integrity while achieving only data committed to on-chain storage. PStorage will provide secure, scalable, and modular storage to enhance the data availability and rich media processing capabilities of the Poca ecosystem.


## 黑客松期间计划完成的事项


**区块链端**

- `Verifer`
  - [ ] Verifier 创建及数据结构定义 (`fn create_verifier()`)
  - [ ] Verifier 更新函数 (`fn update()`)
  - [ ] Verifier 验证函数 (`fn verify()`)

**客户端**

- web 端
  - [ ] 数据存储页面
  - [ ] 数据验证页面

- 可选
  - [ ] 数据查询和检索页面




## TODO 黑客松期间所完成的事项 (2022年12月27日初审前提交)

- 2022年12月27日前，在本栏列出黑客松期间最终完成的功能点。
- 把相关代码放在 `src` 目录里，并在本栏列出在黑客松期间打完成的开发工作/功能点。我们将对这些目录/档案作重点技术评审。
- 放一段不长于 **5 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/docs/demo.mp4`。初审时这视频是可选，demo day 这是计分项。

## 队员信息

[@only4sim](https://github.com/only4sim) Team Leader: architecture,cryptography

[@11]() Full Stack Developer: Rust, Typescript, Python

[@Wine]() Front-end Developer: React, Javascript

[@lansane]() Back-end Developer: Java, database