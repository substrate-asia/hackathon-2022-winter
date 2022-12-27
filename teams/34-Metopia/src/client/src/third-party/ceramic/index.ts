
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { ModelManager } from '@glazed/devtools'
import { DID } from 'dids'
import { utils } from 'ethers'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver as getKeyResolver, getResolver } from 'key-did-resolver'
import { ceramicNode } from '../../config/urls'

const ceramic = new CeramicClient(ceramicNode)
const addr = "0xF026fce6679e8C3BeA39098799F1aaaAEc534bF3"

async function authenticateWithEthereum(ethereumProvider) {
    // Request accounts from the Ethereum provider
    const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
    })
    const { EthereumAuthProvider, ThreeIdConnect } = await import('@3id/connect')
    const threeID = new ThreeIdConnect()
    // Create an EthereumAuthProvider using the Ethereum provider and requested account
    const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0])
    // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
    // generate the authentication secret
    await threeID.connect(authProvider)
    const did = new DID({
        // Get the DID provider from the 3ID Connect instance
        provider: threeID.getDidProvider(),
        resolver: {
            ...get3IDResolver(ceramic),
            ...getKeyResolver(),
        },
    })

    // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
    // authentication flow using 3ID Connect and the Ethereum provider
    await did.authenticate()
    await ceramic.setDID(did)
    // The Ceramic client can create and update streams using the authenticated DID
    // ceramic.did = did
}

// When using extensions such as MetaMask, an Ethereum provider may be injected as `window.ethereum`
async function tryAuthenticate() {
    if ((window as any).ethereum == null) {
        throw new Error('No injected Ethereum provider')
    }
    await authenticateWithEthereum((window as any).ethereum)
}

async function load(id) {
    return await TileDocument.load(ceramic, id)
}
async function createDocument(content, schema?) {
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    let doc
    if (!ceramic.did)
        return
    if (schema) {
        doc = await TileDocument.create(ceramic, content, { controllers: [ceramic.did.id], schema: schema })
    } else {
        doc = await TileDocument.create(ceramic, content)
    }
    // The stream ID of the created document can then be accessed as the `id` property
    return doc.id
}
async function updateDocument(id, content) {
    // First, we need to load the document
    const doc = await TileDocument.load(ceramic, id)
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    await doc.update(content)
}

const getAccountContract = (funcName) => {
    // TODO
    // let Contract = require('web3-eth-contract');
    let Contract = null
    const accountContract = require('../../config/abi/Registration.json');

    Contract.setProvider((window as any).ethereum);
    var contract = new Contract(accountContract.abi, addr);
    if (funcName)
        return contract.methods[funcName]
    else return contract
}

const initAccountData = async () => {
    console.log(ceramic.did)
    if (!ceramic.did)
        await tryAuthenticate()
    let accountFun = getAccountContract('account')
    let hash = await accountFun().call()
    console.log(hash)
    return hash
}

async function authenticateDID(seed) {
    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider, resolver: getResolver() })
    await did.authenticate()
    return did
}

async function loadDocumentByController(controller) {
    // did:key:z6MkpWDA3vR4SbWNYbtYXmiizdJdrJCyHxtsFLdfHwjThcFA
    return await TileDocument.deterministic(ceramic, {
        // A single controller must be provided to reference a deterministic document
        controllers: [controller],
        // A family or tag must be provided in addition to the controller
        family: 'Metopia',
        tags: ['AccountSetting']
    })
}

const message = "Authorize Metopia to use my wallet as my account indentity."
const getAccountData = async () => {
    // console.log(await signV2(message))
    try {
        const signature = null
        // const signature = await sign(message)
        let seed = utils.arrayify(signature.substring(0, 66))
        // let seed = hexToBytes(signature.substring(0, 66))
        let did = await authenticateDID(seed)
        await ceramic.setDID(did)
        // const tmp = await load(did.id)
        let pack = {
            metadata: {
                family: "Metopia",
                tags: ['AccountSetting']
            },
            content: {
                name: '???'
                // content: '1234'
            }
        }
        const manager = new ModelManager(ceramic)

        let doc = await TileDocument.deterministic(ceramic, {
            controllers: [did.id],
            family: 'Metopia',
            tags: ['AccountSetting']
        })
        return doc
    }
    catch (e) {
        console.error(e)
    }
}

// initAccountData,
export { getAccountData }

