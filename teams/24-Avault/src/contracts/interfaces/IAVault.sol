//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAVault is IERC20 {
    //----commonly used by trigger------
    function ajustToTargetLTV() external;
    function earn() external;

    function getNetAssetValue(address _lendingPool) external view returns(uint);
    function getReserveLTV() external view returns(uint _reserveLTV);

    //-----not commonly used--------
    function farm() external;
    function deposit(address _userAddress, uint256 _wantAmt) external;
    function withdraw(address _userAddress, uint256 _shareAmount) external;

    //----only for AVaultForStarlayASTRv2----
    function depositASTR(address _userAddress) external payable;
    function withdrawASTR(address _userAddress, uint256 _shareAmount) external;
}