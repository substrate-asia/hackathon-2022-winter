import { ParachainNetwork } from "src/common/chain/chain-network";

export const parachainNetworks: Array<ParachainNetwork> = [
  {
    info: {
      id: "litentry-rococo",
      decimals: [12],
      displayName: "Litentry Rococo Network",
      network: "Litentry-rococo",
      prefix: 131,
      standardAccount: "*25519",
      symbols: ["LIT"],
      website: "https://litentry.com/",
      wssEndpoints: ["wss://rpc.rococo-parachain-sg.litentry.io"],
    },
    defaultValues: {
      minBond: 50,
      collatorSafeStateThreshold: 0.9,
    },
    dbConfig: {
      type: "postgres",

      host: "16.163.5.216",
      password: "Dev123!@#",
      synchronize: false,
      logging: false,
      port: 5432,
      username: "postgres",
      database: "dev-litentry-staking",
    },
  },
  {
    info: {
      id: "litentry",
      decimals: [12],
      displayName: "Litentry Network",
      network: "litentry",
      prefix: 31,
      standardAccount: "*25519",
      symbols: ["LIT"],
      website: "https://litentry.com/",
      wssEndpoints: [
        "wss://litentry-rpc.dwellir.com",
        "wss://rpc.litentry-parachain.litentry.io",
      ],
    },
    defaultValues: {
      minBond: 50,
      collatorSafeStateThreshold: 0.9,
    },
    dbConfig: {
      type: "postgres",
      host: "16.163.5.216",
      port: 5432,
      username: "postgres",
      password: "Dev123!@#",
      synchronize: false,
      logging: false,
      database: "dev-litentry-mainnet-staking",
    },
  },

  {
    info: {
      id: "bifrost",
      decimals: [12],
      displayName: "Bifrost",
      network: "bifrost",
      prefix: 6,
      standardAccount: "*25519",
      symbols: ["BNC"],
      website: "https://bifrost.finance/",
      wssEndpoints: ["wss://bifrost-rpc.liebi.com/ws"],
    },
    defaultValues: {
      minBond: 50,
      collatorSafeStateThreshold: 0.9,
    },
    dbConfig: {
      type: "postgres",
      host: "16.163.5.216",
      port: 5432,
      username: "postgres",
      password: "Dev123!@#",
      synchronize: false,
      logging: false,
      database: "dev-bifrost-staking",
    },
  },
];
