
import { Keyring } from '@polkadot/keyring';
import { ParaChainNetworkConfigs } from './parachain.config';
export class ChainUtils {

    public static ss58transform_simple(
        account: string,
        network: string
    ): string {
        let accounts = ChainUtils.ss58transform(account, [network]);
        if (accounts) {
            for (const a of accounts) {
                if (a.key != 'Public Key') {
                    return a.value;
                }
            }
        }
        return '';
    }
    public static ss58transform_publickey(
        account: string
    ): string {
        let accounts = ChainUtils.ss58transform(account, []);
        if (accounts) {
            for (const a of accounts) {
                if (a.key == 'Public Key') {
                    return a.value;
                }
            }
        }
        return '';
    }
    public static ss58transform(
        account: string,
        networks: string[] = [],
        filter_no_symbol: boolean = true,
    ): any[] {
        let keys = [];
        try {
            const keyring = new Keyring();
            const pair = keyring.addFromAddress(account);

            let publicKeys = keyring.getPublicKeys();

            if (publicKeys) {
                let publicKeysStr = '0x';
                publicKeysStr += this.Uint8ArrayToHexString(publicKeys[0]);
                // console.log('Public Key', publicKeys);
                keys.push({ key: 'Public Key', value: publicKeysStr });
            }

            if (ParaChainNetworkConfigs) {
                ParaChainNetworkConfigs.forEach((c) => {
                    if (networks && networks.length > 0) {
                        if (
                            networks.findIndex((v, index, obj) => {
                                return c.network.toLowerCase() === v.toLowerCase();
                            }) == -1
                        ) {
                            return;
                        }
                    }

                    if (filter_no_symbol === true) {
                        if (!c.symbols || c.symbols.length == 0) {
                            return;
                        }
                    }

                    keyring.setSS58Format(c.prefix);

                    let key = {
                        value: pair.address,
                        ...c,
                    };
                    keys.push(key);
                });
            }
        } catch (error) {
            keys.push({ error: true, msg: error });
        }

        return keys;
    }

    public static Uint8ArrayToHexString(d: Uint8Array) {
        let s = '';
        // console.log(d);
        d.forEach((p) => {
            // console.log(p);
            let v = parseInt(p.toString());
            let hexV = v.toString(16);
            if (hexV.length < 2) { hexV = '0' + hexV; }
            s += hexV;
        });

        return s;
    }
}