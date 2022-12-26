import * as U from './'

export const formatAddress = (address: string): string => {
	if (!address) {
		return ''
	}
	const str_1 = address.substring(0, 4)
	const str_2 = address.substring(address.length - 4)
	return `${str_1}......${str_2}`
}

export const connectWallet = async (callback: (arg0: U.T.Wallet[]) => void) => {
	if (typeof window !== 'undefined') {
		const { web3Enable, web3Accounts } = await import(
			'@polkadot/extension-dapp'
		)
		const extensions = await web3Enable(U.C.EXTENSION_NAME)
		if (extensions.length === 0) {
			console.log('No extension found')
			return
		}
		const allAccounts = (await web3Accounts()) as U.T.Wallet[]
		callback(allAccounts)
		localStorage.setItem('_account', JSON.stringify(allAccounts))
	}
}