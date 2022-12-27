//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract Tradable721 is ERC721PresetMinterPauserAutoId {
    using Strings for uint256;
    using Counters for Counters.Counter;

    bytes32 public constant BURN_ROLE = keccak256("BURN_ROLE");
    bytes32 public constant URLSETTER_ROLE = keccak256("URLSETTER_ROLE");

    string _baseTokenURI;
    Counters.Counter _tokenIdTracker;

    // token id => ipfs cid
    mapping(uint256 => string) public cids;

    //address => ids
    mapping(address => uint256[]) internal ownerTokens;
    mapping(uint256 => uint256) internal tokenIndexs;

    // mapping(uint256 => address) internal tokenOwners;

    constructor(string memory name, string memory symbol) ERC721PresetMinterPauserAutoId(name, symbol, "") {
        _setupRole(BURN_ROLE, _msgSender());
        _setupRole(URLSETTER_ROLE, _msgSender());
    }

    function adminBurn(uint256 id) public {
        require(hasRole(BURN_ROLE, _msgSender()), "Must have burn role to burn");
        _burn(id);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, cids[tokenId])) : "";
    }

    function setBaseURI(string memory uri) public virtual {
        require(hasRole(URLSETTER_ROLE, _msgSender()), "Must have URLSETTER_ROLE role to set uri");
        _baseTokenURI = uri;
    }

    function adminMint(address to, string memory cid) public virtual {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have minter role to mint");
        uint256 id = _tokenIdTracker.current();
        cids[id] = cid;
        _mint(to, id);
        _tokenIdTracker.increment();
    }

    function tokensOf(
        address owner,
        uint256 startIndex,
        uint256 endIndex
    ) public view virtual returns (uint256[] memory) {
        require(owner != address(0), "owner is zero address");

        uint256[] storage tokens = ownerTokens[owner];
        if (endIndex == 0) {
            return tokens;
        }

        require(startIndex < endIndex, "invalid index");

        uint256[] memory result = new uint256[](endIndex - startIndex);
        for (uint256 i = 0; i != endIndex - startIndex; ++i) {
            result[i] = tokens[startIndex + i];
        }

        return result;
    }

    /**********overridden fun**********/

    function mint(address to) public virtual override {}

    function _removeTokenFrom(address from, uint256 tokenId) internal virtual {
        uint256 index = tokenIndexs[tokenId];

        uint256[] storage tokens = ownerTokens[from];
        uint256 indexLast = tokens.length - 1;

        uint256 tokenIdLast = tokens[indexLast];
        tokens[index] = tokenIdLast;
        tokenIndexs[tokenIdLast] = index;

        tokens.pop();
    }

    function _addTokenTo(address to, uint256 tokenId) internal virtual {
        uint256[] storage tokens = ownerTokens[to];
        tokenIndexs[tokenId] = tokens.length;
        tokens.push(tokenId);
    }

    function _mint(address to, uint256 tokenId) internal virtual override {
        super._mint(to, tokenId);
        _addTokenTo(to, tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override {
        address owner = ERC721.ownerOf(tokenId);
        super._burn(tokenId);
        _removeTokenFrom(owner, tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._transfer(from, to, tokenId);
        _removeTokenFrom(from, tokenId);
        _addTokenTo(to, tokenId);
    }
}
