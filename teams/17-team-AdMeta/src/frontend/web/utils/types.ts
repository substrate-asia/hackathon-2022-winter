interface TDK {
  title: string
  keywords: string
  description: string
}

interface Meta {
	genesisHash: string
	name: string
	source: string
}

interface Wallet {
	address: string
	meta: Meta
	type: string
}

interface IMessage<T> {
	type: string
	data: T
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export {
  type TDK,
  type Wallet,
  type IMessage,
  type Status,
}

