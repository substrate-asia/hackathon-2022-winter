// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "./ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";


contract GitverseRepo is ERC1155, Ownable, Pausable, ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter public tokenIdCounter;

    uint256 public createTokenPrice = 0.01 ether;
    uint256 public platformCommission = 100; // 100 / 10000 = 1%
    uint256 public platformCommissionBalance = 0;
    uint256 public baseMintPricePerToken = 0;
    string public symbol;

    mapping(uint256 => mapping(address => bool)) public dependents;
    mapping(uint256 => string) public tokenURIMap;
    mapping(address => uint256[]) public tokenOwnByMap;
    mapping(uint256 => address) public tokenOwnerMap;
    mapping(uint256 => uint256) public tokenVaultMap;
    mapping(uint256 => mapping(address => bool)) public tokenIdContributorMap;
    mapping(uint256 => address[]) public tokenIdContributorArray;

    mapping(address => uint256) public userTotalMintCountMap; // userAddress => userTotalAmount
    mapping(uint256 => string[]) public tokenItemsCIDArrayMap; // tokenId =>  itemsCID[], store all cid for every token's items

    mapping(address => bool) public repoMemberMap;

    event AddPkg(uint256 tokenId, string metadataCID, address[] contributors);
    event AddDependents(uint256 tokenId, address[] nfts);
    event RemoveDependents(uint256 tokenId, address[] nfts);

    constructor(string memory repoName, address _owner) ERC1155("") Ownable(_owner) {
        symbol = repoName;
        // _transferOwnership(_owner);
        _addMember(_owner);
        _setURI("");
    }

    function _isTokenIdExist(uint256 tokenId) private view returns (bool) {
        return tokenOwnerMap[tokenId] != address(0);
    }

    function _isNFT(address token) internal view returns (bool){
        return IERC165(token).supportsInterface(0xd9b67a26) || IERC165(token).supportsInterface(0x80ac58cd);
    }

    function _isNFTs(address[] memory nfts) internal view returns (bool) {
        for (uint256 i=0;i<nfts.length;i++){
            if (!_isNFT(nfts[i])) {
                return false;
            }
        }
        return true;
    }

    function addDependents(uint256 tokenId, address[] memory nfts) public whenNotPaused onlyOwner{
        require(nfts.length!=0);
        require(_isTokenIdExist(tokenId), "tokenId is not existed");
        require(_isNFTs(nfts), "nfts should be included");

        for (uint256 i=0;i<nfts.length;i++) {
            dependents[tokenId][nfts[i]] = true;
        }
        emit AddDependents(tokenId, nfts);
    }

    function removeDependents(uint256 tokenId, address[] memory nfts) public whenNotPaused onlyOwner{
        require(nfts.length!=0);
        require(_isTokenIdExist(tokenId), "tokenId is not existed");
        require(_isNFTs(nfts), "nfts should be included");

        for (uint256 i=0;i<nfts.length;i++) {
            delete dependents[tokenId][nfts[i]];
        }
        emit RemoveDependents(tokenId, nfts);
    }

    function addPkg(
        string memory metadataCID,
        address[] memory contributors,
        address[] memory _dependents
    ) public payable whenNotPaused onlyMember{
        require(bytes(metadataCID).length > 0, "metadataCID is empty");

        address createdBy = _msgSender();

        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();

        tokenURIMap[tokenId] = metadataCID;
        tokenOwnerMap[tokenId] = createdBy;
        tokenOwnByMap[createdBy].push(tokenId);

        for (uint256 i=0; i<contributors.length;i++) {
            tokenIdContributorMap[tokenId][contributors[i]] = true;
            tokenIdContributorArray[tokenId].push(contributors[i]);
        }

        if (_dependents.length > 0) {
            addDependents(tokenId, _dependents);
        }

        emit AddPkg(tokenId, metadataCID, contributors);
    }

    function getTokenContributors(uint256 tokenId) public view returns (address[] memory) {
        return tokenIdContributorArray[tokenId];
    }

    function addTokenItem(uint256 tokenId, string memory itemCID) public whenNotPaused onlyContributor(tokenId) {
        tokenItemsCIDArrayMap[tokenId].push(itemCID);
    }

    function addMember(address member) external whenNotPaused onlyOwner {
        _addMember(member);
    }
 
    function _addMember(address member) internal {
        repoMemberMap[member] = true;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function uri(
        uint256 tokenId
    ) public view override returns (string memory) {
        string memory tokenURI = tokenURIMap[tokenId];
        return tokenURI;
    }

    modifier onlyMember() {
        address sender = _msgSender();
        require(repoMemberMap[sender], "you are not the member of repo");
        _;
    }

    modifier onlyContributor(uint256 tokenId) {
        address sender = _msgSender();
        require(tokenIdContributorMap[tokenId][sender], "you are not the contributor of this tokenId");
        _;
    }

    function mintSingleNFT(
        uint256 tokenId,
        uint256 amount
    ) public payable whenNotPaused onlyContributor(tokenId) {
        require(bytes(tokenURIMap[tokenId]).length > 0, "token not create yet");
        require(
            msg.value >= baseMintPricePerToken * amount,
            "insufficient funds for mintNFT"
        );
        address createdBy = _msgSender();

        _mint(createdBy, tokenId, amount, "");
        userTotalMintCountMap[createdBy] += amount;

        uint256 platformCommissionDelta = (platformCommission * msg.value) /
            10000;
        platformCommissionBalance += platformCommissionDelta;
        tokenVaultMap[tokenId] +=
            msg.value - platformCommissionDelta;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}

