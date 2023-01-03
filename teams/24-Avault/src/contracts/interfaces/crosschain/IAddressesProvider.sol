// SPDX-License-Identifier: GLP-v3.0

pragma solidity ^0.8.4;

interface IAddressesProvider{
    event HOPBRIDGE_SET(address indexed _token, address _bridge);

    function hopBridge(address) external returns (address);
}