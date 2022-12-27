## basic information

Project name: PMail  

Project approval date (month and year): November 2022

## Project overall introduction

![image-20220622110833152](./docs/logo-200.png)

Mail service is the longest-surviving means of communication on the Internet today. There are more than 4 billion mailbox users in the world, accounting for more than 50% of the world's total population, and it still maintains an annual growth rate of 3%.

The email product design looks very complete, but there are still 3 main pain points:
- Information leakage: email content can be monitored/viewed by service providers
- Information loss: service providers may stop their services, reference: Yahoo Mail.
- Spam: various kinds of advertising emails/phishing emails.

PMail is the first mail service system based on Web3.0 and Substrate technology, providing users with permanent mail service without centralized service, which contains several features:  

- Aggregate Communication: Support for Web2/Web3 mail communication, cross-chain mail exchange.  
- Privacy Protection: Support for peer-to-peer content encryption, proxy mail relay functionality.  
- Asset Delivery: Support for mass messaging via on-chain identity and NFT domains.  
- Extended Functionality: Support for decentralized cloud storage.  

Technically, we will develop a decentralized relational index based on Substrate, use off-chain working machines to develop a decentralized mail gateway, and deploy Arweave to achieve permanent front-end operations. Thus providing any user with a secure, trustless and permissionless persistent mail service.

![image-20220622110833152](./docs/pmail.jpg)

## Things planned to be done during the hackathon

**blockchain**

- Runtime Module
  - [x] Domain NFT Registration (`fn bind_address()`)
  - [x] Set Contact Aliases (`fn send_mail()`)
  - [x] Aggregate Mail Queue Cache (`fn set_alias()`)
- Decentralized mail gateway
  - [x] Web2 Mail Synchronization Cache (`fn submit_add_mail()`)
  - [x] Gateway Node Actuator Polling (`fn submit_update_authority_index()`)

**client**
- webend
  - [x] Mailbox Login & Registration Page
  - [x] Mail Index & List Page
  - [x] Mail Creation & Delivery Page
  - [x] Mailbox Cloud Service Page

**backend**
- Mail API Service
  - [x] Web2 Mail Proxy Gateway
  - [x] Web2 Mail Indexing Service
  - [x] Decentralized Storage API Service
- SubQuery Indexing Service
  - [x] On-Chain Mailing List Indexing Service
  - [x] On-Chain Mailbox Contact Indexing Service

## 黑客松期间所完成的事项 (2022年12月27日初审前提交)

- 2022年12月27日前，在本栏列出黑客松期间最终完成的功能点。
- 把相关代码放在 `src` 目录里，并在本栏列出在黑客松期间打完成的开发工作/功能点。我们将对这些目录/档案作重点技术评审。
- 放一段不长于 **5 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/docs/demo.mp4`。初审时这视频是可选，demo day 这是计分项。

## Member Information

**Bin Guo**  
- Over 9 years of experience in software development and project management, engaged in work related to blockchain and big data, and worked in a core research institution of State Grid (Fortune 500).
- Polkadot senior ambassador, Substrate Evangelist, and early participants in the Polkadot ecosystem.
- Github: https://github.com/AmadeusGB
- Email: amadeusgb123@gmail.com

**Smith Li**  
- Over 9 years of working experience in various aspects of computer programming.
- Worked in the blockchain industry for 3+ years,  a blockchain development engineer, familiar with polkadot, bitshares, fabric, etc.
- Hackathon winner as a team tech leader: Winners of Polkadot Hackathon 2022.
- github: https://github.com/baidang201

**yiwei Shi**  
- Art and management background, worked for Hearst, MSN, responsible for market and product, more than one year of blockchain development experience, familiar with computer science, cryptography and different economic mechanisms, good at Go and Rust development。Hackathon winner as a team member: Winners of Polkadot Hackathon 2022
- Github : https://github.com/shiyivei
- Email : shiyivei@outlook.com

**Yunfei Li**  
- Over 8 years of front-end experience,good at vue, react and nodejs，and interested in blockchain and decentralization
- Github: https://github.com/liyunfei22
- Email: liyunfei696@gmail.com

**Youyou Li**
- Eight years of experience in advertising industry. Provided storyboarding, graphic design, UI design, and other visual content for customers. Worked on projects for Dyson, Sony, Bank of China, Carrefour, Cadillac and other brands. Did graphic and UI design for several web 3 projects out of interest in the area. 
- Github: https://github.com/youyou0921
- Wechat: 18516611762