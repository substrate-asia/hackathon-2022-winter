const Web3 = require('web3');
const BN = require('bn.js');
const fs = require('fs');
const ethereum = require('./ethereum');
const { program } = require('commander');
const config = require('config');
const utils = require('./utils');
const eccrypto = require('eccrypto');
const keccak256 = require('keccak256');
const secp256k1 = require('secp256k1');

const TOKEN_ID = 'Skywalker';

const TRANSFER_FROM = 0;
const TRANSFER = 1;
const APPROVE = 2;
const MINT = 3;

let web3;
let netConfig;
let chainId;
let omniverseProtocolContract;
let skywalkerFungibleContract;

// Private key
let secret = JSON.parse(fs.readFileSync('./register/.secret').toString());
let testAccountPrivateKey = secret.sks[secret.index];
let privateKeyBuffer = Buffer.from(utils.toByteArray(testAccountPrivateKey));
let publicKeyBuffer = eccrypto.getPublic(privateKeyBuffer);
let publicKey = '0x' + publicKeyBuffer.toString('hex').slice(2);
// the first account pk: 0x7bbd8873cfc30d3ddee2a7a9dcd2b5b399b85dab87c011ad4be96fe69625430e3f13947207ff4e595b43ee7f2bcd67d0b3252737286fea986787ea39bbdb6ab5
// the first account address: 0xED911Ca21fDba9dB5f3B61b014B96A9Fab665Ff9
// the second account pk: 0xfb73e1e37a4999060a9a9b1e38a12f8a7c24169caa39a2fb304dc3506dd2d797f8d7e4dcd28692ae02b7627c2aebafb443e9600e476b465da5c4dddbbc3f2782
// the second account address: 0x30ad2981E83615001fe698b6fBa1bbCb52C19Dfa

function init(chainName) {
    chainId = chainName;
    netConfig = config.get(chainName);
    if (!netConfig) {
        console.log('Config of chain (' + chainName + ') not exists');
        return false;
    }

    let omniverseProtocolAddress = netConfig.omniverseProtocolAddress;
    // Load contract abi, and init contract object
    const omniverseProtocolRawData = fs.readFileSync('./build/contracts/OmniverseProtocol.json');
    const omniverProtocolAbi = JSON.parse(omniverseProtocolRawData).abi;
    
    let skywalkerFungibleAddress = netConfig.skywalkerFungibleAddress;
    // Load contract abi, and init contract object
    const skywalkerFungibleRawData = fs.readFileSync('./build/contracts/SkywalkerFungible.json');
    const skywalkerFungibleAbi = JSON.parse(skywalkerFungibleRawData).abi;

    web3 = new Web3(netConfig.nodeAddress);
    web3.eth.handleRevert = true;
    omniverseProtocolContract = new web3.eth.Contract(omniverProtocolAbi, omniverseProtocolAddress);
    skywalkerFungibleContract = new web3.eth.Contract(skywalkerFungibleAbi, skywalkerFungibleAddress);

    return true;
}

let signData = (hash, sk) => {
    let signature = secp256k1.ecdsaSign(Uint8Array.from(hash), Uint8Array.from(sk));
    return '0x' + Buffer.from(signature.signature).toString('hex') + (signature.recid == 0 ? '1b' : '1c');
}

let getRawData = (txData) => {
    let bData = Buffer.concat([Buffer.from(new BN(txData.nonce).toString('hex').padStart(32, '0'), 'hex'), Buffer.from(txData.chainId),
        Buffer.from(txData.from.slice(2), 'hex'), Buffer.from(txData.to), Buffer.from(txData.data.slice(2), 'hex')]);
    return bData;
}

async function initialize(members) {
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'setOmniverseProtocolAddress',
        testAccountPrivateKey, [netConfig.omniverseProtocolAddress]);
    await ethereum.sendTransaction(web3, netConfig.chainId, omniverseProtocolContract, 'setCooingDownTime',
        testAccountPrivateKey, [netConfig.coolingDown]);
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'addMembers', testAccountPrivateKey, [members]);
}

