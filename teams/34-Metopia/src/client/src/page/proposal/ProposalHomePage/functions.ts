
import { JsonRpcSigner } from "@ethersproject/providers";
import { Signer } from "ethers";
import { domain, multiChoiceVoteTypes, singleChoiceVoteTypes } from "../../../config/snapshotConfig";
import { snapshotApi } from "../../../config/urls";

/**
 * import { Web3Provider } from "@ethersproject/providers";
 * import { Wallet } from "ethers";
 * Web3Provider | Wallet
 */
// const signTypedData = async (web3, address: string, message, types) => {
//     // @ts-ignore
//     const signer = web3?.getSigner ? web3.getSigner() : web3;
//     if (!message.from) message.from = address;
//     if (!message.timestamp)
//         message.timestamp = parseInt((Date.now() / 1e3).toFixed());
//     const data: any = { domain, types, message };
//     const sig = await signer._signTypedData(domain, data.types, message);
//     return { address, sig, data }
// }

export const vote = (address, params: { space, proposal, choice, metadata, from, timestamp },
    wallet, multi?: boolean) => {
    // if (!params.from) params.from = address;
    // if (!params.timestamp)
    //     params.timestamp = parseInt((Date.now() / 1e3).toFixed());

    const data: any = {
        domain,
        types: multi ? multiChoiceVoteTypes : singleChoiceVoteTypes,
        params
    };
    // message, types, domain
    return new Promise((acc, rej) => {
        // signTypedData(params, multi ? multiChoiceVoteTypes : singleChoiceVoteTypes,
        //     domain, signer).then((res) => {
        //         // signTypedData(data, signer, address, params, multi ? multiChoiceVoteTypes : singleChoiceVoteTypes).then((res) => {
        //         fetch(snapshotApi.msg, {
        //             method: "POST",
        //             body: JSON.stringify(res),
        //             headers: {
        //                 "content-type": "application/json",
        //                 "Accept": "application/json"
        //             }
        //         }).then(r => r.json()).then((r) => {
        //             if (r.error) { rej(r) }
        //             else { acc(r) }
        //         }).catch(e => {
        //             rej(e)
        //         })
        //     }).catch(e => {
        //         rej(e)
        //     })
    })
}