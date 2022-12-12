/* eslint-disable jest/valid-title */
const { assert } = require('@polkadot/util');
const { async } = require('rxjs');
const { initWallet,postWallet } = require('./walletManager');

const json = '{"encoded":"cOA/2X8ZcEI5d6/OMp5SJscZZwF30k0W7Lbh+00i94kAgAAAAQAAAAgAAACLwH9TeAzVvvjX9iWwuV4jTEwV2FBCQVLM4KooBPsHYSXpOhf87CDMhio+n4HxCA9ZGD88e8zngnb2KsHm8DK4PQfzpUslN4xnU06BshGSxFh+RxaiTgqIi2Vucn91j5aTH+QLdSS9fS73gBge6ccfpP72W7RMDShDuFBWNL4PeO6WkD6l2APDoKKyboRZg+kt2Kb8zHMroTGg8ser","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"address":"5CSMqmBPNBdAHGmL6XCEH2VTJ8mWNfKJePzoXL3oypbb3kAk","meta":{"genesisHash":null,"isHidden":false,"name":"测试账户","whenCreated":1661235707935}}';
// const address = '5Gb9AfeJnhedZN4H6xVEEixLmSatLmpZaacPLVMesZuRZxgr';//'5CSMqmBPNBdAHGmL6XCEH2VTJ8mWNfKJePzoXL3oypbb3kAk'

const rpc = "wss://rococo-rpc.polkadot.io";
const address = "5G9nJdAhNVncmmydKBkq7N7SZ2ZsPNr2hz86a5XxUqxKKnrU";
const seed =  "penalty casual garment mosquito panic blind kangaroo feel tobacco meadow crime return"
const oldpasswd = '123456';
const newPasswd = '123456';
const genesisHash = '0x7e4e32d0feafd4f9c9414b0be86373f9a1efa904809b683453a9af6856d38ad5';
const name = "test_account"
const defaul = 1000000000000;

describe(' polkadot wallet manager ',()=>{

      beforeAll( async() => {
        await initWallet(1);
        await postWallet(1,'pol.seedCreateAddress',seed);
      });

      test(' create wallat address and set passwd ',async() => {
        const data =  {
          genesisHash,
          name,
          seed,
          address,
          oldpasswd,
        };
        await postWallet(1,'pol.saveAccountsCreate',data);
      }) 

      test(' validate account password ',async() => {
        const ps3 = {
          address:address,
          newPass:oldpasswd,
        }
        await postWallet(1,'pol.accountsValidate',ps3)
      })

      test(' account address format ',async() => {
        let prefix = 105;
        const data =  {
            address,prefix,
        };
        await postWallet(1,'pol.formatAddressByChain',data);
      })

      test(' export account ',async() => {
            const ps2 = {
              address:address,
              newPass:oldpasswd
            }
            await postWallet(1,'pol.accountsExport',ps2);
      }) 

      test(' import account ',async() => {
          let ps4 = {
            json:JSON.parse(json),
            newPass:oldpasswd
          }
          await postWallet(1,'pol.jsonRestore',ps4);
      })
} )


describe(' account transaction ',()=>{

  beforeAll( async() => {
    jest.setTimeout(120000);
  });

  test(' Account balance inquiry ',async() => {
    let data = {
      address:address,
      chain:rpc
    }
    let { data: { free: previousFree }, nonce: previousNonce } = await postWallet(1,'pol.balance',data);
  }) 

  test(' Account transfer token', async() => {
    const to = '5G9nJdAhNVncmmydKBkq7N7SZ2ZsPNr2hz86a5XxUqxKKnrU';
    const money = 1 * defaul ;
    let data = {
      from:address,
      to:to,
      passwd:oldpasswd,
      balance:money,
      chain:rpc
    }
    //await postWallet(1,'pol.transfer',data);
  }) 

} )


describe(' nft transaction ',()=>{

  beforeAll( async() => {
 
  });

  test(' Account nft inquiry ',async() => {
    let ps4 = {
      address:'EJJuXJGycFmy6e7ePJVEU57hmLAgiB1y5RFfguo61fgTU9A'
    }
    await postWallet(1,'pol.nftByAddress',ps4);
  }) 

} )
