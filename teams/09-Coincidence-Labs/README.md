## 基本资料

项目名称：Wormhole3

项目立项日期 (哪年哪月)：2022/08

## 项目整体简介

项目简介，英文提交。包括但不限于：

- 项目背景/原由/要解决的问题 (如有其他附件，可放到 `docs` 目录内。英文提交)。
Wormhole3 acts as a bridge from Web2 to Web3, allowing users to enjoy web3 functions by operating on Web2 applications. But the biggest problem Wormhole encountered was how to allow users to operate Web3 accounts on Web2 without feeling. With the current ETH account system, once the user's private key is leaked, the account will be lost, and if the user does not entrust the private key to us, we cannot synchronize user operations to the Web3 network.

Solution: Based on the current situation that ETH cannot realize private key custody, we implement this function based on STEEM's graphene account hierarchical design. In Wormhole's account design, users include a web3 (ETH) account and a social account (steem). Randomly generate a web3 address for the user on the front-end page, and use the web3 private key to generate the steem master secret key through the hash algorithm. At the same time, generate a hierarchical steem account for the user on the front-end, and send the public key encryption to the back-end. Create a steem account, encrypt and store the posting key of the account, and delegate the active key permission to our official account, so that the user can control the ownership of his account. We use the proxy permission to realize the bridging function for it. Users can fully control all their accounts by using the private key in their hands, and revoke our agency authority at any time

The core function of Wormhole3, subjective proof of work, requires the user's reputation, and calculating the user's reputation on Twitter is the first step in realizing subjective proof of work. However, bots are rampant on Twitter, and it is difficult to distinguish fake data, which makes it very difficult to objectively calculate Twitter's reputation score.

Solution: Wormhole3 uses the user's basic data, associated data, and recent tweets to identify robot accounts using artificial intelligence, and finally generates Twitter reputation points for users based on the robot's probability value combined with the number of fans of the user. And use this score to issue a reputation NFT to the user.

Getting data from web2 and crossing it to web3 is an unresolved problem. Wormhole3 will also realize decentralized synchronization of web2 data to web3 in the future. Currently, web2's data acquisition will be restricted by web2's centralized technology companies.

Solution: For twitter data, limited by the restrictions of twitter api, we use multiple api keys and crawlers to obtain various data sub-modules, and then organize the data in a unified process and provide them to the required modules .

- 项目介绍
**About:**

Wormhole3 is a decentralized curation platform incubated by Coincidence Labs. Users can leverage their social influence to earn cryptocurrency, which Web3 projects can use to build leading curation protocols to market projects.

**The core of the project:**

- Decentralized curation protocol
    - Twitter Reputation NFT: Wormhole3 connects with Twitter API to generate exclusive Twitter Reputation NFT for users, representing the user's influence on the original Web2 social platform.
    - Evaluate user contributions: Evaluate curator contributions and automatically distribute rewards through the curation protocol

**Application Scenarios：**

- Curation tweet: Web3 project party/community configures the curation protocol and curation reward pool for the content that needs to be curated, and the Wormhole3 Curation protocol will automatically evaluate the contribution of the curator (the person who quotes the tweet), and automatically Tokens in the reward pool are distributed to curators.
- Twitter Space Promotion: Combine the features of Wormhole3 to promote before & during Twitter space (For example: before Twitter Space starts, you can use curation protocol to distribute cryptocurrency to quote contributors of Space tweets; during Twitter Space, Space host can reward active participants with cryptocurrency directly in the commenting are by sending out a tweet, and create a POP-UP post, at the same time, the host can create POP-UP posts, and distribute cryptocurrency to participants according to the Curation Protocol in a specific time period)

## 技术架构
Bridge: At present, the user's behavior on web2 is recorded in web3 in a semi-centralized way and crawlers, forming the user's original social graph. In the future, the data transfer from web2 to web3 will be completed in a manner similar to an oracle.

web2 reputation: Evaluate users' Twitter social influence based on artificial intelligence-assisted artificial methods.

web3 reputation: Use Solidity to write a series of contracts (currently based on ERC20, ERC1155, and consider ERC3525 or an updated protocol suitable for SBT in the future) to build a subjective proof-of-work protocol to continuously evolve the user's reputation value in a decentralized manner.

Account system: At present, graphene technology is used to provide users with web3 social accounts. Users have absolute control over the accounts. In the future, CA or MPC will be considered to achieve a more flexible account system.
- 项目 logo (如有)，这 logo 会印制在文宣，会场海报或贴子上。
![资源 6@4x](https://user-images.githubusercontent.com/101859914/209519096-bfeb3d71-1ce0-4ea2-be32-94579d6813d6.png)
![资源 4@4x](https://user-images.githubusercontent.com/101859914/209519138-57348786-07d5-47b8-9b36-a2fe0e84530c.png)


## 黑客松期间计划完成的事项
For Community:

Complete multi-chain curation and deploy to Moonbeam

Complete the curation function of Twitter space

For User:

Complete the function of rewarding $Steem with emojis

Users can perform some Twitter-related operations in Wormhole3

## Deck[Wormhole3 —A Decentralized Curation Platform（BP）_1227 EN.pptx](https://github.com/ParityAsia/hackathon-2022-winter/files/10306250/Wormhole3.A.Decentralized.Curation.Platform.BP._1227.EN.pptx)

## Demo

https://drive.google.com/file/d/1zRcJjL2kufAxKg9YnnzNveiI6gcsIshK/view?usp=sharing


## 队员信息
wangxi： Core developer
Necklace: Core developer
OxNought: Founder
Roy Zhang: Marketing
Cayla: Marketing
Armonio: Token Ecnomist

## See more
🌐Alpha website: https://alpha.wormhole3.io/

🌐Steem users website: https://steem.wormhole3.io/

▶️Twitter: https://twitter.com/wormhole_3

▶️Discord: https://discord.com/invite/HkA7dawzNW

▶️Medium: https://medium.com/@wormhole3

▶️Gitbook: https://nutbox-io.gitbook.io/wormhole3/




