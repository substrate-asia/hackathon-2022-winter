// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

interface IVoter {
  function totalWeight(uint256 term) external view returns(uint256);
  function poolWeights(address pool, uint256 term) external view returns(uint256);
  function currentTermTimestamp() external view returns (uint256);
}
