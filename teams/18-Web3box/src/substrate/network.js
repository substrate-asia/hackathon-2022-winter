export const knownSubstrate = [
    {
      decimals: 10000000000,
      displayName: 'Polkadot Relay Chain',
      network: 'polkadot',
      prefix: 0,
      standardAccount: '*25519',
      symbols: ['DOT'],
      website: 'https://polkadot.network',
      genesis: ['0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'],
      rpc:'wss://rpc.polkadot.io',
      exdeposit:1
    },
    {
      decimals: 1000000000000,
      displayName: 'Kusama Relay Chain',
      network: 'kusama',
      prefix: 2,
      standardAccount: '*25519',
      symbols: ['KSM'],
      website: 'https://kusama.network',
      genesis: ['0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe', // Kusama CC3,
      '0xe3777fa922cafbff200cadeaea1a76bd7898ad5b89f7848999058b50e715f636', // Kusama CC2
      '0x3fd7b9eb6a00376e5be61f01abb429ffb0b104be05eaff4d458da48fcd425baf' // Kusama CC1
      ],
      rpc:'wss://kusama-rpc.dwellir.com',
      exdeposit:0.000033
    },
    {
      decimals: 1000000000000,
      displayName: 'Acala',
      network: 'acala',
      prefix: 10,
      standardAccount: '*25519',
      symbols: ['ACA'],
      website: 'https://acala.network/',
      genesis: ['0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c'],
      rpc:'wss://acala.polkawallet.io',
      exdeposit:0.001
    },
    {
      decimals: 1000000000000000000,
      displayName: 'Moonbeam',
      network: 'moonbeam',
      prefix: 1284,
      standardAccount: '*1284',
      symbols: ['GLMR'],
      website: 'https://bsx.fi',
      genesis: ['0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d'],
      rpc:'wss://moonbeam.public.blastapi.io'
    },
    {
      decimals: 1000000000000000000,
      displayName: 'Astar',
      network: 'astar',
      prefix: 5,
      standardAccount: '*1284',
      symbols: ['ASTR'],
      website: 'https://astar.network/',
      genesis: ['0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6'],
      rpc:'wss://rpc.astar.network'
    },
    // {
    //   decimals: 1000000000000,
    //   displayName: 'Rococo Test',
    //   network: 'rococo',
    //   prefix: 172,
    //   standardAccount: '*25519',
    //   symbols: ['ROC'],
    //   website: 'https://rococo.subscan.io/',
    //   genesis: [],
    //   rpc:'wss://rococo-rpc.polkadot.io',
    //   exdeposit:1
    // },
  ]