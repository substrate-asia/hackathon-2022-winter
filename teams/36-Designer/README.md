## Project Info

Name: Designer

Found Date: Dec 2022.

## Overview

![](./docs/designer-logo.svg)

`Designer` is a decentralized coordinate tool for DAO. With Designer, members in DAO can sign agreements with anyone not relying on any centralized services. The agreement content can be encrypted or public as needs.

Digital agreement is not a new thing. For a long time, digital agreements are supported by centralized services, like `hellosign`, `docusign`. By using those services, we are facing their censorship requirements, and we may lose our treasures if these services providers are broke.

Based on blockchain, smart contract and decentralized storage, we can build decentralized digital agreement platforms or tools. In the past years, there are several other tools saying they are based on decentralized technologies. Is it real? No, they are cheating. 

They are using decentralized technologies, but they don't let you know, there are also centralized SaaS/APIs used too. You will lose your treasures again, and you will facing censorship.

`Designer` is a pure decentralized digital agreement tool for DAO, because it's not rely on centralized technologies.

Designer uses Gear Smart Contracts which is a new way, and CESS as decentralized storage layer. The front end uses React + gear-js + polkadot-js/extention. 

### Tech

Designer is based on the decentralized storage project CESS and the WASM smart contract platform Gear. 



## Plan in Hackathon

**Blockchain**

- `gear contracts`
  - [ ] Add Gear Smart-Contract support
  - [ ] Verify signatures in smart contract
  - [ ] Store agreements in smart contract
  - [ ] Access control in smart contract

- `CESS`
  - [ ] Add CESS support
  - [ ] Customize the CESS SDK
  - [ ] Customize CESS gateway
  - [ ] Access control

**Client**

- Web App
  - [ ] User Auth
  - [ ] Create Agreements
  - [ ] Sign Agreements
  - [ ] Share Agreements
  - [ ] Verify Agreement signature


## Things done in Hackathon

The project is build from scratch in this Hackathon.

**Blocchain**
- `gear contracts`
  - [ x ] Add Gear Smart-Contract support
  - [ x ] Verify signatures in smart contract
  - [ x ] Store agreements in smart contract
  - [ x ] Access control in smart contract

- `CESS`
  - [ x ] Add CESS support
  - [ x ] Customize the CESS SDK
  - [ x ] Customize CESS gateway
  - [ x ] Access control
  - [ x ] Customize the CESS OSS
  - [ x ] Fix issues in CESS code

**Client**

- Web App
  - [ x ] Integrate Gear Smart-Contract
  - [ x ] Integrate CESS Storage
  - [ x ] User Auth
  - [ x ] Create Agreements
  - [ x ] Sign Agreements
  - [ x ] Share Agreements
  - [ x ] Verify Agreement signature

## Team

Hack  
Smart Contract Engineer  
github id: 0xack4  

Olg  
Product Manager  
github id: olgwander  

Wendy  
Web Engineer  
github id: wendychaung  

大胡子天使  
Tech advisor   
github id: N/A  



