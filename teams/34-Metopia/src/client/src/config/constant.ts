
const chainMap = {
    '0x4': 'Rinkeby',
    '0x1': 'Ethereum',
    '0x3': 'Ropsten',
    '0x5': 'Goerli',
    '0x2a': 'Kovan',
    '0x89': 'Polygon',
    '0x13881': 'Mumbai',
    '0x38': 'BNB Chain',
    '0x61': 'BSC Testnet',
    '0xa86a': 'Avalanche',
    '0xfa': 'Fantom',
}
const chainRpcMap = {
    '0x1': "https://mainnet.infura.io/v3/caa2121f41a1419abae10b5f2e4aa367",
    // '0x1': 'https://mainnet.infura.io/v3/',
    '0x4': 'https://rinkeby.infura.io/v3/',
    '0x5': 'https://goerli.infura.io/v3/',
    '0x38': 'https://bscrpc.com', // 56
    '0x89': 'https://polygon-rpc.com/'
}

const chainExplorerMap = {
    '0x1': 'https://etherscan.io/address/',
    '0x4': 'https://rinkeby.etherscan.io/address/',
    '0x5': 'https://goerli.etherscan.io/address/',
    '0x89': 'https://polygonscan.com/address/',
    '0x38': 'https://bscscan.com/address/', // 56
}

const currencyMap = {
    '0x1': 'ETH',
    '0x4': 'ETH',
    '0x5': 'ETH',
    '0x89': 'MATIC',
    '0x38': 'BNB', // 56
}

const aiErrors = {
    '1': 'Face is not recognized by AI', // image = None(ai server error)
    '2': 'Metadata is not tracked by Metopia',
    '3': 'Image format is not supported',
    '4': 'Face is not recognized by AI',
}

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY
const moralisApiToken = process.env.REACT_APP_MORALIS_API_TOKEN
const defaultChainId = process.env.REACT_APP_CHAIN_ID
const isDevelopment = process.env.NODE_ENV == 'development'


const fifaNations = [
    {
        short: 'ar',
        name: 'Argentina',
        flag: 'https://oss.metopia.xyz/imgs/ar Argentina.png'
    }, {
        short: 'au',
        name: 'Australia',
        flag: 'https://oss.metopia.xyz/imgs/au Australia.png'
    }, {
        short: 'be',
        name: 'Belgium',
        flag: 'https://oss.metopia.xyz/imgs/be Belgium.png'
    }, {
        short: 'br',
        name: 'Brazil',
        flag: 'https://oss.metopia.xyz/imgs/br Brazil.png'
    }, {
        short: 'ca',
        name: 'Canada',
        flag: 'https://oss.metopia.xyz/imgs/ca Canada.png'
    }, {
        short: 'ch',
        name: 'Switzerland',
        flag: 'https://oss.metopia.xyz/imgs/ch Switzerland.png'
    }, {
        short: 'cm',
        name: 'Cameroon',
        flag: 'https://oss.metopia.xyz/imgs/cm Cameroon.png'
    }, {
        short: 'cr',
        name: 'Costa Rica',
        flag: 'https://oss.metopia.xyz/imgs/cr Costa Rica.png'
    }, {
        short: 'de',
        name: 'Germany',
        flag: 'https://oss.metopia.xyz/imgs/de Germany.png'
    }, {
        short: 'dk',
        name: 'Denmark',
        flag: 'https://oss.metopia.xyz/imgs/dk Denmark.png'
    }, {
        short: 'ec',
        name: 'Ecuador',
        flag: 'https://oss.metopia.xyz/imgs/Ecuador.png'
    }, {
        short: 'es',
        name: 'Spain',
        flag: 'https://oss.metopia.xyz/imgs/es Spain.png'
    }, {
        short: 'fr',
        name: 'France',
        flag: 'https://oss.metopia.xyz/imgs/fr France.png'
    }, {
        short: 'gb-eng',
        name: 'England',
        flag: 'https://oss.metopia.xyz/imgs/gb-eng England.png'
    }, {
        short: 'gb-wls',
        name: 'Wales',
        flag: 'https://oss.metopia.xyz/imgs/gb-wls Wales.png'
    }, {
        short: 'gh',
        name: 'Ghana',
        flag: 'https://oss.metopia.xyz/imgs/gh Ghana.png'
    }, {
        short: 'hr',
        name: 'Croatia',
        flag: 'https://oss.metopia.xyz/imgs/hr Croatia.png'
    }, {
        short: 'ir',
        name: 'Iran',
        flag: 'https://oss.metopia.xyz/imgs/ir Iran.png'
    }, {
        short: 'jp',
        name: 'Japan',
        flag: 'https://oss.metopia.xyz/imgs/jp Japan.png'
    }, {
        short: 'kr',
        name: 'South Korea',
        flag: 'https://oss.metopia.xyz/imgs/kr South Korea.png'
    }, {
        short: 'ma',
        name: 'Morocco',
        flag: 'https://oss.metopia.xyz/imgs/ma Morocco.png'
    }, {
        short: 'mx',
        name: 'Mexico',
        flag: 'https://oss.metopia.xyz/imgs/mx Mexico.png'
    }, {
        short: 'nt',
        name: 'Netherlands',
        flag: 'https://oss.metopia.xyz/imgs/Netherlands.png'
    }, {
        short: 'pl',
        name: 'Poland',
        flag: 'https://oss.metopia.xyz/imgs/pl Poland.png'
    }, {
        short: 'pt',
        name: 'Portugal',
        flag: 'https://oss.metopia.xyz/imgs/pt Portugal.png'
    }, {
        short: 'qa',
        name: 'Qatar',
        flag: 'https://oss.metopia.xyz/imgs/qa Qatar.png'
    }, {
        short: 'rs',
        name: 'Serbia',
        flag: 'https://oss.metopia.xyz/imgs/rs Serbia.png'
    }, {
        short: 'sa',
        name: 'Saudi Arabia',
        flag: 'https://oss.metopia.xyz/imgs/sa Saudi Arabia.png'
    }, {
        short: 'se',
        name: 'Senegal',
        flag: 'https://oss.metopia.xyz/imgs/Senegal.png'
    }, {
        short: 'tn',
        name: 'Tunisia',
        flag: 'https://oss.metopia.xyz/imgs/tn Tunisia.png'
    }, {
        short: 'us',
        name: 'United States of America',
        flag: 'https://oss.metopia.xyz/imgs/us United States of America usa.png'
    }, {
        short: 'uy',
        name: 'Uruguay',
        flag: 'https://oss.metopia.xyz/imgs/uy Uruguay.png'
    }
]

export {
    fifaNations, currencyMap, chainMap, chainExplorerMap, aiErrors, pinataApiKey, pinataSecretApiKey, moralisApiToken,
    defaultChainId as chainId2, defaultChainId, chainRpcMap, isDevelopment
}
