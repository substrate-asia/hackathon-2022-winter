import { Keyring } from "@polkadot/keyring";
import { ParachainNetwork } from "./chain-network";
export class ChainUtils {
  public static ss58transform_simple(
    account: string,
    network: ParachainNetwork["info"]
  ): string {
    let accounts = ChainUtils.ss58transform(account, network);
    if (accounts) {
      for (const a of accounts) {
        if (a.key != "Public Key") {
          return a.value;
        }
      }
    }
    return "";
  }
  public static ss58transform_publickey(account: string): string {
    let accounts = ChainUtils.ss58transform(account, null);
    if (accounts) {
      for (const a of accounts) {
        if (a.key == "Public Key") {
          return a.value;
        }
      }
    }
    return "";
  }
  public static ss58transform(
    account: string,
    network: ParachainNetwork["info"],
    filter_no_symbol: boolean = true
  ): any[] {
    let keys = [];
    try {
      const keyring = new Keyring();
      const pair = keyring.addFromAddress(account);

      let publicKeys = keyring.getPublicKeys();

      if (publicKeys) {
        let publicKeysStr = "0x";
        publicKeysStr += this.Uint8ArrayToHexString(publicKeys[0]);
        // console.log('Public Key', publicKeys);
        keys.push({ key: "Public Key", value: publicKeysStr });
      }

      if (
        network &&
        (!filter_no_symbol ||
          (filter_no_symbol && network.symbols && network.symbols.length))
      ) {
        keyring.setSS58Format(network.prefix);

        let key = {
          value: pair.address,
          ...network,
        };
        keys.push(key);
      }
    } catch (error) {
      keys.push({ error: true, msg: error });
    }

    return keys;
  }

  public static Uint8ArrayToHexString(d: Uint8Array) {
    let s = "";
    // console.log(d);
    d.forEach((p) => {
      // console.log(p);
      let v = parseInt(p.toString());
      let hexV = v.toString(16);
      if (hexV.length < 2) {
        hexV = "0" + hexV;
      }
      s += hexV;
    });

    return s;
  }
}
