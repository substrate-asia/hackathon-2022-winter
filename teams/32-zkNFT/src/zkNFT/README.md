## zkNFT

- a zk privacy nft project based on manta, beside public nft mint and transfer, user can also private their nft transfer.
- Current manta only support asset privacy, by integration pallet_uniques or other NFT standard with manta-pay, we can support NFT privacy. and we can expand this idea to croos chain nft privacy if we want.
- pallet_uniques used for NFT behaviour, and adding support NFT on manta-pay, integration NFT with asset-manager, also works with manta-sdk to make e2e works.

## Features

Runtime:

- NFT Private Mint
- NFT Private Transfer
- NFT Public Transfer

Frontend:

- NFT Collection Create
- NFT Item Mint,support upload image to IPFS
- NFT ToPrivate Transact
- NFT PrivateTransfer Transact
- NFT PublicTransfer Transact
- NFT View Public
- NFT View Private

## Components

- Zknft with NFT feature supported
- signer
- frontend


## NOTES

IPFS demo project: https://app.infura.io/dashboard/explorer/2JLWqhTvTCl9Zzx7Qi93w8WjqW2

start frontend:
- REACT_APP_IPFSSK=$IPFSSK yarn craco start