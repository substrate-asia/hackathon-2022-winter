// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

interface IL1_Bridge {

    // struct TransferBond {
    //     address bonder;
    //     uint256 createdAt;
    //     uint256 totalAmount;
    //     uint256 challengeStartTime;
    //     address challenger;
    //     bool challengeResolved;
    // }

    /* ========== Events ========== */

    event TransferSentToL2(
        uint256 indexed chainId,
        address indexed recipient,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline,
        address indexed relayer,
        uint256 relayerFee
    );

    event TransferRootBonded (
        bytes32 indexed root,
        uint256 amount
    );

    event TransferRootConfirmed(
        uint256 indexed originChainId,
        uint256 indexed destinationChainId,
        bytes32 indexed rootHash,
        uint256 totalAmount
    );

    event TransferBondChallenged(
        bytes32 indexed transferRootId,
        bytes32 indexed rootHash,
        uint256 originalAmount
    );

    event ChallengeResolved(
        bytes32 indexed transferRootId,
        bytes32 indexed rootHash,
        uint256 originalAmount
    );

    /* ========== Send Functions ========== */

    /**
     * @notice `amountOutMin` and `deadline` should be 0 when no swap is intended at the destination.
     * @notice `amount` is the total amount the user wants to send including the relayer fee
     * @dev Send tokens to a supported layer-2 to mint hToken and optionally swap the hToken in the
     * AMM at the destination.
     * @param chainId The chainId of the destination chain
     * @param recipient The address receiving funds at the destination
     * @param amount The amount being sent
     * @param amountOutMin The minimum amount received after attempting to swap in the destination
     * AMM market. 0 if no swap is intended.
     * @param deadline The deadline for swapping in the destination AMM market. 0 if no
     * swap is intended.
     * @param relayer The address of the relayer at the destination.
     * @param relayerFee The amount distributed to the relayer at the destination. This is subtracted from the `amount`.
     */
    function sendToL2(
        uint256 chainId,
        address recipient,
        uint256 amount,
        uint256 amountOutMin,
        uint256 deadline,
        address relayer,
        uint256 relayerFee
    )
        external
        payable;

    /**
     * @dev Get the hash that represents an individual Transfer.
     * @param chainId The id of the destination chain
     * @param recipient The address receiving the Transfer
     * @param amount The amount being transferred including the `_bonderFee`
     * @param transferNonce Used to avoid transferId collisions
     * @param bonderFee The amount paid to the address that withdraws the Transfer
     * @param amountOutMin The minimum amount received after attempting to swap in the destination
     * AMM market. 0 if no swap is intended.
     * @param deadline The deadline for swapping in the destination AMM market. 0 if no
     * swap is intended.
     */
    function getTransferId(
        uint256 chainId,
        address recipient,
        uint256 amount,
        bytes32 transferNonce,
        uint256 bonderFee,
        uint256 amountOutMin,
        uint256 deadline
    )
        external
        pure
        returns (bytes32);

     /**
     * @dev Get the spent status of a transfer ID
     * @param transferId The transfer's unique identifier
     * @return True if the transferId has been spent
     */
    function isTransferIdSpent(bytes32 transferId) external view returns (bool);
}
