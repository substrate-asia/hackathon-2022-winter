/* eslint-disable no-fallthrough */
const { handle,cryptoWaitReady } = require('./polkadot');
const { async } = require('rxjs');
const { assert, isHex } = require('@polkadot/util');

export async function initWallet(network) {
    switch(network){
     case 1:
        await cryptoWaitReady();
        break;
     default:
         throw new Error(`init wallet fail`);
    }
 }

export async function postWallet(network,type,data) {
   switch(network){
    case 1:
        return await handle(type,data);
    default:
        throw new Error(`Unable to handle message of type ${type}`);
   }
}
// module.exports = {
//     postWallet,initWallet
// }