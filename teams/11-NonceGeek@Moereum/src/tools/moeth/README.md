# Moeth

Move language package manager for Diem and Moereum networks.

## Installation

**Using source code:**

Clone this repository and follow documentation:

```shell script
git clone git@github.com:noncegeek/moeth.git
cd moeth
cargo install --path ./moeth
```

##### See help:

```shell script
moeth -h
```

## Create new project:

```shell script
moeth new first_project 
```

This command will create `first_project/` directory with special `Move.toml` manifest file and `sources/` directory for Move source code. 

## Build project:

```shell script
moeth build
```
See `./build/` folder to get scripts/modules binaries.

##### Clean build directory:
```shell script
moeth clean
```
The contents of the directories will be deleted:
- `<PROJECT_DIR>/storage`
- `<PROJECT_DIR>/build`

##### Clear build directory and global cache:
```shell script
moeth clean --global
```
The contents of the directories will be deleted:
- `<PROJECT_DIR>/storage`
- `<PROJECT_DIR>/build`
- `~/.move/`

## Pallet Transactions

Command `call` allows you to create and publish transactions for Polkadot chain with Move Pallet on board.

`call` takes script identifier, type parameters, and arguments and creates a transaction file as an artifact of work.

```
moeth call [CALL] [OPTIONS]
```

