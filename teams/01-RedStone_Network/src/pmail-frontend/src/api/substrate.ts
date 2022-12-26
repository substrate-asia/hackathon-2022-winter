import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { store } from '@store/index'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

const appName = import.meta.env.VITE_APP_NAME
const nodeUrl = import.meta.env.VITE_SUBSTRATE_URL
const wsProvider = new WsProvider(nodeUrl)
const api = await ApiPromise.create({ provider: wsProvider })
export function getUser(userName: string) {
  const keyring = new Keyring({ type: 'sr25519' })
  const user = keyring.addFromUri(`//${userName}`)
  return user
}

export async function getChainInfo() {
  const [chain, nodeName, nodeVersion, metadata] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
    api.rpc.state.getMetadata()
  ])
  return {
    metadata,
    chain,
    nodeName,
    nodeVersion
  }
}

export async function bindMail(name: string) {
  try {
    const User = store.getState().user
    await web3Enable(appName)
    const injector = await web3FromAddress(User.address)
    return new Promise((resolve, reject) => {
      api.tx.mail
        .bindAddress(name)
        .signAndSend(
          User.address,
          { signer: injector.signer },
          ({ events = [], status }) => {
            if (status.isFinalized) {
              resolve(true)
              events.forEach(({ phase, event: { data, method, section } }) => {
                console.log(
                  `${phase.toString()} : ${section}.${method} ${data.toString()}`
                )
              })
            }
          }
        )
        .catch((error: any) => {
          reject(error)
        })
    })
  } catch (e) {
    console.log(e)
  }
}
export async function doSetAlias(accountObj: any, alias: string) {
  const User = store.getState().user
  await web3Enable(appName)
  const injector = await web3FromAddress(User.address)

  return new Promise((resolve, reject) => {
    api.tx.mail
      .setAlias(accountObj, alias)
      .signAndSend(
        User.address,
        { signer: injector.signer },
        ({ events = [], status }) => {
          if (status.isFinalized) {
            resolve(true)
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(
                `${phase.toString()} : ${section}.${method} ${data.toString()}`
              )
            })
          }
        }
      )
      .catch((error: any) => {
        reject(error)
      })
  })
}
export async function sendMailBlock(
  MailAddress: { [key: string]: string },
  uint: number,
  vec: string
) {
  const User = store.getState().user
  await web3Enable(appName)
  const injector = await web3FromAddress(User.address)
  return new Promise((resolve, reject) => {
    api.tx.mail
      .sendMail(MailAddress, uint, vec)
      .signAndSend(
        User.address,
        { signer: injector.signer },
        ({ events = [], status }) => {
          if (status.isFinalized) {
            resolve(true)
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(
                `${phase.toString()} : ${section}.${method} ${data.toString()}`
              )
            })
          }
        }
      )
      .catch((error: any) => {
        reject(error)
      })
  })
}

export async function getMail(accountId: string) {
  const res = await api.query.mail.mailMap(accountId)
  return res.toHuman()
}
