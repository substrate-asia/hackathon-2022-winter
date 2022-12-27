// SPDX-License-Identifier: MIT

pragma solidity >= 0.6.12;


/// @notice The MasterChef contract gives out ARSW tokens for yield farming.
/// The amount of ARSW token reward decreases per month (215000 blocks).
/// For the detail, see the token economics documents: https://docs.arthswap.org/arsw-token
interface IArthswapFarm {

    function poolLength() external view returns (uint256);

    function userInfos(uint, address) external view returns (uint amount, int256 rewardDebt);

    // method name changed
    function pendingARSW(uint256 _pid, address _user)
        external
        view
        returns (uint256);



    // add _to
    function deposit(uint256 _pid, uint256 _amount, address _to) external;

    // add _to
    function withdraw(uint256 _pid, uint256 _amount, address _to) external;



    /// @notice Harvest proceeds for transaction sender to `to`.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param to Receiver of ARSW rewards.
    function harvest(uint256 pid, address to) external;

    /// @notice Withdraw LP tokens from MasterChef and harvest proceeds for transaction sender to `to`.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param amount LP token amount to withdraw.
    /// @param to Receiver of the LP tokens and ARSW rewards.
    function withdrawAndHarvest(
        uint256 pid,
        uint256 amount,
        address to
    ) external;

    /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
    /// @param pid The index of the pool. See `poolInfo`.
    /// @param to Receiver of the LP tokens.
    function emergencyWithdraw(uint256 pid, address to)
        external;
}
