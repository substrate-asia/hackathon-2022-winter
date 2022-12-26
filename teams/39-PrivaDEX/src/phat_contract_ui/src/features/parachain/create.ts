import { ApiPromise, WsProvider } from '@polkadot/api'
import { khala } from '@phala/typedefs'
import { types as phalaSdkTypes } from '../../sdk'

// types

const PhalaWorldTypes = {
  RaceType: {
    _enum: ['Cyborg', 'AISpectre', 'XGene', 'Pandroid'],
  },
  CareerType: {
    _enum: [
      'HackerWizard',
      'HardwareDruid',
      'RoboWarrior',
      'TradeNegotiator',
      'Web3Monk',
    ],
  },
  StatusType: {
    _enum: [
      'ClaimSpirits',
      'PurchaseRareOriginOfShells',
      'PurchasePrimeOriginOfShells',
      'PreorderOriginOfShells',
    ],
  },
  RarityType: {
    _enum: ['Prime', 'Magic', 'Legendary'],
  },
  PreorderInfo: {
    owner: 'AccountId',
    race: 'RaceType',
    career: 'CareerType',
    metadata: 'BoundedString',
  },
  NftSaleInfo: {
    race_count: 'u32',
    race_for_sale_count: 'u32',
    race_giveaway_count: 'u32',
    race_reserved_count: 'u32',
  },
  Purpose: {
    _enum: ['RedeemSpirit', 'BuyPrimeOriginOfShells'],
  },
  OverlordMessage: {
    account: 'AccountId',
    purpose: 'Purpose',
  },
}

export default async function create(endpoint: string) {
  const { cryptoWaitReady } = await import('@polkadot/util-crypto')
  await cryptoWaitReady()
  // console.log('Polkadot crypto is ready')

  const ws = new WsProvider(endpoint)
  const api = await ApiPromise.create({
    provider: ws,
    types: { ...khala, ...PhalaWorldTypes, ...phalaSdkTypes },
  })
  // console.log('WebSocket API is ready:', api.runtimeVersion)
  return [ws, api]
}