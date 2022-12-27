// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

interface StakeUIHelperI {
  struct AssetUIData {
    uint256 stakeTokenTotalSupply;
    uint256 stakeCooldownSeconds;
    uint256 stakeUnstakeWindow;
    uint256 stakeTokenPriceEth;
    uint256 rewardTokenPriceEth;
    uint256 stakeApy;
    uint128 distributionPerSecond;
    uint256 distributionEnd;
    uint256 stakeTokenUserBalance;
    uint256 underlyingTokenUserBalance;
    uint256 userCooldown;
    uint256 userIncentivesToClaim;
    uint256 userPermitNonce;
  }

  struct GeneralStakeUIData {
    uint256 stakeTokenTotalSupply;
    uint256 stakeCooldownSeconds;
    uint256 stakeUnstakeWindow;
    uint256 stakeTokenPriceEth;
    uint256 rewardTokenPriceEth;
    uint256 stakeApy;
    uint128 distributionPerSecond;
    uint256 distributionEnd;
  }

  struct UserStakeUIData {
    uint256 stakeTokenUserBalance;
    uint256 underlyingTokenUserBalance;
    uint256 userCooldown;
    uint256 userIncentivesToClaim;
    uint256 userPermitNonce;
  }

  function getStkLayData(address user) external view returns (AssetUIData memory);

  function getStkGeneralLayData() external view returns (GeneralStakeUIData memory);

  function getStkUserLayData(address user) external view returns (UserStakeUIData memory);

  /// @dev This will return user + general for fallback
  function getUserUIData(address user) external view returns (AssetUIData memory, uint256);

  function getGeneralStakeUIData() external view returns (GeneralStakeUIData memory, uint256);

  function getUserStakeUIData(address user) external view returns (UserStakeUIData memory, uint256);
}
