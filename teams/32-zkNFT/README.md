## 基本资料

项目名称：zkNFT

项目立项日期 (哪年哪月)：2022-11

## Introduce

- a zk privacy nft project based on manta, beside public nft mint and transfer, user can also private their nft transfer. 
- Current manta only support asset privacy, by integration pallet_uniques or other NFT standard with manta-pay, we can support NFT privacy. and we can expand this idea to croos chain nft privacy if we want. 
- pallet_uniques used for NFT behaviour, and adding support NFT on manta-pay, integrationn NFT with asset-manager, also works with manta-sdk to make e2e works.

Architecture:

This product leverage some manta existing architecture but expand it more flexible, in the manta-pay pallet, we support integrate pallet_uniques, this pallets is useful for NFT and SBT features. Given an example of mint NFT,
once transaction is signed successful, the NFT image will be upload to IPFS, and NFT will handled by pallet_uniques and update related metadata infomration.

![arch](./docs/1.png)

Components:

We abstract a common ProxyLedger which done some basic common behaviour, and for different asset type, we implements different TransferLedger. Using this feature, we can even support NFT airdrop and more than that.

![arch](./docs/2.png)

For example, for sbt that first mint by project manager, after private SBT, project manager can private transfer SBT to users, but user cann't private transfer SBT, because SBT don't allow to transfer. Here is a basic workflow(although not implements complete):

![sbt](./docs/sbt.png)

## 黑客松期间计划完成的事项

- blockchain side(`pallet-zknft`)
  - [x] NFT Private Mint
  - [x] NFT Public Transfer
  - [x] NFT Private Transfer
  - [x] NFT Private Transfer with asset_id and asset_type

- web side(front-end)
  - [x] NFT Create Page
  - [x] NFT Transact Page
  - [x] NFT View Page

- sdk side(sdk)
  - [x] NFT Collection Create
  - [x] NFT Item Mint
  - [x] NFT ToPrivate Transact
  - [x] NFT PrivateTransfer Transact
  - [x] NFT PublicTransfer Transact
  - [x] View public NFTs 
  - [x] View private NFTs 

## 黑客松期间所完成的事项 (2022年12月27日初审前提交)

- 2022年12月27日前，在本栏列出黑客松期间最终完成的功能点。
- 把相关代码放在 `src` 目录里，并在本栏列出在黑客松期间打完成的开发工作/功能点。我们将对这些目录/档案作重点技术评审。
- 放一段不长于 **5 分钟** 的产品 DEMO 展示视频, 命名为 `团队目录/docs/demo.mp4`。初审时这视频是可选，demo day 这是计分项。

## 队员信息

- dots2048: Backend, https://github.com/dots2048
- Alex: Fullstack