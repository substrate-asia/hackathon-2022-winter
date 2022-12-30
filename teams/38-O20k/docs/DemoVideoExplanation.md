# Description of Demo Video

## Begin:

- Get the information of the Omniverse accounts: 
    - node index.js -a
    - Balance of the accounts: 
    - node index.js -o X,<account 1>
    - node index.js -o Y,<account 1>
    - node index.js -o X,<account 2>
    - node index.js -o Y,<account 2>

## Swap: 
- Account 1 makes a swap of 100 X to Y:
    - node index.js --swapX2Y X2Y,100
    - Check the balance change on Polkadot:
    - node index.js -o X,<account 1>
    - node index.js -o Y,<account 1>
- Check the balance change on EVM chains:

## Transfer(Initiate from Polkadot):
- Account 1 transfer 100 X to account 2:
    - node index.js --transfer X,<account 2>,100
    - Check the balance on Polkadot:
    - node index.js -o X,<account 1>
    - node index.js -o X,<account 2>
- Check the balance change on EVM chains:

## Transfer(Initiate From EVM chain)
- Account 1 transfer 10000 X to account 2
