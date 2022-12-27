// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

/**
 * @title IDelegationToken
 * @dev Implements an interface for tokens with delegation COMP/UNI compatible
 * @author Starlay
 **/
interface IDelegationToken {
  function delegate(address delegatee) external;
}
