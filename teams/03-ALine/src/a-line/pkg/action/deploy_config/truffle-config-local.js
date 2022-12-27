// const HDWalletProvider = require('@truffle/hdwallet-provider');

// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
// const mnemonic = fs.readFileSync("key.secret").toString().trim();

module.exports = {
    // Uncommenting the defaults below
    // provides for an easier quick-start with Ganache.
    // You can also follow this format for other networks.
    // See details at: https://trufflesuite.com/docs/truffle/reference/configuration
    // on how to specify configuration options!
    //
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*"
        },
    },
    mocha: {
        // timeout: 100000
    },
    compilers: {
        solc: {
            version: '^0.8.0',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
};