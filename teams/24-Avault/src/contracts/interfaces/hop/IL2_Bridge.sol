// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

/**
 * @dev The L2_Bridge is responsible for aggregating pending Transfers into TransferRoots. Each newly
 * createdTransferRoot is then sent to the L1_Bridge. The L1_Bridge may be the TransferRoot's final
 * destination or the L1_Bridge may forward the TransferRoot to it's destination L2_Bridge.
 */

interface IL2_Bridge {

    // address public l1Governance;
    function hToken() external view returns(address);
    function l1BridgeAddress() external view returns(address);
    function ammWrapper() external view returns(address);
    function activeChainIds(uint) external view returns(bool);

    event TransfersCommitted (
        uint256 indexed destinationChainId,
        bytes32 indexed rootHash,
        uint256 totalAmount,
        uint256 rootCommittedAt
    );

    event TransferSent (
        bytes32 indexed transferId,
        uint256 indexed chainId,
        address indexed recipient,
        uint256 amount,
        bytes32 transferNonce,
        uint256 bonderFee,
        uint256 index,
        uint256 amountOutMin,
        uint256 deadline
    );

    event TransferFromL1Completed (
        address indexed recipient,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline,
        address indexed relayer,
        uint256 relayerFee
    );

    /* ========== Public/External functions ========== */

    /**
     * @notice _amount is the total amount the user wants to send including the Bonder fee
     * @dev Send  hTokens to another supported layer-2 or to layer-1 to be redeemed for the underlying asset.
     * @param chainId The chainId of the destination chain
     * @param recipient The address receiving funds at the destination
     * @param amount The amount being sent
     * @param bonderFee The amount distributed to the Bonder at the destination. This is subtracted from the `amount`.
     * @param amountOutMin The minimum amount received after attempting to swap in the destination
     * AMM market. 0 if no swap is intended.
     * @param deadline The deadline for swapping in the destination AMM market. 0 if no
     * swap is intended.
     */
    function send(
        uint256 chainId,
        address recipient,
        uint256 amount,
        uint256 bonderFee,
        uint256 amountOutMin,
        uint256 deadline
    )
        external;

    /**
     * @dev Aggregates all pending Transfers to the `destinationChainId` and sends them to the
     * L1_Bridge as a TransferRoot.
     * @param destinationChainId The chainId of the TransferRoot's destination chain
     */
    function commitTransfers(uint256 destinationChainId) external;


    /* ========== Public Getters ========== */

    function getNextTransferNonce() external view returns (bytes32);
}
