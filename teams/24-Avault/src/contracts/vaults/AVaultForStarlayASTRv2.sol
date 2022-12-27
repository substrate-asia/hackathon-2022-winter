// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

import "./AVaultForStarlay.sol";


contract AVaultForStarlayASTRv2 is AVaultForStarlay{
    constructor(
        address[] memory _addresses,
        string memory _tokenName,
        string memory _tokenSymbol
    ) AVaultForStarlay(_addresses, _tokenName, _tokenSymbol) {
        require(_addresses[2] == _addresses[0], "ASTR");
    }

    function depositASTR(address _userAddress)
        external
        payable
        virtual
        nonReentrant
        whenNotPaused
    {
        uint _netAssetValue = getNetAssetValue(getLendingPool());

        uint _wantAmt = msg.value;
        _wrapETH();

        uint256 sharesAdded;
        if (_netAssetValue > 0) {
            sharesAdded = _wantAmt * totalSupply() / _netAssetValue;
        }else{
            sharesAdded = _wantAmt;
        }
        _mint(_userAddress, sharesAdded);

        _farm();
    }

    function withdrawASTR(address _userAddress, uint256 _shareAmount)
        external
        virtual
        nonReentrant
    {
        ILendingPool _lendingPool = getLendingPool();
        uint _wantAmt = getNetAssetValue(_lendingPool) * _shareAmount / totalSupply();
        if (withdrawFeeFactor < withdrawFeeFactorMax) {
            _wantAmt = _wantAmt * withdrawFeeFactor / withdrawFeeFactorMax;
        }
        require(_wantAmt > 0, "_wantAmt == 0");
        burn(_shareAmount);

        _ajustLTV(_wantAmt);

        _lendingPool.withdraw(wantAddress, _wantAmt, address(this));

        IWETH(wethAddress).withdraw(_wantAmt);
        (bool success, ) = _userAddress.call{value: _wantAmt}(new bytes(0));
        require(success, 'ASTR_TRANSFER_FAILED');
    }
}
