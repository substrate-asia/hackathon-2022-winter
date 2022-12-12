/* eslint-disable no-unused-vars */
const TypeRegistry = require('@polkadot/types');
// const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const  _uiKeyring  = require('@polkadot/ui-keyring').default;
const  _crypto = require('@polkadot/util-crypto');
const { assert, isHex } = require('@polkadot/util');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract'); 
const { HttpProvider } = require('@polkadot/rpc-provider');
const { formatBalance, nextTick } = require('@polkadot/util');
const {ethers,utils} = require("ethers")
const sha3 = require("js-sha3");

const axios = require('axios').default;
const {
  ScProvider,
  WellKnownChain,
} = require("@polkadot/rpc-provider/substrate-connect");
const { async } = require('rxjs');
const _type = "sr25519";
const SEED_DEFAULT_LENGTH = 12;
const ETH_DERIVE_DEFAULT = "/m/44'/60'/0'/0/0";
let provider,polkadotApi;

// // Construct
// const wsProvider = new WsProvider('wss://rpc.polkadot.io');
// const api = await ApiPromise.create({ provider: wsProvider });
// const contract = new ContractPromise(api, metadata, address);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////       account manager        //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getSuri (seed, type) {
   var s = (type === 'ethereum'
     ? `${seed}${ETH_DERIVE_DEFAULT}`
     : seed);
   return s;
 }

// init crypto
async function cryptoWaitReady(){
   await _crypto.cryptoWaitReady();
   _uiKeyring.loadAll({type: 'sr25519' });
}

// Randomly generated mnemonic
function mnemonicGenerate(){
   const seed = _crypto.mnemonicGenerate(SEED_DEFAULT_LENGTH);
  
   return seed;
} 
// Create address
function seedCreateAddress(data){
  let {
    mnemonic
  } = data; 
   var seed = mnemonicGenerate() ;
   if( typeof mnemonic !== 'undefined'){
      seed = mnemonic;
   }
   let address,ethaddress;
   ethaddress =  _uiKeyring.createFromUri(getSuri( seed, 'ethereum'), {}, 'ethereum').address;
   address =  _uiKeyring.createFromUri(getSuri( seed,_type), {},_type).address;
   return {
      address,
      ethaddress,
      seed
   };
}
//update genesisHash
//Use when selecting a different network
function updateAccountHash(data) {
  let {
    address,
    genesisHash
  } = data;
  const pair = _uiKeyring.getPair(address);
  assert(pair, 'Unable to find pair');
  _uiKeyring.saveAccountMeta(pair, { ...pair.meta,
    genesisHash
  });
  return true;
}

// different chain format addresses
// When choosing a different network, display the address
function formatAddressByChain(data){
   let { address,prefix } = data;
   const publicKey = _crypto.decodeAddress(address);
   const _prefix = prefix === -1 ? 42 : prefix;
   return _crypto.encodeAddress(publicKey, _prefix)
}

function formatAddressByEth(publicKey) {
  let new_key = sha3.keccak_256(publicKey)
  let result = "0x" + new_key.substring(24)
  return utils.getAddress(result);
}
// save account
function saveAccountsCreate(data) {
    let {
      genesisHash,
      name,
      seed,
      address,
      oldpasswd
    } = data;
   let r = _uiKeyring.addUri(getSuri(seed, _type), oldpasswd, {
     genesisHash,
     name
   }, _type);
   return true;
 }

// Account setup password
function accountsChangePassword(data){
   let {
      address,
      newPass,
      oldPass
    } = data;
    const pair = _uiKeyring.getPair(address);
    assert(pair, 'Unable to find pair');
    try {
      if (!pair.isLocked) {
        pair.lock();
      }
      pair.decodePkcs8(oldPass);
    } catch (error) {
      throw new Error('oldPass is invalid');
    }
    _uiKeyring.encryptAccount(pair, newPass);
    return true;
}

// Verify account address
function seedValidate (data) {
   let {
      suri,
      type
   } = data;
   const { phrase } = _crypto.keyExtractSuri(suri);

   if (_crypto.isHex(phrase)) {
     assert(_crypto.isHex(phrase, 256), 'Hex seed needs to be 256-bits');
   } else {
     assert(_crypto.mnemonicValidate(phrase), 'Not a valid mnemonic seed');
   }
   return {
     address: _uiKeyring.createFromUri(suri, {}, type).address,
     suri
   };
 }

