// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/draft-ERC20Permit.sol)

pragma solidity ^0.8.0;


import "./EIP712CrossChainWithChainId.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @dev Implementation of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on `{IERC20-approve}`, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 *
 * _Available since v3.4._
 */
abstract contract EntryPoint is EIP712CrossChainWithChainId {
    using Counters for Counters.Counter;

    mapping(address => Counters.Counter) private _nonces;

    // solhint-disable-next-line var-name-mixedcase
    bytes32 private immutable _PERMIT1_TYPEHASH =
        keccak256("permit1(address owner,uint256 nonce,uint256 deadline,uint256 chainId,address contract,string method,uint256 value)");
    

    /**
     * @dev Initializes the {EIP712} domain separator using the `name` parameter, and setting `version` to `"1"`.
     *
     * It's a good idea to use the same `name` that is defined as the ERC20 token name.
     */
    constructor(string memory name) EIP712CrossChainWithChainId(name, "1") {}

    /**
     * @dev See {IERC20Permit-permit}.
     */
    function permit1(
        address owner,
        uint256 deadline,
        uint256 chainId,
        address _contract,
        string calldata method,
        uint256 value,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual {
        require(block.timestamp <= deadline, "expired deadline");

        require(validateChainId(chainId), "invalid chainId");
        //doto validate contract, method


        bytes32 structHash = keccak256(abi.encode(_PERMIT1_TYPEHASH, owner, _useNonce(owner), deadline, chainId, _contract, method, value));

        bytes32 hash = _hashTypedDataV4(chainId, structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == owner, "invalid signature");

        // _approve(owner, _contract, value);
    }

    /**
     * @dev See {IERC20Permit-nonces}.
     */
    function nonces(address owner) public view virtual returns (uint256) {
        return _nonces[owner].current();
    }

    /**
     * @dev See {IERC20Permit-DOMAIN_SEPARATOR}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR(uint _chainId) external view returns (bytes32) {
        return _CACHED_CHAINID_DS[_chainId];
    }

    /**
     * @dev "Consume a nonce": return the current value and increment.
     *
     * _Available since v4.1._
     */
    function _useNonce(address owner) internal virtual returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[owner];
        current = nonce.current();
        nonce.increment();
    }

    function validateChainId(uint chainId) public virtual returns (bool) {
        //todo
        return true;
    }
}
