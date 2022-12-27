# Polkadot Appetizer - by AdMeta

## About

Project Name: Polkadot Appetizer

Team: AdMeta

Started in 10.2022

## Project Details

### Overview

Polkadot Appetizer is a tool built for new users of the Polkadot ecosystem, designed to provide guidance and a seamless transition for crypto rookies or experienced users of other ecosystems(e.g. Ethereum).

Polkadot Appetizer is powered by AdMeta Network. AdMeta is a Web3 advertisement platform that focuses on privacy-preserving. AdMeta uses a privacy-preserving DID (Decentralized Identity) service to identify target groups for advertisers. By using privacy protection solutions, AdMeta guarantees from a technical point of view that no user data is collected.

Unlike traditional ad platforms, who collect users sensitive data(e.g. location, browsing history) for advertising, AdMeta does not collect or store any user data per se. Instead, users voluntarily decide and control what data can be stored in TEE, and the stored data in TEE cannot be accessed by anyone except users themselves.

### Architecture



### Logo

![AdMeta Logo](./docs/admeta_logo_square_transparent.png)

## Code Structure

**Blockchain**

- `pallet-ad`

  - [x] Propose ads (`fn propose_ad()`)
  - [x] Approve ads by council (`fn approve_ad()`)
  - [x] Reject ads by council (`fn reject_ad()`)
  - [x] Match ads for users (`fn match_ad_for_user()`)
  - [x] Claim rewards (`fn claim_reward_for_user()`)

- `pallet-user`
  - [x] Add/Update user profile (`fn add_profile()`)
  - [x] Set/Update ad display option (`fn set_ad_display()`)
  - [x] Claim rewards by user (`fn claim_reward()`)
  - [x] Do ads and users matching (`fn do_matching()`)

- `pallet-nft`

  - [x] Create NFT classes (`fn create_class()`)
  - [x] Mint NFT to users  (`fn mint()`)

- `admeta-runtime`
  - [x] In runtime dir

Details of our Rust documentation please find [here](https://admetanetwork.github.io/admeta/pallet_ad/pallet/index.html)


**Client**

- Web application
  - [x] xxx

## Tasks done during Hackathon

### Implementation

- Blockchain
  - Create NFT classes with metadata
  - Mint NFT to users with permission control
  - Adapt AdMeta Runtime for Polkadot Appetizer
  - Upgrade runtime to a newer framework version (v0.9.31)
- Web application
  - Connecting to Polkadot JS extension
  - Update/Add user profile
  - Ads display
  - Ads interaction (clicking and tracking)
  - Claim ad rewards
- DevOps
  - Deploy Blockchain testnet
  - Deploy Web app testnet and connect with the blockchain testnet
  - Misc. debugging and refinements

## Members

#### Han - Team Lead & Substrate Developer
- M.Sc. Computer Science, University of Stuttgart
- 8+ years of crypto and Web3 experience
- 14+ years programmer
- Core dev & early contributor of Litentry

#### Kmy - Full Stack Developer
- 4+ years of crypto and Web3 related development experience 
- 6+ years of full stack developer

#### Will - Backend Developer
- M.Sc. Computer Science, University of Toronto
- 7+ years of crypto and finance related development experience 
- 10+ years o backend developer

