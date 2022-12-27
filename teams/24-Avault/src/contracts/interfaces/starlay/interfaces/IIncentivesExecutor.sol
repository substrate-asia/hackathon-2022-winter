// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

interface IIncentivesExecutor {
  function execute(
    address[6] memory lTokenImplementations,
    address[6] memory variableDebtImplementations,
    address[6] memory reserves
  ) external;
}
