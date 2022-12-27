// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
import "./Enum.sol";

struct UserOperation{
        uint256 toChainId;
        address to;
        uint256 value;
        bytes data;
        address gasToken;
        uint256 gasTokenAmount;
        Enum.Operation operation;
        uint8 v;
        bytes32 r;
        bytes32 s;
}