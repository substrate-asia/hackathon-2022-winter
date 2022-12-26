import * as U from './'

class Messager {
	static sendMessageToContent(type: string, data: any) {
		const msg: U.T.IMessage<any> = { type, data }
		window.postMessage(msg, '*')
	}
}

export default Messager
