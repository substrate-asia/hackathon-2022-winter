# PrivaDEX: XC-DEX
<img src="docs/privadex_logo.png" width="250"/>

## Problem: Cross-chain trading is too cumbersome
80% of Polkadot DEX users trade on a single parachain, where they have access to just 10-30% of Polkadot's total TVL. Executing a cross-chain trade is a 5 minute endeavor that requires several DEX swaps, manually bridging tokens, and waiting for all the transactions to be processed ... it's far too cumbersome. New DEXes, DeFi protocols, and parachains (e.g. Composable Finance's Pablo, HydraDX Omnipool, Interlay Swap, and Polkadex) provide utility to their own users but further fragment Polkadot's DeFi ecosystem.

Polkadot traders have a simple need: get *convenient* access to all the liquidity available on Polkadot using the funds in their existing wallet.

## Solution: XC-DEX automates cross-chain trading
XC-DEX automates cross-chain trading. The user submits just one extrinsic/transaction, and XC-DEX internally takes care of the DEX swap, XCM transfer, and local asset transfer.

We implemented XC-DEX in a Phat Contract, Phala Network’s off-chain computation framework. Phat Contract runs in a Trusted Execution Environment and supports network interfacing, which allows our escrow account to securely create, sign, and submit extrinsics behind the scenes. Because Phat Contract runs on a decentralized worker pool and is fully automated (similar to a smart contract), there is no risk of a central authority!

## Demo
Our [demo](docs/privadex_xcdex_demo.mp4) depicts the following scenario: suppose Alice wants to swap xcDEV on Moonbase Beta for ERTH on Moonbase Alpha. Then
1. Alice sends xcDEV to the XC-DEX escrow account on Moonbase Beta
2. XC-DEX performs a cross-chain transfer of xcDEV to Moonbase Alpha
3. XC-DEX swaps DEV for ERTH on Uniswap on Moonbase Alpha.
4. XC-DEX transfers ERTH from its escrow account to Alice’s account on Moonbase Alpha.

Note that Alice now just needs to perform step 1. XC-DEX performs the remaining steps.

