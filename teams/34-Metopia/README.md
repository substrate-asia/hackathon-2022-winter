## Project

Name： Metopia

Start time：2022.12

## Introduction

In this hackathon we have chosen the following track:
- Main Track: Blockchain tools.
- Bounty Track: Moonbeam Track2 - Governance

[Documents](https://docs.metopia.xyz)

[Live: https://kusama.metopia.xyz](https://kusama.metopia.xyz)

### About Metopia

Metopia is building a non-transferable badge protocol for communities and contibutors. It is also a platform which empowers non-financialized governance and reasonable incentive system based on contributors on-chain reputation with badges. 
By distributing these badges, communities add visibility to their members' work, including partners and investors. By claiming these badges, contributors collect their credentials step by step. This helps digital nomads build a transparent on-chain reputation through their on-chain & off-chain behaviours.
- Non-transferable badge protocol: communities can use badges to record different contributions from their members, partners, investors or others;
- Incentive: Communities/ DAOs are able to create transparent and reasonable incentive systems based on non-transferable badges;
- Governance: Metopia empowers customized DAO governance strategies based on user contributions & credentials;
- Raffle: Metopia lets you define exactly who is able to join your list, asset holders or contributors.

### Argumentation

The initial version of Open Gov, Polkadot's second-generation governance system, is already live on the Kusama network. In the latest Open Gov governance system, token holders will take further control of governance and can decide on parameter changes and treasury spending in the Polkadot ecosystem through on-chain voting. Meanwhile, the whole governance process of the Polkadot ecosystem requires four stages: preparation, decision, confirmation, and implementation. 
- Preparation Stage: the period before the official voting process, to allow users to understand the proposal.
- Decision Stage: token holders vote on the proposal.
- Confirmation Stage: the proposal will step onto the confirmation stage when it meets a certain Approval and Support threshold. During this period, Approval and Support rates need to be maintained above the threshold.
- Implementation Stage: A cooling-off period between the passing of the proposal and its official implementation.

Depending on the Tracks, the Decision Deposit required varies, and users have to pay a Decision Deposit in order for the proposal to enter the Decision Stage. Also, a deposit of 100 KSM is currently required to create a proposal.

The governance mechanism of Polkadot Ecosystem adopts the concept of "Voluntary Locking" for the calculation of voting power (Voting Power).
votes = tokens * conviction_multiplier

Currently, the governance of Polkadot ecosystem is centered around token and token holders. DOT or KSM holders are able to create proposals and vote on governance. However, we also find Polkadot eco enjoys abundant NFT assets and NFT holders, including projects that issue NFTs and those NFT projects based on Substrate. Therefore, Metopia wants to focus on the NFT projects and provide a diverse solution for Polkadot's governance system.

### Our solution

Metopia offers an NFT-centered governance protocol and tool to Polkadot and Kusama ecosystems. The major product provides different features for organizations and users:
- Organizations: create space, set up rules of voting power(import NFT contracts and Discord roles), and limit proposers
- Users: join spaces, create proposals, and take votes

Organizations are able to create spaces and set up two major parameters of the governance strategy - voting power and authors.
- Voting Power Strategy. Voting Power(VP) refers to the voting weight of voters to influence the result of the proposal, 1 VP=1 Vote. The space admins are allowed to set up and customize the voting power allocation by importing NFT contracts. The alternative parameters include whether to hold NFT, NFT holding amount and time. Administrators can set the weighting based on different scenarios.
- Proposer setting. After the VP strategy setting, space admins can set up the rule of proposers, namely who can create proposals in the space. Metopia offers three parameter templates: Discord roles, Loyal Members and Assigned Members.
  - Discord Role: Admins are able to define the empowered Discord roles. 
  - Loyal Members: Authentication based on member's VP. Admin needs to set the minimum amount of voting power(VP) required to create a proposal, like 0, 1, 2, etc.
  - Assigned Members: specific addresses can raise a proposal.

For Users, they can join space on Metopia. Users who meet the conditions set by space admins, including requirements such as holding a certain NFT, can create proposals in Space and participate in voting on other proposals, view voting results, etc.

### Demo videos
1. [Update user profile.mp4](https://oss.metopia.xyz/video/1.%20update%20user%20profile.mp4)
2. [Space creation](https://oss.metopia.xyz/video/2.%20space%20creation.mp4)
3. [Voting strategy setting](https://oss.metopia.xyz/video/3.%20voting%20strategy%20setting.mp4)
4. [Create proposals & votes](https://oss.metopia.xyz/video/4.%20create%20proposals%20%26%20votes.mp4)

### LOGO

![LOGO](https://oss.metopia.xyz/imgs/metopia-logo.svg "LOGO")

## Achievement in hackathon

- `Server`
  - Off-chain voting system for Kusama NFT communities
  - User account control based on Polkadot wallet

- `Client`
  - Visualization of the off-chain voting system for Kusama NFT communities
  - Visualization of account control
  - Governance history on Metopia for Kusama wallet

## Team

- **Moon**, PM

  - Crypto entrepreneur since 2017
  - Founder of HappyBlock, an Asia-based crypto news platform & has led NFT campaigns for Mask Network, FTX, WooTrade, etc

- **Aden**, UI|UX

  Former Tencent senior UX designer

- **Kenny**, Frontend engineer
  - 8 years of Web 2 software development experience & 3 years in solidity and Web 3 development

  [Linkedin](https://www.linkedin.com/in/kenny-ding-305518245/)

- **Lv**, Backend engineer

  - Experienced crypto developer
  - Previously at Rabbit Finance

  [Github](https://github.com/bengbengle)
