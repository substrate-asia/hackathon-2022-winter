// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

/************
@title IDIAOracleV2 interface
@notice Interface for the Dia price oracle.*/
interface IDiaAggregator {
  /**
   * @dev returns the asset price
   * @param key asset-pair key. e.g. ETH/USD
   * @return the price of the asset
   **/
  function getValue(string memory key) external view returns (uint128, uint128);
}
