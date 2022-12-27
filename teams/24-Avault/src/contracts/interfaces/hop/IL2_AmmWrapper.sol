// SPDX-License-Identifier: MIT

pragma solidity >=0.7.6;

interface ISwap {
    function swap(
        uint8 tokenIndexFrom,
        uint8 tokenIndexTo,
        uint256 dx,
        uint256 minDy,
        uint256 deadline
    ) external returns (uint256);
}

interface IL2_AmmWrapper {

    function bridge() external view returns (address);
    function l2CanonicalToken() external view returns (address);
    function l2CanonicalTokenIsEth() external view returns(bool);
    function hToken() external view returns(address);
    function exchangeAddress() external view returns (ISwap);

    /// @notice amount is the amount the user wants to send plus the Bonder fee
    function swapAndSend(
        uint256 chainId,
        address recipient,
        uint256 amount,
        uint256 bonderFee,
        uint256 amountOutMin,
        uint256 deadline,
        uint256 destinationAmountOutMin,
        uint256 destinationDeadline
    )
        external
        payable;

    function attemptSwap(
        address recipient,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline
    )
        external;
}
