// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {ILendingPool} from './ILendingPool.sol';
import {IStarlayIncentivesController} from './IStarlayIncentivesController.sol';

/**
 * @title IInitializableLToken
 * @notice Interface for the initialize function on LToken
 * @author Starlay
 **/
interface IInitializableLToken {
  /**
   * @dev Emitted when an lToken is initialized
   * @param underlyingAsset The address of the underlying asset
   * @param pool The address of the associated lending pool
   * @param treasury The address of the treasury
   * @param incentivesController The address of the incentives controller for this lToken
   * @param lTokenDecimals the decimals of the underlying
   * @param lTokenName the name of the lToken
   * @param lTokenSymbol the symbol of the lToken
   * @param params A set of encoded parameters for additional initialization
   **/
  event Initialized(
    address indexed underlyingAsset,
    address indexed pool,
    address treasury,
    address incentivesController,
    uint8 lTokenDecimals,
    string lTokenName,
    string lTokenSymbol,
    bytes params
  );

  /**
   * @dev Initializes the lToken
   * @param pool The address of the lending pool where this lToken will be used
   * @param treasury The address of the Starlay treasury, receiving the fees on this lToken
   * @param underlyingAsset The address of the underlying asset of this lToken (E.g. WETH for lWETH)
   * @param incentivesController The smart contract managing potential incentives distribution
   * @param lTokenDecimals The decimals of the lToken, same as the underlying asset's
   * @param lTokenName The name of the lToken
   * @param lTokenSymbol The symbol of the lToken
   */
  function initialize(
    ILendingPool pool,
    address treasury,
    address underlyingAsset,
    IStarlayIncentivesController incentivesController,
    uint8 lTokenDecimals,
    string calldata lTokenName,
    string calldata lTokenSymbol,
    bytes calldata params
  ) external;
}
