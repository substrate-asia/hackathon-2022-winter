// SPDX-License-Identifier: GLP-v3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";


contract AddressesProvider is Ownable{
    mapping(address => address) public hopBridge; //token => L2_AmmWrapper

    event HOPBRIDGE_SET(address indexed _token, address _bridge);

    //_bridgeMapping: [token1,bridge1,token2,bridge2,...]
    // arbitrum e.g.
    // hopBridge[0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8] = 0xe22D2beDb3Eca35E6397e0C6D62857094aA26F52; //USDC
    // hopBridge[0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9] = 0xCB0a4177E0A60247C0ad18Be87f8eDfF6DD30283; //USDT
    // hopBridge[0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1] = 0xe7F40BF16AB09f4a6906Ac2CAA4094aD2dA48Cc2; //DAI
    // hopBridge[0x82aF49447D8a07e3bd95BD0d56f35241523fBab1] = 0x33ceb27b39d2Bb7D2e61F7564d3Df29344020417; //WETH
    // hopBridge[0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f] = 0xC08055b634D43F2176d721E26A3428D3b7E7DdB5; //WBTC
    constructor(address[] memory _bridgeMapping){
        uint _counter = _bridgeMapping.length / 2;
        for(uint i = 0; i < _counter; i++){
            hopBridge[_bridgeMapping[i * 2]] = _bridgeMapping[i * 2 + 1];
        }
    }

    function setHopBridge(address _token, address _bridge) external onlyOwner{
        hopBridge[_token] = _bridge;
        emit HOPBRIDGE_SET(_token, _bridge);
    }
}