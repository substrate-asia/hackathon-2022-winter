import { web3Accounts, web3FromAddress, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { stringToHex } from "@polkadot/util";

export const connectSubstrate = async () => {
    const extensions = await web3Enable('Metopia');

    if (extensions.length === 0) {
        return;
    }
    const allAccounts = await web3Accounts();
    const account = allAccounts[0];
    return account
}

export const signSubstrate = async (msg) => {
    const allAccounts = await web3Accounts();

    // `account` is of type InjectedAccountWithMeta 
    // We arbitrarily select the first account returned from the above snippet
    const account = allAccounts[0];

    const injector = await web3FromSource(account.meta.source);

    // this injector object has a signer and a signRaw method
    // to be able to sign raw bytes
    const signRaw = injector?.signer?.signRaw;

    if (!!signRaw) {
        // after making sure that signRaw is defined
        // we can use it to sign our message
        const { signature } = await signRaw({
            address: account.address,
            data: stringToHex('message to sign'),
            type: 'bytes'
        });
    }
}