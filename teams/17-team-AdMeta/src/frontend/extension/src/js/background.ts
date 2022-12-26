import browser from 'webextension-polyfill'
import * as U from '../util'
class Background {
	private whiteList: U.Domain[] = U.WHITE_LIST.products

	constructor() {}

	listenForMessages() {
		browser.runtime.onMessage.addListener((message, sender) => {
			const { type, data } = message
			this.handleDealMessages(type, data)
		})
	}

	handleDealMessages(type: string, data: any) {
		switch (type) {
			case U.ADMETA_MSG_HACKATHON_ACCOUNT:
				this.saveInfo(data)
				break
			case U.ADMETA_MSG_HACKATHON_SOUL:
				this.saveNftInfo(data)
				break

			default:
				break
		}
	}

	saveInfo(data: any) {
		browser.storage.local.set({ address: data.address, step: 1 })
	}

	saveNftInfo(data: any) {
		browser.storage.local.set({ metadata: data.metadata, label: data.label })
	}

	private reportBroswer(tab: any) {
		if (!this.whiteList.length) {
			return
		}
		const isIn = U.Helper.isInWhiteList(this.whiteList, tab.url || '-1')
		if (isIn) {
			const idx = U.Helper.currentDomainIdx(this.whiteList, tab.url || '-1')
			const timer = setTimeout(async () => {
				clearTimeout(timer)

				console.log('report', idx, this.whiteList[idx].category)
				const categorys = this.whiteList[idx].category
				const { address } = await browser.storage.local.get(['address'])
				const r = await U.Helper.apiCall({
					method: 'GET',
					URI: `hackathon/check/${address}`
				})
				if (!r.length) {
					return
				}
				const obj: U.Params = r[0]
				categorys.forEach((item, index) => {
					obj[item] = Number(r[0][item]) + 1
				})
				const params = {
					...obj
				}
				await U.Helper.apiCall({
					method: 'POST',
					URI: `hackathon/update`,
					params
				})
			}, U.REPORTING_TIME)
		}
	}

	listenTabChange() {
		browser.tabs.onActivated.addListener(l => {
			browser.tabs
				.query({ active: true, currentWindow: true })
				.then(activeTab => {
					this.reportBroswer(activeTab[0])
				})
		})
	}

	listenTabUpdate() {
		browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
			if (changeInfo.status === 'complete') {
				this.reportBroswer(tab)
			}
		})
	}

	init() {
		this.listenForMessages()
		this.listenTabChange()
		this.listenTabUpdate()
	}
}

new Background().init()
