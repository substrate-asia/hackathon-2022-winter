import browser from 'webextension-polyfill'
import * as U from '../util'

class ContentScript {
  constructor() {}

  listenWebPageMessages() {
    window.addEventListener("message", async function (msg) {
      U.Messenger.sendMessageToBackground(msg.data.type, msg.data.data)
    })
  }

  init() {
    this.listenWebPageMessages()
  }
}

new ContentScript().init()