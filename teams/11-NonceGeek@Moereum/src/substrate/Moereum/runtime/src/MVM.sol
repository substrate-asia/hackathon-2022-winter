// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library MVM {
    address constant private precompile = address(0x401);

    function call_move(bytes tx_bc) public returns (bool) {
        (bool success, bytes memory returnData) = precompile.staticcall(abi.encodePacked(tx_bc));

        assembly {
            if eq(success, 0) {
                revert(add(returnData, 0x20), returndatasize())
            }
        }

        return abi.decode(returnData, (bool));

    }
}

contract CallMoveDemo {
    function call_incr(bytes tx_bc) public {
        require(MVM.call_move(tx_bc), "Invalid call");
    }
}