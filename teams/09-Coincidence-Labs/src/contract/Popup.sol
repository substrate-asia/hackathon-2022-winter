// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC20Helper.sol";

contract Popup is Ownable, ERC20Helper {
    enum PopupState {
        normal,
        ended,
        distributed,
        closed
    }

    struct PopupInfo {
        bytes32 seed;   // Seed for off-chain random
        address owner; // who create this popup
        uint256 curationId; // curation task id
        uint256 popupTweetId; // popup tweet id
        PopupState status;
        uint256 endTime;
        uint256 winnerCount; // Number of winners
        address token; // reward token
        uint256 bonus; // reward amount
        RewardInfo[] rewards;
    }

    struct RewardInfo {
        address user;
        uint256 amount;
        uint256 twitterId;
        uint256 index;
    }

    /// fee
    uint256 public fee;

    /// Maximum number of winners
    uint256 public max_winners = 100;

    event NewPopup(address indexed owner, address indexed token, uint256 bonus, uint256 endTime);
    event StateChange(uint256 indexed curationId, uint256 popupTweetId, uint8 state);

    // popup twitter id => PopupInfo
    mapping(uint256 => PopupInfo) popupList;

    // curation Id => [popup twitter id]
    mapping(uint256 => uint256[]) curationList;

    function getPopup(uint256 popupTweetId) public view returns (PopupInfo memory info) {
        info = popupList[popupTweetId];
    }

    function getPopupByCuration(uint256 curationId) public view returns (PopupInfo[] memory) {
        PopupInfo[] memory ps = new PopupInfo[](curationList[curationId].length);
        for (uint256 i = 0; i < curationList[curationId].length; i++) {
            ps[i] = popupList[curationList[curationId][i]];
        }
        return ps;
    }

    function setFee(uint256 _fee) public onlyOwner {
        fee = _fee;
    }

    function createPopup(
        uint256 curationId,
        uint256 popupTweetId,
        uint256 endTime,
        uint256 winnerCount,
        address token,
        uint256 bonus
    ) public payable {
        require(winnerCount <= max_winners, "invalid winnerCount");
        require(popupList[popupTweetId].endTime == 0, "Popup has been created");
        require(bonus >= 10000, "bonus too small");
        require(ERC20(token).balanceOf(msg.sender) >= bonus, "Insufficient balance");
        require(endTime > block.timestamp, "Wrong end time");
        if (fee > 0) {
            require(msg.value >= fee, "invlid fee");
            payable(owner()).transfer(msg.value);
        }
        lockERC20(token, msg.sender, address(this), bonus);

        popupList[popupTweetId].owner = msg.sender;
        popupList[popupTweetId].curationId = curationId;
        popupList[popupTweetId].popupTweetId = popupTweetId;
        popupList[popupTweetId].endTime = endTime;
        popupList[popupTweetId].winnerCount = winnerCount;
        popupList[popupTweetId].token = token;
        popupList[popupTweetId].bonus = bonus;
        popupList[popupTweetId].status = PopupState.normal;

        curationList[curationId].push(popupTweetId);

        emit NewPopup(msg.sender, token, bonus, endTime);
    }

    function commitReward(
        bytes32 seed,
        uint256 popupTweetId,
        RewardInfo[] calldata rewards
    ) public onlyOwner {
        PopupInfo storage popup = popupList[popupTweetId];
        require(popup.rewards.length == 0, "already submitted");
        require(popup.status == PopupState.normal, "A popup in a normal state can only be submitted");
        require(popup.winnerCount >= rewards.length, "invalid rewards");
        require(popup.endTime <= block.timestamp, "End time not reached");

        uint256 amount = 0;
        for (uint256 i = 0; i < rewards.length; i++) {
            amount += rewards[i].amount;
            popup.rewards.push(rewards[i]);
        }
        require(amount == 0 || amount == popup.bonus, "invalid reward amount");

        popup.seed = seed;
        popup.status = PopupState.ended;

        emit StateChange(popup.curationId, popupTweetId, uint8(PopupState.ended));
    }

    function distribute(uint256 popupTweetId) public {
        PopupInfo storage popup = popupList[popupTweetId];
        require(popup.status == PopupState.ended, "A popup in a ended state can only be distribute");
        if (popup.rewards.length == 0) {
            popup.status = PopupState.closed;
            releaseERC20(popup.token, popup.owner, popup.bonus);
            emit StateChange(popup.curationId, popupTweetId, uint8(PopupState.closed));
        } else {
            popup.status = PopupState.distributed;
            for (uint256 i = 0; i < popup.rewards.length; i++) {
                releaseERC20(popup.token, popup.rewards[i].user, popup.rewards[i].amount);
            }
            emit StateChange(popup.curationId, popupTweetId, uint8(PopupState.distributed));
        }
    }
}
