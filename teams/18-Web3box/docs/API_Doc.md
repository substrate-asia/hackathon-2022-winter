# Risk Procotol API

**Version:1.0**

# Query project risk rating details

**Description：**
Use the get request to get the detailed content of the project risk control

**Request URL:**
http://api.web3box.cc:9001/byid

**Request method：**

- GET

**Request params：**


| Key  | Required | Type   | Introduce    | Vaule |
| ------ | ---------- | -------- | -------------- | ------- |
| name | YES      | string | Project Name | Acala |

Vaule list:


| Vaule      |
| ------------ |
| Acala      |
| Astar      |
| Centrifuge |
| Darwinia   |
| Efinity    |
| KILT       |
| Kylin      |
| Litentry   |
| Moonbeam   |
| Phala      |

**Example**

```
curl -H "Content-Type:application/json" http://api.web3box.cc:9001/byid?name=Acala
```

**Reponse params：**


| Key                          | Type   | Introduce                                              |
| ------------------------------ | -------- | -------------------------------------------------------- |
| brief                        | string | Project Description                                    |
| score                        | number | Project rating                                         |
| wallet_distribution          | string | Percentage of Top20 Holders                            |
| whale_anomalie_activities    | string | Changes of Whale Wallets                               |
| locked_period                | string | Unlocking Token                                        |
| operation_duration           | string | Operating Duration                                     |
| decentralized_transaction    | string | Percentage of DEX Transactions                         |
| twitter_followers_growthrate | string | Growth Rate of Twitter Followers                       |
| address_growthrate           | string | Growth Rate of Addresses                               |
| week_transaction_growthrate  | string | Growth Rate of 7-Day Moving Average Trading Volume     |
| github_update                | string | Github Update                                          |
| code_review_report           | string | Audit Report                                           |
| token_voltality_overDot      | string | 7-Day Moving Volatility of Token Price Relative to DOT |
| kol_comments                 | string | KOL Comments                                           |

**Example**

```
{
    "brief":"Acala is the all-in-one DeFi hub of Polkadot. Acala is an Ethereum-compatible platform
for financial applications to use smart contracts or built-in protocols with out-of-the-box cross-
chain capabilities and robust security. The platform also offers a suite of financial applications
including: a trustless staking derivative (liquid DOT), a multi-collateralized stablecoin backed by
cross-chain assets (aUSD), and an AMM DEX – all with micro gas fees that can be paid in any token.",
    "score":3.5,
    "wallet_distribution":"middle",
    "whale_anomalie_activities":"middle",
    "locked_period":"low",
    "operation_duration":"low",
    "decentralized_transaction":"low",
    "twitter_followers_growthrate":"middle",
    "address_growthrate":"low",
    "week_transaction_growthrate":"low",
    "github_update":"low",
    "code_review_report":"middle",
    "token_voltality_overDot":"middle",
    "kol_comments":"low"
}
```
