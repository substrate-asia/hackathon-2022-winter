# How to build Designer

All the parts of Designer are divided into three main parts. `Gear Smart-Contract`, `CESS Storage` and `Front-End`. This document describes how to setup this product step by step.

## Gear Smart Contract

### ⚙️ Install Rust

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### ⚒️ Add specific toolchains

```shell
rustup toolchain add nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
```

... or ...

```shell
make init
```

### 🏗️ Build

```shell
cargo build --release
```

... or ...

```shell
make build
```

### ✅ Run tests

```shell
cargo test --release
```

... or ...

```shell
make test
```

### 🚀 Run everything with one command

```shell
make all
```

... or just ...

```shell
make
```

### Deploy to Gear Network

Open `https://idea.gear-tech.io/programs?node=wss%3A%2F%2Fnode-workshop.gear.rs` and connect to the workshop nodes, as workshop nodes are the stable nodes.

- Get the test token from faucet
- Upload Code
- Upload program
- Init program and save the `program id` for front-end

More details about how to deploy smart contracts on Gear please refer `https://wiki.gear-tech.io/docs/developing-contracts/deploy`

## Customized CESS component

To complete the project, we modified the CESS component to meet our requirements, and fixed some bugs there. The following steps are the steps to build and run the customized component.

### ⚒️ Install go

Requires [Go1.19](https://golang.org/dl/) or higher.
> See the [official Golang installation instructions](https://golang.org/doc/install) 

- View your go version:

```shell
go version
```

###  🏗️ Build

```
cd srv/
go build -o oss cmd/main.go
```
If all goes well, you will get a program called `oss`.


### 🚀 Get started with oss

#### Register a polka wallet

Browser access: [App](https://testnet-rpc.cess.cloud/explorer) implemented by [CESS Explorer](https://github.com/CESSProject/cess-explorer), and [add an account](https://github.com/CESSProject/W3F-illustration/blob/main/gateway/createAccount.PNG).

#### Recharge your polka wallet

If you are using the test network, please get the test token from faucet.

#### Prepare configuration file

Use `oss` to generate configuration file templates directly in the current directory:
```shell
sudo chmod +x oss
./oss profile
```
The content of the configuration file template is as follows. You need to fill in your own information into the file. By default, the `oss` uses conf.toml in the current directory as the runtime configuration file. You can use `-c` or `--config` to specify the configuration file Location.

```toml
# The rpc address of the chain node
RpcAddr     = ""
# The IP address of the machine's public network used by the scheduler program
ServiceAddr = ""
# Port number monitored by the scheduler program
ServicePort = ""
# Data storage directory
DataDir     = ""
# Phrase or seed of wallet account
AccountSeed = ""
```
The testnet rpc addresses as follows:  
`wss://testnet-rpc0.cess.cloud/ws/`  
`wss://testnet-rpc1.cess.cloud/ws/`  

#### Start the oss service

```shell
sudo nohup ./oss run 2>&1 &
```

## Front End

The front end uses React, with the help of `gear-js` and `polkadot-js`, it's able to interact with `Gear Network` and `CESS Network` at the same time.

Please follow the steps below to run the front-end:


### ⚙️ Install correct node version

Front end uses `node 18`.

```shell
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
```

... or ...

```shell
brew install node
```

### ⚒️ Install specific dependency

```shell
cd frontend
yarn
```

### ⚒️ Modify configuration

Rename the `.env.example` to `.env` in the `frontend` folder.

### 🏗️ Build

```shell
yarn build
```

### 🚀 Run

```shell
yarn start
```