async function mint(to, amount) {
    let nonce = await ethereum.contractCall(omniverseProtocolContract, 'getTransactionCount', [publicKey]);
    let transferData = web3.eth.abi.encodeParameters(['bytes', 'uint256'], [to, amount]);
    let txData = {
        nonce: nonce,
        chainId: chainId,
        from: publicKey,
        to: TOKEN_ID,
        data: web3.eth.abi.encodeParameters(['uint8', 'bytes'], [MINT, transferData]),
    };
    let bData = getRawData(txData);
    let hash = keccak256(bData);
    txData.signature = signData(hash, privateKeyBuffer);
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'omniverseTransfer', testAccountPrivateKey, [txData]);
}

async function transfer(to, amount) {
    let nonce = await ethereum.contractCall(omniverseProtocolContract, 'getTransactionCount', [publicKey]);
    let transferData = web3.eth.abi.encodeParameters(['bytes', 'uint256'], [to, amount]);
    let txData = {
        nonce: nonce,
        chainId: chainId,
        from: publicKey,
        to: TOKEN_ID,
        data: web3.eth.abi.encodeParameters(['uint8', 'bytes'], [TRANSFER, transferData]),
    };
    let bData = getRawData(txData);
    let hash = keccak256(bData);
    txData.signature = signData(hash, privateKeyBuffer);
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'omniverseTransfer', testAccountPrivateKey, [txData]);
}

async function approve(to, amount) {
    let nonce = await ethereum.contractCall(omniverseProtocolContract, 'getTransactionCount', [publicKey]);
    let transferData = web3.eth.abi.encodeParameters(['bytes', 'uint256'], [to, amount]);
    let txData = {
        nonce: nonce,
        chainId: chainId,
        from: publicKey,
        to: TOKEN_ID,
        data: web3.eth.abi.encodeParameters(['uint8', 'bytes'], [APPROVE, transferData]),
    };
    let bData = getRawData(txData);
    let hash = keccak256(bData);
    txData.signature = signData(hash, privateKeyBuffer);
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'omniverseTransfer', testAccountPrivateKey, [txData]);
}

async function transferFrom(from, to, amount) {
    let nonce = await ethereum.contractCall(omniverseProtocolContract, 'getTransactionCount', [publicKey]);
    let transferData = web3.eth.abi.encodeParameters(['bytes', 'bytes', 'uint256'], [from, to, amount]);
    let txData = {
        nonce: nonce,
        chainId: chainId,
        from: publicKey,
        to: TOKEN_ID,
        data: web3.eth.abi.encodeParameters(['uint8', 'bytes'], [TRANSFER_FROM, transferData]),
    };
    let bData = getRawData(txData);
    let hash = keccak256(bData);
    txData.signature = signData(hash, privateKeyBuffer);
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'omniverseTransfer', testAccountPrivateKey, [txData]);
}

async function omniverseBalanceOf(pk) {
    let amount = await ethereum.contractCall(skywalkerFungibleContract, 'omniverseBalanceOf', [pk]);
    console.log('amount', amount);
}

async function balanceOf(address) {
    let amount = await ethereum.contractCall(skywalkerFungibleContract, 'balanceOf', [address]);
    console.log('amount', amount);
}

async function trigger() {
    await ethereum.sendTransaction(web3, netConfig.chainId, skywalkerFungibleContract, 'triggerExecution',
        testAccountPrivateKey, []);
}

async function getDelayedTx() {
    let ret = await ethereum.contractCall(skywalkerFungibleContract, 'getExecutableDelayedTx', []);
    console.log('ret', ret);
}

async function getAllowance(owner, spender) {
    let ret = await ethereum.contractCall(skywalkerFungibleContract, 'allowance', [owner, spender]);
    console.log('ret', ret);
}

