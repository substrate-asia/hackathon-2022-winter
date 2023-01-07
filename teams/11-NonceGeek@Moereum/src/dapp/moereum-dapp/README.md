## Start Command

**Move Demo Test Command**
```bash
./moeth deploy nft_data --account 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY --gas 300 --url "ws://127.0.0.1:9946"

./moeth call '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY::NFTDatas::save_nft_data' --account alice --gas 400 --url ws://192.168.110.137:9946 --args 0 5 3

./moeth view "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY::NFTDatas::NFTData" --api "http://127.0.0.1:8899"   
```

