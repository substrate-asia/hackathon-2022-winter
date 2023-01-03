# Moereum

Moereum parachain node with [Move VM pallet](/pallets/sp-mvm/) on board.

- [Learn Move Contract](https://github.com/NonceGeek/Web3-dApp-Camp/blob/main/move-dapp/README.md): this our move contract docs.

## Local Relaychain & Parachain Launch

Current version built with Nimbus consensus and Parachain Staking implementation.
Requires relay chain to work correctly.

### Requirements

* [Rust](https://www.rust-lang.org/tools/install)
* [Moeth](https://github.com/NonceGeek/moeth)

### Build

**Install [polkadot-launch](https://github.com/paritytech/polkadot-launch).**

**Note:** you must have polkadot node `v0.9.18` compiled and built placed in `../polkadot/target/release/`.
To use different localion you can modify `./launch-config.json`.

```
git clone https://github.com/paritytech/polkadot
cd polkadot/
cargo build --release

git clone https://github.com/NonceGeek/Moereum
cd Moereum/
cargo build --release
```

**Run Moereum Network**

```sh
# run moereum-node
cd Moereum/
mkdir data/
cp ../polkadot/target/release/polkadot ./data/polkadot
polkadot-launch ./launch-config.json
```

Wait for an minute.

Observe `9946.log` to verify that the node was launched successfully and is producing blocks, also you can use [Web UI](https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9946#/explorer).

```sh
tail -f ./9946.log
```