// account validate 
 function accountsValidate (data) {
   let {
      address,
      newPass
   } = data
   try {
      _uiKeyring.backupAccount(_uiKeyring.getPair(address), newPass);
     return true;
   } catch (e) {
     return false;
   }
 }
 
 // export account to json file
 function accountsExport (data){
   let {address,newPass}  = data;
   return _uiKeyring.backupAccount(_uiKeyring.getPair(address),newPass)
 }

 // jsonstore import 
 function jsonRestore (data) {
   let {
      json,
      newPass
   } = data;
   try {
      _uiKeyring.restoreAccount(json, newPass);
      return true;
   } catch (error) {
      return false;
    //  throw new Error(error);
   }
 }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////       transfer        //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function balance(data){
  let { address,chain } = data;
  polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
  let r = await polkadotApi.query.system.account(address);
  return r;
}

// transfer 
async function transfer(data){

  let { from,passwd,to,balance,chain} = data;
  const pair = _uiKeyring.getPair(from);
  if(pair.isLocked){
    pair.unlock(passwd)
  }
  polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
  return new Promise((resolve, reject) => {
      let hash = polkadotApi.tx.balances
      .transfer(to, balance)
      .signAndSend(pair, ({ status, events, dispatchError }) => {
          if(status.isInBlock){
              // status would still be set, but in the case of error we can shortcut
              // to just check it (so an error would indicate InBlock or Finalized)
              if (dispatchError) {
                if (dispatchError.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = polkadotApi.registry.findMetaError(dispatchError.asModule);
                  const { docs, name, section } = decoded;
                  
                  console.log(`${section}.${name}: ${docs.join(' ')}`);   
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  console.log(dispatchError.toString());
                }
                resolve(0)
              }else{
                resolve(String(status.hash))
              }
          }
          
        }
      )
  }).catch(e => {
    throw new Error('trans fail');
  });;
 
}

async function transferNFT(data){
  let { from,passwd,recipient,id,version,chain} = data;
  const pair = _uiKeyring.getPair(from);
  if(pair.isLocked){
    pair.unlock(passwd)
  }
  try {
    polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
    // let nft = consolidatedNFTtoInstance(item);
    const message = 'rmrk::SEND::'+version+'::'+id+'::' + recipient;
    const txs = [
      polkadotApi.tx.system.remark(message)
    ]
    polkadotApi.tx.utility
    .batch(txs)
    .signAndSend(pair, ({ status }) => {
      return status;
    });
  } catch (error) {
    throw new Error('trans fail');
  }
 
}


async function transferFree(data){
  let { from,to,balance,chain} = data;
  polkadotApi = await ApiPromise.create({ provider:new WsProvider(chain) });
  const extrinsic = polkadotApi.tx.balances.transfer(to, balance);
  const { partialFee } = await extrinsic.paymentInfo(from);
  return formatBalance(partialFee, { withSiFull: true })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////       nft        //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function handle(type,data) {
   switch (type) {
     case 'pol.mnemonicGenerate':
       return mnemonicGenerate();
     case 'pol.seedCreateAddress':
       return seedCreateAddress(data);
     case 'pol.formatAddressByChain':
        return formatAddressByChain(data);
     case 'pol.updateAccountHash':
        return updateAccountHash(data);
     case 'pol.saveAccountsCreate':
       return saveAccountsCreate(data);
     case 'pol.accountsChangePassword':
       return accountsChangePassword(data);
     case 'pol.accountsExport':
       return accountsExport(data);
     case 'pol.jsonRestore':
       return jsonRestore(data);
     case 'pol.accountsValidate':
       return accountsValidate(data);
     case 'pol.balance':
        return balance(data);
     case 'pol.transfer':
       return await transfer(data);
      case 'pol.transferFree':
        return transferFree(data);
      case 'pol.transferNFT':
        return await transferNFT(data);
     default:
       throw new Error(`Unable to handle message of type ${type}`);
   }
 }

module.exports = {
   handle,
   cryptoWaitReady
}