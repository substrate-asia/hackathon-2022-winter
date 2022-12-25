## Basic information

Project Name：Cumulon Protocol 

Project approval date：Oct 2022

Project Video: 

[![IMAGE ALT TEXT](http://img.youtube.com/vi/"8MCJxVEJyII"/0.jpg)](https://www.youtube.com/watch?v="8MCJxVEJyII" "Cumulon Protocol")


## Project overall introduction

As everyone knows, the parachain auction has been going on for more than a year; various project parties have also enabled the staking function on the parachain so that more collators and delegators can participate in governance. We have summarized the following three deficiencies, and hope to solve these problems through the Cumulon protocol to better serve the ecology.

First, there is currently no tool to manage the staked assets of users on each parachain. If users want to know their staking status in each parachain, there is no unified entrance. Due to the modification of the staking pallet by various project parties, ordinary users do not have the relevant professional knowledge, making them unable to participate in the staking well.

Second, the existing official tool Polkadot.js is very unfriendly to support staking and un-staking, and it is very difficult to use.

Third, the assets staked by users to the parachain are in a dormant state. Its liquidity has not been well utilized again.

To address these issues, we built the Cumulon Protocol: a managed and structured fund protocol based on Polkadot for various Parachain staking assets.
The Cumulon Protocol consists of two parts:
The first part is a one-stop management tool for staking assets. We have already developed this part. At present, users can stake and unstake parachain assets through Cumulon’s friendly UI with their own Polkadot accounts, and can view a variety of information, including leaderboard of collator and delegate, APR of each collator, the self-staking information, round information and so on.

The second part is a structured fund based on parachain assets that we designed. The user stakes the corresponding parachain assets through the Cumulon parachain, and a new token will be mint. The token can be exchanged for the corresponding Cumulon token at a ration of 1 to 1. Cumulon token is a parent fund, which can be split into two sub-funds, one sub-fund pursues stable returns, and the other sub-fund provides high-risk leveraged returns.

It can be seen that Cumulon Protocol not only provides a one-stop asset management solution for the Polkadot ecosystem, but also creatively releases staking assets and uses them in a structured fund.

## Things to do during the hackathon

**Blockchain side**

- `pallet-staking
  - [ ] Complete the analysis and research of Staking Pallet related codes, index Moonbeam, Oak and related parachain data
  
**Client side**

- web 
  - [ ] Staking dashboard, showing basic information such as collator, delegator pledge amount, round amount, total pledge amount, etc.
   - [ ] Provide basic functions such as stake and unstake to facilitate community users to participate in stake activities more conveniently
   - [ ] provides relevant notification functions

## Things accomplished during the hackathon
  The all-in-one staking management tools has been finished: 
  https://cumulon.cloud/#/home

## Team members

- Anne Marketing Manager
- Mingqi CTO
- Yunjian Engineer
- Cedric Product Manager
