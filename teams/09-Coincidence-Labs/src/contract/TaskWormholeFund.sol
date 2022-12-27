// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./ERC20Helper.sol";
import "./interfaces/IWormholeFund.sol";

contract TaskWormholeFund is Ownable, ERC20Helper, IWormholeFund {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// The maximum number of token types that can be claimed at one time.
    uint256 public maxClaimTokens = 100;

    /// The upper limit of the number of users that can be called in a single call when claiming user tokens in batches
    uint256 public maxClaimUsers = 50;

    /// Curation Task Contract
    address public taskContract;

    // token => twitterId => amount
    mapping(address => mapping(uint256 => uint256)) private accountDetails;

    /// twitterId => address
    mapping(uint256 => address) public userAddress;

    // twitterId => tokens
    mapping(uint256 => EnumerableSet.AddressSet) private userTokens;

    /**
    @dev set task contract
    @param task task contract address
    */
    function setTaskContract(address task) public onlyOwner {
        require(task != address(0), "Invalid task address");
        taskContract = task;
    }

    /**
    @dev Set user addresses in batches
    @param twitterIds twitter ids
    @param addrs user's address
    */
    function setUserAddress(uint256[] memory twitterIds, address[] memory addrs) public onlyOwner {
        require(twitterIds.length == addrs.length, "Wrong data");
        for (uint256 i = 0; i < twitterIds.length; i++) {
            require(twitterIds[i] != 0, "Invalid twitter id");
            require(addrs[i] != address(0), "Invalid user address");
            userAddress[twitterIds[i]] = addrs[i];
        }
    }

    /**
    @dev Add an unclaimed reward, this method can only be called by the Task contract.
    When calling, the corresponding Token must be transferred.
    @param twitterId user twitter id
    @param token reward token address
    @param amount reward amount
    */
    function pushAward(
        uint256 twitterId,
        address token,
        uint256 amount
    ) public override {
        require(taskContract != address(0), "Task contract not set");
        require(msg.sender == taskContract, "Unauthorized task contract");
        accountDetails[token][twitterId] += amount;
        userTokens[twitterId].add(token);
    }

    /**
    @dev To claim a single user's token, if the number of token types is greater than maxClaimTokens, multiple claims are required.
    @param twitterId twitter id
    */
    function claim(uint256 twitterId) public {
        require(userAddress[twitterId] != address(0), "Address not yet bound");
        address[] memory tokens = userTokens[twitterId].values();
        uint256 len = tokens.length;
        if (len > maxClaimTokens) {
            len = maxClaimTokens;
        }
        for (uint256 i = 0; i < len; i++) {
            uint256 amount = accountDetails[tokens[i]][twitterId];
            accountDetails[tokens[i]][twitterId] = 0;
            userTokens[twitterId].remove(tokens[i]);
            releaseERC20(tokens[i], userAddress[twitterId], amount);
        }
    }

    /**
    @dev To claim a single user's token, if the number of token types is greater than maxClaimTokens, multiple claims are required.
    @param twitterId twitter id
    @param addr user eth address
    */
    function claim(uint256 twitterId, address addr) public onlyOwner {
        require(addr != address(0), "Address cannot be 0x00");
        require(userAddress[twitterId] == address(0), "User address is already bound");
        userAddress[twitterId] = addr;
        claim(twitterId);
    }

    /**
    @dev Claim user tokens in batches
    @param twitterIds twitter ids
    */
    function claimBatch(uint256[] calldata twitterIds) public {
        uint256 len = twitterIds.length;
        if (len > maxClaimUsers) {
            len = maxClaimUsers;
        }
        for (uint256 i = 0; i < len; i++) {
            claim(twitterIds[i]);
        }
    }

    /**
    @dev Get the token list of the specified user
    @param twitterId twitter id
    */
    function getUserTokens(uint256 twitterId) public view returns (address[] memory tokens, uint256[] memory amounts) {
        tokens = userTokens[twitterId].values();
        amounts = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            amounts[i] = accountDetails[tokens[i]][twitterId];
        }
    }
}
