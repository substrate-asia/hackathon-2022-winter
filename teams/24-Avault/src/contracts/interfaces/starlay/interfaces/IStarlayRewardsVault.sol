// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

interface IStarlayRewardsVault {

  function owner() external view returns (address);
  function setIncentiveController(address _incentiveController) external;
  function renounceOwnership() external;

  function transfer(
    address token,
    uint256 amount
  ) external;

  function transferOwnership(address newOwner) external;
}