(async function () {
    function list(val) {
		return val.split(',')
	}

    program
        .version('0.1.0')
        .option('-i, --initialize <chain name>,<member name>,...', 'Initialize omnioverse contracts', list)
        .option('-t, --transfer <chain name>,<pk>,<amount>', 'Transfer token', list)
        .option('-a, --approve <chain name>,<pk>,<amount>', 'Approve token', list)
        .option('-m, --mint <chain name>,<pk>,<amount>', 'Mint token', list)
        .option('-f, --transferFrom <chain name>,<fromPk>,<toPk>,<amount>', 'Transfer token from an account', list)
        .option('-p, --approval <chain name>,<address>,<address>', 'Approved token number', list)
        .option('-o, --omniBalance <chain name>,<pk>', 'Query the balance of the omniverse token', list)
        .option('-b, --balance <chain name>,<address>', 'Query the balance of the local token', list)
        .option('-tr, --trigger <chain name>', 'Trigger the execution of delayed transactions', list)
        .option('-d, --delayed <chain name>', 'Query an executable delayed transation', list)
        .option('-s, --switch <index>', 'Switch the index of private key to be used')
        .parse(process.argv);

    if (program.opts().initialize) {
        if (program.opts().initialize.length <= 1) {
            console.log('More than 1 arguments are needed');
            return;
        }
        
        if (!init(program.opts().initialize[0])) {
            return;
        }

        await initialize(program.opts().initialize.slice(1));
    }
    else if (program.opts().approve) {
        if (program.opts().approve.length != 3) {
            console.log('3 arguments are needed, but ' + program.opts().approve.length + ' provided');
            return;
        }
        
        if (!init(program.opts().approve[0])) {
            return;
        }
        await approve(program.opts().approve[1], program.opts().approve[2]);
    }
    else if (program.opts().transfer) {
        if (program.opts().transfer.length != 3) {
            console.log('3 arguments are needed, but ' + program.opts().transfer.length + ' provided');
            return;
        }
        
        if (!init(program.opts().transfer[0])) {
            return;
        }
        await transfer(program.opts().transfer[1], program.opts().transfer[2]);
    }
    else if (program.opts().transferFrom) {
        if (program.opts().transferFrom.length != 4) {
            console.log('4 arguments are needed, but ' + program.opts().transferFrom.length + ' provided');
            return;
        }
        
        if (!init(program.opts().transferFrom[0])) {
            return;
        }
        await transferFrom(program.opts().transferFrom[1], program.opts().transferFrom[2], program.opts().transferFrom[3]);
    }
    else if (program.opts().mint) {
        if (program.opts().mint.length != 3) {
            console.log('3 arguments are needed, but ' + program.opts().mint.length + ' provided');
            return;
        }
        
        if (!init(program.opts().mint[0])) {
            return;
        }
        await mint(program.opts().mint[1], program.opts().mint[2]);
    }
    else if (program.opts().omniBalance) {
        if (program.opts().omniBalance.length != 2) {
            console.log('2 arguments are needed, but ' + program.opts().omniBalance.length + ' provided');
            return;
        }
        
        if (!init(program.opts().omniBalance[0])) {
            return;
        }
        await omniverseBalanceOf(program.opts().omniBalance[1]);
    }
    else if (program.opts().balance) {
        if (program.opts().balance.length != 2) {
            console.log('2 arguments are needed, but ' + program.opts().balance.length + ' provided');
            return;
        }
        
        if (!init(program.opts().balance[0])) {
            return;
        }
        await balanceOf(program.opts().balance[1]);
    }
    else if (program.opts().trigger) {
        if (program.opts().trigger.length != 1) {
            console.log('1 arguments are needed, but ' + program.opts().trigger.length + ' provided');
            return;
        }
        
        if (!init(program.opts().trigger[0])) {
            return;
        }
        await trigger();
    }
    else if (program.opts().delayed) {
        if (program.opts().delayed.length != 1) {
            console.log('1 arguments are needed, but ' + program.opts().delayed.length + ' provided');
            return;
        }
        
        if (!init(program.opts().delayed[0])) {
            return;
        }
        await getDelayedTx();
    }
    else if (program.opts().approval) {
        if (program.opts().approval.length != 3) {
            console.log('3 arguments are needed, but ' + program.opts().approval.length + ' provided');
            return;
        }
        
        if (!init(program.opts().approval[0])) {
            return;
        }
        await getAllowance(program.opts().approval[1], program.opts().approval[2]);
    }
    else if (program.opts().switch) {
        secret.index = parseInt(program.opts().switch);
        fs.writeFileSync('./register/.secret', JSON.stringify(secret, null, '\t'));
    }
}());
