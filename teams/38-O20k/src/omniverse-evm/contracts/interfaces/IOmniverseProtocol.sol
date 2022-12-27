// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

enum VerifyResult {
    Success,
    Malicious
}

struct OmniverseTokenProtocol {
    uint256 nonce;
    string chainId;
    bytes from;
    string to;
    bytes data;
    bytes signature;
}

interface IOmniverseProtocol {
    event TransactionSent(bytes pk, uint256 nonce);

    /**
     * @dev Verifies the signature of a transaction
     */
    function verifyTransaction(OmniverseTokenProtocol calldata _data) external returns (VerifyResult);

    /**
     * @dev Returns the count of transactions
     */
    function getTransactionCount(bytes memory _pk) external view returns (uint256);
    
    /**
     * @dev Index the user is malicious or not
     */
    function isMalicious(bytes memory _pk) external view returns (bool);

    /**
     * @dev Returns the transaction data of the user with a specified nonce
     */
    function getTransactionData(bytes calldata _user, uint256 _nonce) external view returns (OmniverseTokenProtocol memory txData, uint256 timestamp);

    /**
     * @dev Returns the cooling down time
     */
    function getCoolingDownTime() external view returns (uint256);

    /**
     * @dev Returns the chain ID
     */
    function getChainId() external view returns (string memory);
}