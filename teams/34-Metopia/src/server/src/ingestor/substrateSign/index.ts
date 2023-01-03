import { sha256 } from '../../helpers/utils';
import writer from '../../writer';
const { decodeAddress, signatureVerify } = require('@polkadot/util-crypto');
const { u8aToHex } = require('@polkadot/util');

const verifySignature = (signedMessage, signature, address) => {
    console.log('signedMessage:', signedMessage);
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
};

// async function verifySignature(
//     msg: string,
//     sig: any,
//     address: string
// ): Promise<boolean> {

//     const isValid = isValidSignature(
//         msg, // 'This is a text message',
//         sig, //'0x2aeaa98e26062cf65161c68c5cb7aa31ca050cb5bdd07abc80a475d2a2eebc7b7a9c9546fbdff971b29419ddd9982bf4148c81a49df550154e1674a6b58bac84',
//         address//'5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
//     );
//     return await isValid;
// }
// ex:
// let msg = {a: 1, b:2 };
// let msg_str = JSON.stringify(msg);
const hashMessage = (msg_str) => {
    
    let hash = Buffer.from(msg_str).toString("hex");
    return hash;
}

export default async function ingestor(body) {

    if (!body || !body.address || !body.msg || !body.sig)
        return Promise.reject('wrong message body');

    const msg = body.msg;
    const sig = body.sig;

    if (JSON.stringify(body).length > 1e5)
        return Promise.reject('too large message');

    console.log('msg::', msg);
    console.log('address:', body.address);

    const hash = sha256(JSON.stringify(msg));

console.log(hash)
    if (!(await verifySignature(JSON.stringify(msg), sig, body.address))) {
        return Promise.reject('wrong signature');
    }

    console.log('verify success.');

    try {
        let payload = {};
        let type = msg.type == 'single-choice' ? 'proposal' : msg.type;
        let id = '0x' + (hash.length > 64 ? hash.substr(0, 64) : hash);
        // if(msg.type == 'single-choice'){

        if (type === 'proposal') {
            payload = {
                name: msg.title,
                body: msg.body,
                choices: msg.choices,
                start: msg.start,
                end: msg.end,
                snapshot: msg.snapshot,
                network: msg.network,
                metadata: {
                    plugins: JSON.parse(msg.plugins),
                    network: msg.network,
                    strategies: JSON.parse(msg.strategies),
                    ...JSON.parse(msg.metadata)
                },
                type: msg.type
            };
        }


        if (type === 'delete-proposal') {
            payload = { proposal: msg.proposal };
        }

        if (['vote', 'vote-array', 'vote-string'].includes(type)) {
            let choice = msg.choice;
            if (type === 'vote-string') choice = JSON.parse(msg.choice);
            payload = {
                proposal: msg.proposal,
                choice,
                metadata: JSON.parse(msg.metadata)
            };
            type = 'vote';
        }

        let legacyBody = {
            address: body.address,
            msg: JSON.stringify({
                version: '1.0.0',
                timestamp: msg.timestamp,
                space: msg.space,
                type,
                payload
            }),
            sig: body.sig
        };

        if (
            ['follow', 'unfollow', 'alias', 'subscribe', 'unsubscribe'].includes(type)
        ) {
            legacyBody = msg;
        }

        console.log('type:', type);

        await writer[type].verify(legacyBody);
        await writer[type].action(legacyBody, '', 'receipt', id);

    } catch (e) {
        console.log('eee:', e);
        return Promise.reject(e);
    }
    return "ok";
}
