# Generate secret phrase

How to install subkey
https://docs.substrate.io/reference/command-line-tools/subkey/

``
./target/release/subkey generate --scheme sr25519  
``

The test purpose keys
```
./target/release/subkey generate --scheme sr25519 

Secret phrase:       hawk palm spy pencil verb book trade source anxiety thrive unhappy tobacco
  Network ID:        substrate
  Secret seed:       0xdeb867430b930c971a864b513d17b17c0ac442836c7d5179c6cfd6cbba3bf933
  Public key (hex):  0xe6b019692185ee3fb71e2f8bc8546f53d48c3286ec9445c7b9afbad5adad895c
  Account ID:        0xe6b019692185ee3fb71e2f8bc8546f53d48c3286ec9445c7b9afbad5adad895c
  Public key (SS58): 5HHBBa2r2USUWQDkZRRWiRhsTxCXwe39qpuCeq9oeqbw5qcR
  SS58 Address:      5HHBBa2r2USUWQDkZRRWiRhsTxCXwe39qpuCeq9oeqbw5qcR
  
  
  
  
./target/release/subkey inspect --scheme ed25519 "hawk palm spy pencil verb book trade source anxiety thrive unhappy tobacco"
Secret phrase:       hawk palm spy pencil verb book trade source anxiety thrive unhappy tobacco
  Network ID:        substrate
  Secret seed:       0xdeb867430b930c971a864b513d17b17c0ac442836c7d5179c6cfd6cbba3bf933
  Public key (hex):  0xd2785b1ea845a1517b47a7ffa2df7ce628e666b40c248e9c96000fc945e1728d
  Account ID:        0xd2785b1ea845a1517b47a7ffa2df7ce628e666b40c248e9c96000fc945e1728d
  Public key (SS58): 5Gpffb7XNpNXoxaQwzVyzhCt2yeKvrhxohpQgxUk7XxHYXsX
  SS58 Address:      5Gpffb7XNpNXoxaQwzVyzhCt2yeKvrhxohpQgxUk7XxHYXsX

```
  
  
# Fetch the code
```
git clone https://github.com/CESSProject/cess.git
cd cess
```

# Build the node (The first build will be long (~30min))
```
cargo build --release
```


# Run testnet 
## start
```
./target/release/cess-node --base-path /tmp/cess --chain cess-testnet
```

## Add account

```
# create key file
vim secretKey.txt

# add secret phrase for the node in the file
YOUR ACCOUNT'S SECRET PHRASE
```

```
# add key to node
./target/release/cess-node key insert --base-path /tmp/cess --chain cess-testnet --scheme Sr25519  --key-type babe --suri ./secretKey.txt

./target/release/cess-node key insert --base-path /tmp/cess --chain cess-testnet --scheme Ed25519  --key-type gran --suri ./secretKey.txt
```
