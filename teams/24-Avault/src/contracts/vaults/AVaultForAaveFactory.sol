// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

import "./AVaultForAave.sol";

contract AVaultForAaveFactory is Ownable{
    mapping(address=>address) public tokenToVault;

    address public immutable WETH;
    address public immutable addressesProvider;
    address public immutable incentiveController;

    address public buybackHolder;

    event NewVault(address _token, address _address);

    constructor(address _weth, address _addressesProvider, address _incentiveController){
        WETH = _weth;
        addressesProvider = _addressesProvider;
        incentiveController = _incentiveController;
    }

    function createAVault(address _token, string memory _tokenName, string memory _tokenSymbol) external onlyOwner{
        require(tokenToVault[_token] == address(0), "already created");
        address[] memory _addres = new address[](5);
        _addres[0] = WETH;
        _addres[1] = _token;
        _addres[2] = buybackHolder == address(0) ? msg.sender : buybackHolder;
        _addres[3] = addressesProvider;
        _addres[4] = incentiveController;
        address _vault = address(new AVaultForAave(_addres, _tokenName, _tokenSymbol));
        tokenToVault[_token] = _vault;
        emit NewVault(_token, _vault);
    }

    function setBuybackHolder(address _addr) external onlyOwner{
        buybackHolder = _addr;
    }
}