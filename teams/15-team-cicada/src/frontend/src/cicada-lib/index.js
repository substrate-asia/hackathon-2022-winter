
import { web3FromSource } from '@polkadot/extension-dapp'
import { assert } from '@polkadot/util'


const getFromAcct = async (currentAccount) => {
    const {
      address,
      meta: { source, isInjected },
    } = currentAccount

    if (!isInjected) {
      return [currentAccount]
    }

    const injector = await web3FromSource(source)
    return [address, { signer: injector.signer }]
}

function toUint8Arr(str) {
    if (str.slice(0,2) === '0x'){
        str = str.slice(2)
    }
    assert(str.length === 64)
    const buffer = [];
    for (var i = 0, j = str.length/2; i < j; i++) {        
        const tmp = parseInt(str.slice(i*2, i*2+2), 16)
        assert(tmp <= 0xff)
        buffer.push(tmp)
    }
    return Uint8Array.from(buffer);
}

const signedTx = async (account, api, palletRpc, callable, params, succEvent, processCallback, succCallback, failCallback, errCallback) => {
    let unsub = null
    const fromAcct = await getFromAcct(account)
    
    const txResHandler = (result) => {
        // if (result.status.isReady){
        //     processCallback({
        //         "status": "isReady"
        //     })
        // }else if (result.status.isInBlock){
        //     processCallback({
        //         "status": "isInBlock"
        //     })
        // }else 
        if (result.status.isFinalized) {
            // console.log(`😉 Finalized. Block hash: ${result.status}`)
            result.events.forEach(record => {
                const { event } = record
                const evHuman = event.toHuman()
                // console.log("evHuman:", evHuman)
                if (evHuman.method === succEvent){
                    // console.log("***tx success:", evHuman)
                    succCallback && succCallback(evHuman)
                }
                if (evHuman.method === 'ExtrinsicFailed'){
                    // console.log("***tx fail.", evHuman)
                    failCallback && failCallback(evHuman)
                }                
            })     
            unsub && unsub()
        } else {
            // console.log(`Current transaction status: ${result.status}`, result.status)
            processCallback(result)
        }
        
    }

    const txErrHandler = err => {
        // console.log(`😞 Transaction Failed: ${err}`)
        unsub && unsub()
        errCallback(err)
    }
    
    const txExecute = params
      ? api.tx[palletRpc][callable](...params)
      : api.tx[palletRpc][callable]()

    unsub = await txExecute
      .signAndSend(...fromAcct, txResHandler)
      .catch(txErrHandler)
}


export class CicadaApi {
    constructor(account, api){
        this.account = account
        this.api = api
    }

    async createCategory(name, parent, processCallback=null, succCallback=null, failCallback=null){
        const arr = toUint8Arr(parent)
        const palletRpc = 'cicadaModule'
        const callable = 'createCategory'
        const succEvent = 'CategoryCreated'
        console.log('createCategory', name,)
        await signedTx(this.account, this.api, palletRpc, callable, [name, arr], succEvent, processCallback, succCallback, failCallback)
    }

    async createLabel(name, category, processCallback=null, succCallback=null, failCallback=null) {
        const arr = toUint8Arr(category)
        const palletRpc = 'cicadaModule'
        const callable = 'createLabel'
        const succEvent = 'LabelCreated'
        await signedTx(this.account, this.api, palletRpc, callable, [name, arr], succEvent, processCallback, succCallback, failCallback)
    }
    
    async createSubject(name, category, processCallback=null, succCallback=null, failCallback=null) {
        const arr = toUint8Arr(category)
        const palletRpc = 'cicadaModule'
        const callable = 'createSubject'
        const succEvent = 'SubjectCreated'
        await signedTx(this.account, this.api, palletRpc, callable, [name, arr], succEvent, processCallback, succCallback, failCallback)
    }
    
    async createDimension(name, category, processCallback=null, succCallback=null, failCallback=null) {
        console.log('createDimension', name, category,)
        const arr = toUint8Arr(category)
        const palletRpc = 'cicadaModule'
        const callable = 'createDimension'
        const succEvent = 'DimensionCreated'
        await signedTx(this.account, this.api, palletRpc, callable, [name, arr], succEvent, processCallback, succCallback, failCallback)
    }
    
    async createContent(category, label, subject, dimension, content, processCallback=null, succCallback=null, failCallback=null){
        category = toUint8Arr(category)
        label = toUint8Arr(label)
        subject = toUint8Arr(subject)
        dimension = toUint8Arr(dimension)
        const palletRpc = 'cicadaModule'
        const callable = 'createContent'
        const succEvent = 'ContentCreated'
        const params = [category, label, subject, dimension, content]
        await signedTx(this.account, this.api, palletRpc, callable, params, succEvent, processCallback, succCallback, failCallback)
    }    

}

// export default CicadaApi