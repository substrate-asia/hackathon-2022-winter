import nacl from 'tweetnacl'
import { u8arryToHex, hexTou8array, b64uDec, b64uEnc } from './helper'
import { ParseKeyNonce, SendPwdServerPubKey } from '@/config'

export async function createKeypair() {
    return new Promise((resolve) => {
        const pair = nacl.box.keyPair()
        resolve({ publicKey: u8arryToHex(pair.publicKey), privateKey: u8arryToHex(pair.secretKey) })
    })
}

export function box(data, publicKey, secretKey) {
    data = hexTou8array(data)
    publicKey = hexTou8array(publicKey)
    secretKey = hexTou8array(secretKey)
    const res = nacl.box(data, hexTou8array(ParseKeyNonce), publicKey, secretKey)
    return u8arryToHex(res)
}

export function openBox(box, mySecretKey) {
    box = hexTou8array(box)
    const nonce = hexTou8array(ParseKeyNonce)
    const theirPubKey = hexTou8array(SendPwdServerPubKey)
    mySecretKey = hexTou8array(mySecretKey)
    const res = nacl.box.open(box, nonce, theirPubKey, mySecretKey)
    return u8arryToHex(res)
}

export function test() {
    const data = 'c74f2b721c92a076ccf4593235d9557ab9ece73e3d62ab682131b51a40cdd00d'

    const pair1 = createKeypair()
    const pair2 = createKeypair()

    const privateKey1 = b64uEnc(pair1.privateKey)
    const privateKey2 = b64uEnc(pair2.privateKey)

    const res = box(data, pair1.publicKey, b64uDec(privateKey2))
    const res2 = openBox(res, ParseKeyNonce, pair2.publicKey, b64uDec(privateKey1))
}