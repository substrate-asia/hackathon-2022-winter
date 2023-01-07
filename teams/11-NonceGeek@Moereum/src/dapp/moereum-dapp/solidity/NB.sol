//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NB is ERC721Enumerable{
    event MintByMove(address indexed minter, uint256 indexed tokenId,uint256 indexed level,uint256 _type);
    uint256 public counter;
    constructor() ERC721("NB","NB"){

    }

    function mint(uint256 level,uint256 _type) public{
        _mint(msg.sender,counter);
        counter++;
        emit MintByMove(msg.sender,counter,level,_type);
    }
}