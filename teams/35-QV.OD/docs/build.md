# How to build

In `Qv.od`, the `Qv.od Node` and `Qv.od Web App` will be delivered as one package, and the `Qv.od Node` will run locally in user's machine. **Currently, for MVP we still have Web App and node, in later version, we will just have one package for desktop/mobile**


## Qv.od Node

Please find the code in `src/backend`.

The better way to run `Qv.od` node is using Github Codespace, due to connection issues to CESS testnet. The following steps are the instructions for local run, but it will failed on connecting to CESS testnet in most cases.

### Install go

Requires [Go1.19](https://golang.org/dl/) or higher.
> See the [official Golang installation instructions](https://golang.org/doc/install) 

- View your go version:

```shell
go version
```

### Build

```
cd src/backend
make
```
If all goes well, you will get a program called `api_server` and `cess_cli`.

`api_server` is the program for `Qv.od Node`, the `cess_cli` is a command line tool to interact with `CESS Network`.

### Get started 🚀

```bash
cd src/backend/bin

./api_server  # Start the application at default 0.0.0.0:8080 port

# CLI params:
# ./api_server -listen-addr :8081  # Listen on 0.0.0.0:8081
# ./api_server -listen-addr 127.0.0.1:8082  # Listen on 127.0.0.1:8082
# ./api_server -rpc-url <self cess node addr>  # Replace built-in testnet endpoint to self built one
# ./api_server -tmp-dir /var/qvod_cache  # Switch cache dir to /var/qvod_cache instead of /tmp
```


**Hint** Since `Qv.od` depends on `CESS`, please follow the instructions in [the doc](https://github.com/CESSProject/cess-oss#get-started-with-oss) to prepare your wallet for CESS.


## Front End

The front end uses React + `polkadot-js`, it's able to interact `CESS Network` through the local `Qv.od` node.

Please follow the steps below to run the front-end:

### Install node

Front end uses `node 18`.

Please follow the instructions in [node doc](https://nodejs.org/en/download/package-manager) to install the correct version for your environment.

```shell
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
```

... or ...

```shell
brew install node
```

### Install packages

```shell
cd frontend
yarn
```

### Build

```shell
yarn build
```

### Get started 🚀

```shell
yarn start
```
