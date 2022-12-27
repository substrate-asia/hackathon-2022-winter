// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;


import "../interfaces/IWETH.sol";
import "../interfaces/IDistributable.sol";
import "../interfaces/IZap.sol";

import "../interfaces/starlay/interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/starlay/interfaces/ILendingPool.sol";
import "../interfaces/starlay/interfaces/IIncentivesController.sol";
import "../interfaces/starlay/lib/ReserveConfiguration.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract AVaultForStarlay is Ownable, ReentrancyGuard, Pausable, ERC20Permit {
    // Maximises yields in starlay

    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

    uint8 public decimal;
    uint public constant ltvScale = 10000;
    uint public maxLoopCount;

    ILendingPoolAddressesProvider public lendingPoolAddressesProvider;
    IIncentivesController public incentivesController;

    IZap public zap;

    uint public targetLTV; // 0.9 * LTV

    address public wantAddress;
    address public earnedAddress;

    address public wethAddress;
    address public AVAAddress;

    uint256 public buyBackRate;
    uint256 public constant buyBackRateMax = 10000; // 100 = 1%
    uint256 public constant buyBackRateUL = 800;
    IDistributable public buyBackAddress;
    address public buybackLP;

    uint256 public withdrawFeeFactor;
    uint256 public constant withdrawFeeFactorMax = 10000;
    uint256 public constant withdrawFeeFactorLL = 9950; // 0.5% is the max fee settable. LL = lowerlimit

    address public interimBuybackHolder;

    event SetSettings(
        uint256 _withdrawFeeFactor,
        uint256 _buyBackRate
    );

    event SetBuyBackAddress(IDistributable _buyBackAddress);
    event SetInterimBuybackHolder(address _interimBuybackHolder);
    event ApproveRewardHanlder(address _rewardHandler, address _rewardToken);
    event SetTargetLTV(uint _targetLTV);


    constructor(
        address[] memory _addresses,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20(_tokenName, _tokenSymbol) ERC20Permit(_tokenName) {
        wethAddress = _addresses[0];
        AVAAddress = _addresses[1];
        address _wantAddress = _addresses[2];
        wantAddress = _wantAddress;
        buyBackAddress = IDistributable(_addresses[3]);
        interimBuybackHolder = _addresses[4];

        lendingPoolAddressesProvider = ILendingPoolAddressesProvider(_addresses[5]);
        incentivesController = IIncentivesController(_addresses[6]);
        earnedAddress = incentivesController.REWARD_TOKEN();
        zap = IZap(_addresses[7]);

        buyBackRate = 300; // 3% of eanred amount, compound fee - handle by Distributor
        withdrawFeeFactor = 9998; // 0.02% of withdraw amount, withdraw fee - return back to user pool

        DataTypes.ReserveConfigurationMap memory configuration = getLendingPool().getConfiguration(_wantAddress);
        (uint _ltv, , , uint _decimals,) = configuration.getParamsMemory();
        require(_decimals == IERC20Metadata(_wantAddress).decimals(), "decimal"); // should ajust the scale if not equal.

        decimal = uint8(_decimals);
        maxLoopCount = 20;
        targetLTV = _ltv * 9000 / ltvScale;
    }


    receive() external payable {}

    function decimals() public view virtual override returns (uint8) {
        return decimal;
    }

    function depositWithPermit(
        address _userAddress, 
        uint256 _wantAmt,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s)
        external
        virtual
    {
        IERC20Permit(wantAddress).permit(msg.sender, address(this), type(uint).max, deadline, v, r, s);
        deposit(_userAddress, _wantAmt);
    }


    // Receives new deposits and mint cLP to user
    function deposit(address _userAddress, uint256 _wantAmt)
        public
        virtual
        nonReentrant
        whenNotPaused
    {
        uint _netAssetValue = getNetAssetValue(getLendingPool());
        
        IERC20(wantAddress).safeTransferFrom(
            address(msg.sender),
            address(this),
            _wantAmt
        );

        uint256 sharesAdded;
        if (_netAssetValue > 0) {
            sharesAdded = _wantAmt * totalSupply() / _netAssetValue;
        }else{
            sharesAdded = _wantAmt;
        }
        _mint(_userAddress, sharesAdded);

        _farm();
    }

    function getNetAssetValue(ILendingPool _lendingPool) public view returns(uint){
        DataTypes.ReserveData memory reserve = _lendingPool.getReserveData(wantAddress);
        uint lTokenBalance = IERC20(reserve.lTokenAddress).balanceOf(address(this));
        uint variableDebt = IERC20(reserve.variableDebtTokenAddress).balanceOf(address(this));
        uint wantBalance = IERC20(wantAddress).balanceOf(address(this));
        return lTokenBalance + wantBalance - variableDebt;
    }

    function farm() external virtual nonReentrant whenNotPaused{
        _farm();
    }

    function getLendingPool() internal view returns(ILendingPool _lendingPool){
        return ILendingPool(lendingPoolAddressesProvider.getLendingPool());
    }

    function _farm() internal virtual {
        address _wantAddress = wantAddress;
        uint256 wantAmt = IERC20(_wantAddress).balanceOf(address(this));
        if(wantAmt > 0){
            ILendingPool lendingPool = getLendingPool();
            IERC20(_wantAddress).safeIncreaseAllowance(address(lendingPool), wantAmt);
            lendingPool.deposit(_wantAddress, wantAmt, address(this), 0);
        }
    }

    function ajustToTargetLTV() external nonReentrant whenNotPaused{
        _ajustLTV(0);
    }

    function _ajustLTV(uint _toWithdrawAmount) internal{
        _farm();

        ILendingPool _lendingPool = getLendingPool();
        uint _maxLoopCount = maxLoopCount;
        uint _targetLTV = targetLTV;
        uint _ltvScale = ltvScale;
        address _wantAddress = wantAddress;

        DataTypes.ReserveData memory reserve = _lendingPool.getReserveData(_wantAddress);
        uint _lTokenBalance = IERC20(reserve.lTokenAddress).balanceOf(address(this));
        uint _variableDebt = IERC20(reserve.variableDebtTokenAddress).balanceOf(address(this));

        uint _deltaOfLoan;
        uint _reserveLtv = getReserveLTV();
        if(_lTokenBalance * _targetLTV > _variableDebt * _ltvScale + (_targetLTV * _toWithdrawAmount)){
            //calc DeltaOfLoan, increace loan
            _deltaOfLoan = ((_lTokenBalance * _targetLTV) - (_variableDebt * _ltvScale + (_targetLTV * _toWithdrawAmount))) / (_ltvScale - _targetLTV);
            //borrow and deposit
            for(uint i = 0; i < _maxLoopCount && _deltaOfLoan > 0; i++){
                //calc max borrowable
                uint _maxBorrowable = getMaxBorrowable(_lendingPool, _reserveLtv, _ltvScale);
                if(_maxBorrowable == 0){
                    // may targetLTV >= reserveLTV
                    break;
                }
                uint _toBorrow = _maxBorrowable < _deltaOfLoan ? _maxBorrowable : _deltaOfLoan;
                _lendingPool.borrow(_wantAddress, _toBorrow, uint(DataTypes.InterestRateMode.VARIABLE), 0, address(this));
                _farm();
                _deltaOfLoan -= _toBorrow;
            }
        }else{
            //calc DeltaOfLoan, reduce loan
            _deltaOfLoan = ((_variableDebt * _ltvScale + (_targetLTV * _toWithdrawAmount)) - (_lTokenBalance * _targetLTV)) / (_ltvScale - _targetLTV);
            require(_deltaOfLoan <= _variableDebt, "not enough loan"); // may caused by too big param: _toWithdrawAmount
            require(_deltaOfLoan + _toWithdrawAmount < _lTokenBalance, "not enough value");
            //withdraw and repay
            for(uint i = 0; i < _maxLoopCount && _deltaOfLoan > 0; i++){
                //calc max Withdrawable
                uint _maxWithdrawable = getMaxWithdrawable(_lendingPool, _reserveLtv, _ltvScale);
                if(_maxWithdrawable == 0){
                    break;
                }
                uint _toWithdraw = _maxWithdrawable < _deltaOfLoan ? _maxWithdrawable : _deltaOfLoan;
                _lendingPool.withdraw(_wantAddress, _toWithdraw, address(this));
                IERC20(_wantAddress).safeIncreaseAllowance(address(_lendingPool), _toWithdraw);
                _lendingPool.repay(_wantAddress, _toWithdraw, uint(DataTypes.InterestRateMode.VARIABLE), address(this));
                _deltaOfLoan -= _toWithdraw;
            }
        }
    }

    function getMaxBorrowable(ILendingPool _lendingPool, uint _reserveLtv, uint _ltvScale) public view returns(uint){
        DataTypes.ReserveData memory reserve = _lendingPool.getReserveData(wantAddress);
        uint _lTokenBalance = IERC20(reserve.lTokenAddress).balanceOf(address(this));
        uint _variableDebt = IERC20(reserve.variableDebtTokenAddress).balanceOf(address(this));
        return _lTokenBalance * _reserveLtv / _ltvScale > _variableDebt + 1 ? _lTokenBalance * _reserveLtv / _ltvScale - _variableDebt - 1 : 0;
    }

    function getMaxWithdrawable(ILendingPool _lendingPool, uint _reserveLtv, uint _ltvScale) public view returns(uint){
        DataTypes.ReserveData memory reserve = _lendingPool.getReserveData(wantAddress);
        uint _lTokenBalance = IERC20(reserve.lTokenAddress).balanceOf(address(this));
        uint _variableDebt = IERC20(reserve.variableDebtTokenAddress).balanceOf(address(this));
        return _lTokenBalance > (_variableDebt * _ltvScale / _reserveLtv) + 1 ? _lTokenBalance - (_variableDebt * _ltvScale / _reserveLtv) - 1 : 0;
    }

    function getReserveLTV() public view returns(uint _reserveLTV){
        DataTypes.ReserveConfigurationMap memory configuration = getLendingPool().getConfiguration(wantAddress);
        (_reserveLTV, , , ,) = configuration.getParamsMemory();
    }



    function withdraw(address _userAddress, uint256 _shareAmount)
        external
        virtual
        nonReentrant
    {
        ILendingPool _lendingPool = getLendingPool();
        uint _wantAmt = getNetAssetValue(_lendingPool) * _shareAmount / totalSupply();
        if (withdrawFeeFactor < withdrawFeeFactorMax) {
            _wantAmt = _wantAmt.mul(withdrawFeeFactor).div(withdrawFeeFactorMax);
        }
        require(_wantAmt > 0, "_wantAmt == 0");
        burn(_shareAmount);

        _ajustLTV(_wantAmt);

        address _wantAddress = wantAddress;
        _lendingPool.withdraw(_wantAddress, _wantAmt, address(this));
        IERC20(_wantAddress).safeTransfer(_userAddress, _wantAmt);
    }

    // 1. Harvest farm tokens
    // 2. Converts farm tokens into want tokens
    // 3. Deposits want tokens
    function earn() external virtual nonReentrant whenNotPaused{
        _earn();
        _farm();
    }

    function _earn() internal virtual  {
        // Harvest farm tokens
        address _wantAddress = wantAddress;
        DataTypes.ReserveData memory _reserve = getLendingPool().getReserveData(_wantAddress);
        address[] memory _t = new address[](2);
        _t[0] = _reserve.lTokenAddress;
        _t[1] = _reserve.variableDebtTokenAddress;
        incentivesController.claimRewardsToSelf(_t, type(uint).max);

        address _earnedAddress = earnedAddress;
        if (_earnedAddress == wethAddress) {
            _wrapETH();
        }

        uint256 earnedAmt = IERC20(_earnedAddress).balanceOf(address(this));
        //skip earning if earnedAmt too small.
        if(earnedAmt < 10000){
            return;
        }

        earnedAmt = buyBack(earnedAmt);

        // Converts farm tokens into want tokens
        if (_wantAddress == _earnedAddress) {
            return;
        }

        IZap _zap = zap;
        IERC20(_earnedAddress).safeIncreaseAllowance(address(_zap), earnedAmt);
        _zap.zapInToken(_earnedAddress, earnedAmt, _wantAddress);
    }

    //convert earned to AVA-WETH LP
    function buyBack(uint256 _earnedAmt) internal virtual returns (uint256 remainAmt) {
        if (buyBackRate <= 0) {
            return _earnedAmt;
        }

        address _earnedAddress = earnedAddress;
        uint256 _buyBackAmt = _earnedAmt.mul(buyBackRate).div(buyBackRateMax);
        if(interimBuybackHolder != address(0)){
            IERC20(_earnedAddress).transfer(interimBuybackHolder, _buyBackAmt);
        }else{
            address _buybackLP = buybackLP;
            IERC20(_earnedAddress).safeIncreaseAllowance(address(zap), _buyBackAmt);
            zap.zapInToken(_earnedAddress, _buyBackAmt, _buybackLP);

            uint _lpBalance = IERC20(_buybackLP).balanceOf(address(this));
            if(_lpBalance > 0){
                IERC20(_buybackLP).transfer(address(buyBackAddress), _lpBalance);
                buyBackAddress.distributeRewards();
            }
        }
        
        return IERC20(_earnedAddress).balanceOf(address(this));
    }

    function pause() public virtual onlyOwner {
        _pause();
    }

    function unpause() public virtual onlyOwner {
        _unpause();
    }

    function setSettings(
        uint256 _withdrawFeeFactor,
        uint256 _buyBackRate
    ) public virtual onlyOwner {
        require(
            _withdrawFeeFactor >= withdrawFeeFactorLL,
            "_withdrawFeeFactor too low"
        );
        require(
            _withdrawFeeFactor <= withdrawFeeFactorMax,
            "_withdrawFeeFactor too high"
        );
        withdrawFeeFactor = _withdrawFeeFactor;

        require(_buyBackRate <= buyBackRateUL, "_buyBackRate too high");
        buyBackRate = _buyBackRate;


        emit SetSettings(
            _withdrawFeeFactor,
            _buyBackRate
        );
    }

    function setBuyBackAddress(IDistributable _buyBackAddress)
        external
        virtual
        onlyOwner
    {
        buyBackAddress = _buyBackAddress;
        emit SetBuyBackAddress(_buyBackAddress);
    }

    function setInterimBuybackHolder(address _interimBuybackHolder) external virtual onlyOwner
    {
        interimBuybackHolder = _interimBuybackHolder;
        emit SetInterimBuybackHolder(_interimBuybackHolder);
    }

    function approveRewardHanlder(address _rewardHandler, address _rewardToken) external virtual onlyOwner{
        require(_rewardHandler != address(0), "address 0");
        require(_rewardToken != wantAddress, "wantAddress");
        require(_rewardToken != earnedAddress, "earnedAddress");
        DataTypes.ReserveData memory rd = getLendingPool().getReserveData(wantAddress);
        require(_rewardToken != rd.lTokenAddress, "lTokenAddress");

        IERC20(_rewardToken).safeIncreaseAllowance(_rewardHandler, type(uint).max);
        emit ApproveRewardHanlder(_rewardHandler, _rewardToken);
    }

    function setTargetLTV(uint _targetLTV) external onlyOwner{
        DataTypes.ReserveConfigurationMap memory configuration = getLendingPool().getConfiguration(wantAddress);
        (uint _ltv, , , ,) = configuration.getParamsMemory();

        uint _targetLTVUpLimit = _ltv * 9500 / ltvScale;
        require(_targetLTV <= _targetLTVUpLimit, "too high");
        targetLTV = _targetLTV;

        emit SetTargetLTV(_targetLTV);
    }

    function setMaxLoopCount(uint _maxLoopCount) external onlyOwner{
        require(_maxLoopCount < 100, "too hight");
        maxLoopCount = _maxLoopCount;
    }


    function _wrapETH() internal virtual {
        // ETH -> WETH
        uint256 ethBal = address(this).balance;
        if (ethBal > 0) {
            IWETH(wethAddress).deposit{value: ethBal}(); // ETH -> WETH
        }
    }

    function wrapETH() public virtual onlyOwner {
        _wrapETH();
    }

    function burn(uint _amount) public {
        _burn(_msgSender(), _amount);
    }

    function setBuybackLP(address _buybackLP) external onlyOwner{
        buybackLP = _buybackLP;
    }

}
