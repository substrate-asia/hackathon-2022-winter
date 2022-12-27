//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAvaultForAave is IERC20 {
    //----commonly used by trigger------
    function earn(address) external;

    function getNetAssetValue(address _lendingPool) external view returns(uint);

    //-----not commonly used--------
    function farm() external;
    function deposit(address _userAddress, uint256 _wantAmt) external;
    function withdraw(address _userAddress, uint256 _shareAmount) external returns (uint);

    function depositNative(address _userAddress) external payable;
    function withdrawNative(address _userAddress, uint256 _shareAmount) external returns (uint);
}