# 基本资料

项目名称：Onelink

项目立项日期：2022-11-14

## 项目整体简介

* 通过 XCM 协议，聚合波卡生态不同平行链上 Swap 的流动性，提供一键式的 Swap 体验，为用户提供最优的交易路径。
* 接入一些跨链基础设施 (如：zerolayer), 与其他公链平台上 swap 的流动性进行聚合，有优先做 EVM 生态。
* 采用 Rust 以及其他中间件实现高性能计算服务用于计算最佳交易 graph.
* 对交易数据以及内存池等进行深度分析，实现 MEV 套利策略。

## 黑客松期间计划完成的事项

### 区块链端

* 实现一个 pallet `palelt-onelink`, 提供接口可以发起到其他平行链 swap 交易。

### 服务端

* 使用 Rust 实现高性能通信与交易数据分析计算，提供交易策略。

### 客户端

Web 端

* 核心 Swap 页面，一键交易以及展示交易路径，估算交易手续费等。
* Stats 页面，用于统计成交数据等数据分析。

## 黑客松期间所完成的事项 (2022 年 12 月 27 日初审前提交)

## 队员信息

| Name    | Role                               | GitHub    | Wechat   |
|---------|------------------------------------|-----------|----------|
| Bob Liu | Substrate + Backend + Architecture | @Akagi201 | Akagi201 |
| Carl    | Full Stack                         |           |          |
| Cheng   | Substrate + Backend                |           |          |
| Simon   | Substrate + Backend                |           |          |
| Pingree | Frontend                           |           |          |