### Input parameters
- `[CALL]` - Call declaration
- `-a` / `--args` Script arguments, e.g. 10 20 30
- `-t`, `--type` Script type parameters, e.g. 0x1::Dfinance::USD
- `-g` / `--gas` Limitation of gas consumption per operation. A positive integer is expected
- `-u` / `--url` The url of the substrate node to query [default: ws://localhost:9944]. HTTP, HTTPS, WS protocols are supported. It is recommended to use WS. When using HTTP or HTTPS, you cannot get the publication status.
- `--account` Account from whom to publish. Address or test account name or name wallet key. Example: //Alice, alice, bob, NAME_WALLET_KEY... or 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY. When used in combination with `--secret` is ignored.
- `-s` / `--secret` Secret phrase. If a secret phrase is specified, you do not need to specify.

Example:
```shell script
moeth call 'store_u64(60)'
```

This command searches for the script by name 'store_u64' in the script directory. Then it compiles it and creates a transaction file.

This command will fail if:

- There is no script with the name given name 'store_u64'.
- There is more than one script with the name 'store_64'.
- The passed parameters or type parameters do not match the script parameters.
- There are syntax errors in the script.

You can use type parameters like in the Move language.

Example:

```shell script
moeth call 'create_account<0x01::MOETH::MOETH>()'
```

You allow can use SS58 address format:

```shell script
moeth call 'create_account<0x1::MyToken::Token>()'
moeth call 'create_account<ADDRESS_ALIAS::MyToken::Token>()'
moeth call 'create_account(ADDRESS_ALIAS, 10, true, [10, 20, 30, 40], 0x1, SS58_ADDRESS)'
```

Supported types:

* Numbers (u8, u64, u128)
* Boolean
* Vectors
* Type parameters (generics).
* SS58 format address
* Addresses in hexadecimal format
* ADDRESS_ALIAS - Address alias. Specified in the "addresses" section of Move.toml

For more commands and parameters look at help:

```shell script
moeth call --help
```

## Resource Viewer

**Resource viewer is currently out of date and pending migration inside moeth in future versions.**

## Executor

Migrated inside Moeth, see help:

```shell script
moeth run --help
```

## Manage wallet keys

Command `key` allows you to save the secret keys to the wallet on your computer and access them under an alias.
Saved key can be used when publishing a module or bundle `$ moeth deploy <FILE_NAME> --account <NAME_KEY> ...`, 
as well as when execute a transaction `$ moeth call <CALL> --account <NAME_KEY> ...`.
Keys are stored on your computer in the `~/.move/` directory. Before saving, they are encrypted with the aes + password.

#### Adding a key:

```shell
moeth key add --alias <NAME_KEY>
```
After executing this command, you will be prompted to enter a password and a secret phrase from your wallet.

If you don't want to protect the key with a password, use the `--nopassword` flag(**Not recommended**):

```shell
moeth key add --alias <NAME_KEY> --nopassword
```

#### View list of saved keys

```shell
moeth key list
```

#### Deleting a key

Deleting a key by name:

```shell
moeth key delete --alias <NAME_KEY>
```

Deleting all saved keys:

```shell
moeth key delete --all
```

## Publishing a module or package

```bash
$ moeth deploy [FILE_NAME|PATH_TO_FILE] [OPTIONS]
```
### Input parameters
- `[FILE_NAME]` - Name of module or package to be published.
- `[PATH_TO_FILE]` - Path to the file to be published. Expected file extension:
  - `pac` bundle  
  - `mv` module
  - `mvt` transaction
- `-g` / `--gas` Limitation of gas consumption per operation. A positive integer is expected
- `-u` / `--url` The url of the substrate node to query [default: ws://localhost:9944]. HTTP, HTTPS, WS protocols are supported. It is recommended to use WS. When using HTTP or HTTPS, you cannot get the publication status.
- `--account` Account from whom to publish. Address or test account name or name wallet key. Example: //Alice, alice, bob, NAME_WALLET_KEY... or 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY. When used in combination with `--secret` is ignored.
- `-s` / `--secret` Secret phrase. If a secret phrase is specified, you do not need to specify.
- `modules_exclude` Names of modules to exclude from the package process.

### Examples:
```bash
moeth deploy
moeth deploy PACKAGE_NAME --account WALLET_KEY --gas 300
moeth deploy PACKAGE_NAME --secret --url ws://127.0.0.1:9944 --gas 400 --modules_exclude MODULE_NAME_1 MODULE_NAME_2 ..
moeth deploy MODULE_NAME --secret --url https://127.0.0.1:9933 --gas 400
moeth deploy PATH/TO/FILE --account //Alice --gas 300
```

## Resource Viewer
Move Resource Viewer is a tool to query [BCS](https://github.com/diem/bcs) resources data from blockchain nodes storage and represent them in JSON or human readable format.

1. The viewer makes a request to the blockchain node by a sending specific query (address + resource type).
2. The viewer send another request to node and query resource type layout.
3. The viewer restores resources using response data and type layout.

## Usage example

Query the user's store contract balance:

```bash
moeth view "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY::Store::Store<u64>" --api "ws://127.0.0.1:9946"
```

### Input parameters

- `[QUERY]` resource type-path, e.g.:
  - `0x1::Account::Balance<0x1::MOETH::MOETH>`
  - `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY::Store::Store<u64>`
  - In general: `0xDEADBEEF::Module::Struct< 0xBADBEEF::Mod::Struct<...>, ... >`
  - Inner address can be omitted, it's inherited by parent:
    `0xDEADBEEF::Module::Struct<Mod::Struct>` expands to `0xDEADBEEF::Module::Struct<0xDEADBEEF::Mod::Struct>`
  - Query can ends with index `[42]` for `vec`-resources
- Output options:
  - `-o` / `--output` fs-path to output file
  - `-j` / `--json` sets output format to json. Can be omitted if output file extension is `.json`, so then json format will be chosen automatically.
  - `--json-schema` additional json-schema export, fs-path to output schema file.

For more info check out `--help`.

### Output

Two output formats supported:

- Move-like text
- JSON

_The structure of the output in JSON is described in the scheme, which can be obtained by calling with the `--json-schema` parameter._

#### Move-like example:

```rust
resource 00000000::Account::Balance<00000000::Coins::BTC> {
    coin: resource 00000000::Dfinance::T<00000000::Coins::BTC> {
        value: 1000000000u128
    }
}
```

#### JSON example:

```json
{
  "is_resource": true,
  "type": {
    "address": "0000000000000000000000000000000000000001",
    "module": "Account",
    "name": "Balance",
    "type_params": [
      {
        "Struct": {
          "address": "0000000000000000000000000000000000000001",
          "module": "Coins",
          "name": "BTC",
          "type_params": []
        }
      }
    ]
  },
  "value": [
    {
      "id": "coin",
      "value": {
        "Struct": {
          "is_resource": true,
          "type": {
            "address": "0000000000000000000000000000000000000001",
            "module": "Dfinance",
            "name": "T",
            "type_params": [
              {
                "Struct": {
                  "address": "0000000000000000000000000000000000000001",
                  "module": "Coins",
                  "name": "BTC",
                  "type_params": []
                }
              }
            ]
          },
          "value": [
            {
              "id": "value",
              "value": {
                "U128": 1000000000
              }
            }
          ]
        }
      }
    }
  ]
}
```
