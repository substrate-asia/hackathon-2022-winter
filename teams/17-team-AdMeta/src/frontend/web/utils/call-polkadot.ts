import type { ApiRx } from '@polkadot/api'
import * as U from './'
import { hexToString } from '@polkadot/util'

class CallPolkadot {
	sender: string
	api: ApiRx

	constructor(sender: string, api: ApiRx) {
		this.sender = sender
		this.api = api
	}

	private tx() {
		if (!this.api) return null

		return this.api.tx
	}

	private qu() {
		if (!this.api) return null

		return this.api.query
	}

	// get token
	getToken() {
		return new Promise((resolve, reject) => {
			this.qu()
				?.ormlNft.tokens(2, 0)
				.subscribe((c: any) => {
					if (c.toString()) {
						const d = JSON.parse(c.toString())
						d.data = hexToString(d.data)
						d.metadata = hexToString(d.metadata)
						resolve(d)
					}
				})
		})
	}

	// mint token
	async mintToken(metadata: string, data: string) {
		const { web3FromAddress, web3Enable } = await import(
			'@polkadot/extension-dapp'
		)
		await web3Enable(U.C.EXTENSION_NAME)
		const injector = await web3FromAddress(this.sender)

		return new Promise((resolve, reject) => {
			this.tx()
				?.nft.mint(this.sender, 3, metadata, data)
				.signAndSend(this.sender, { signer: injector.signer })
				.subscribe(result => {
					if (result.isInBlock) {
						resolve({ info: 'ok' })
					}
				})
		})
	}
}

export default CallPolkadot
