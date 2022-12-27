// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./project.sol";

contract Factory{
    uint256 projectNum;
    mapping(address => string) public projects;
    mapping(string => address) public repoNameAddrMap;
    address[] public allProjectAddress;

    function createContract(string memory _name) public returns(address){
        address t_address;
        GitverseRepo t= new GitverseRepo(_name, msg.sender);
        t_address = address(t);
        projects[t_address] = _name;
        repoNameAddrMap[_name] = t_address;
        projectNum++;
        allProjectAddress.push(t_address);
        return t_address;
    }

    function getAddress(string memory _name) public view returns(address){
        return repoNameAddrMap[_name];
    }

}
