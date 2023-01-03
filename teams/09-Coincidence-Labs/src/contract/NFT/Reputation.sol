//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";

/**
 * Reputation NFT for wormhole
 * By now id = 0 stores user's twitter base reputation
 * We mint and burn reputation by our central server now because of the freguetly update and twitter data fetch
 * And we will revolk the admin roles when our decentralize alglom contract deployed.
 * All this NFT cant be transfered by now.
 */
contract Reputation is ERC1155PresetMinterPauser {

    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");
    // admin can burn user's reputation
    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");
    bytes32 public constant URLSETTER_ROLE = keccak256("URLSETTER_ROLE");

    // total supplys of id
    mapping(uint256 => uint256) private _supplys;

    mapping(uint256 => string) private tokenURI;

    constructor(string memory uri_) ERC1155PresetMinterPauser(uri_){
        _setupRole(TRANSFER_ROLE, _msgSender());
        _setupRole(BURN_ROLE, _msgSender());
        _setupRole(URLSETTER_ROLE, _msgSender());
    }

    function supplysOf(uint256 id) public view returns (uint256) {
        return _supplys[id];
    }

    function adminBurn(address account, uint256 id, uint256 value) public {
        require(hasRole(BURN_ROLE, _msgSender()), "Must have burn role to burn");
        _burn(account, id, value);
    }

    function adminBurnBatch(address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        require(hasRole(BURN_ROLE, _msgSender()), "Must have burn role to burn");
        _burnBatch(from, ids, amounts);
    }

    // Someone's reputation is the ratio his balance of total supply
    // The result must multi 1e12 out of blockchain
    function getReputation(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "Reputation query for the zero address");
        uint256 balance = balanceOf(account, id);
        return balance * 1e12 / supplysOf(id);
    }

    function setURI(uint _id, string memory _uri) external {
        require(hasRole(URLSETTER_ROLE, _msgSender()), "Must have url setter role to set");
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function uri(uint _id) public override view returns (string memory) {
        return tokenURI[_id];
    }

    // override this internal method
    // We add _supplys to every id, and we need update this value when mint or burn
    // And user cant transfer reputations
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        if (from  == address(0)) { // mint
            for (uint256 i; i < ids.length; i++) {
                _supplys[ids[i]] += amounts[i];
            }
        }else if(to == address(0)) { // burn
            for (uint256 i; i < ids.length; i++) {
                _supplys[ids[i]] -= amounts[i];
            }
        } else if (from != address(0) && to != address(0)) { // transfer
            require(hasRole(TRANSFER_ROLE, operator), "Must have tranfer role to transfer");
        }
    }
}