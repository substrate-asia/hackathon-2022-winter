// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;


import "../interfaces/IWETH.sol";
import "../interfaces/IZap.sol";

import "../interfaces/aave/IPool.sol";
import "../interfaces/aave/IPoolAddressesProvider.sol";
import "../libraries/aave/ReserveConfiguration.sol";
import "../interfaces/aave/IRewardsController.sol";


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract AVaultForAave is Ownable, ReentrancyGuard, Pausable, ERC20Permit {
    using SafeERC20 for IERC20;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

    uint8 public immutable decimal;
    address public immutable wantAddress;
    address public immutable wethAddress;
    IPoolAddressesProvider public immutable poolAddressProvider;

    IRewardsController public incentivesController;
    IZap public zap;

    uint256 public buyBackRate;
    uint256 private constant buyBackRateMax = 10000; // 100 = 1%
    uint256 private constant buyBackRateUL = 800;
    uint256 public withdrawFeeFactor;
    uint256 internal constant withdrawFeeFactorMax = 10000;
    uint256 private constant withdrawFeeFactorLL = 9950; // 0.5% is the max fee settable. LL = lowerlimit
    
    address public interimBuybackHolder;
    uint16 public referralCode;

    event SetSettings(
        uint256 _withdrawFeeFactor,
        uint256 _buyBackRate
    );

    event SetInterimBuybackHolder(address _interimBuybackHolder);
    event ApproveRewardHanlder(address _rewardHandler, address _rewardToken);
    event ZapSet(address _address);


    constructor(
        address[] memory _addresses,
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20(_tokenName, _tokenSymbol) ERC20Permit(_tokenName) {
        wethAddress = _addresses[0];
        address _wantAddress = _addresses[1];
        wantAddress = _wantAddress;
        interimBuybackHolder = _addresses[2];

        poolAddressProvider = IPoolAddressesProvider(_addresses[3]);
        incentivesController = IRewardsController(_addresses[4]);

        // buyBackRate = 0; // 0% of eanred amount, compound fee - handle by Distributor
        withdrawFeeFactor = withdrawFeeFactorMax; // withdraw fee, 0% of withdraw amount, return to user pool

        DataTypes.ReserveConfigurationMap memory configuration = getLendingPool().getConfiguration(_wantAddress);
        uint _decimals = configuration.getDecimals();
        require(_decimals == IERC20Metadata(_wantAddress).decimals(), "decimal"); // should ajust the scale if not equal.

        decimal = uint8(_decimals);
    }

    receive() external payable {}

    function decimals() public view virtual override returns (uint8) {
        return decimal;
    }

    function getLendingPool() internal view returns(IPool _lendingPool){
        return IPool(poolAddressProvider.getPool());
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
        IERC20Permit(wantAddress).permit(msg.sender, address(this), _wantAmt, deadline, v, r, s);
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

    function getNetAssetValue(IPool _lendingPool) public view returns(uint){
        DataTypes.ReserveData memory reserve = _lendingPool.getReserveData(wantAddress);
        uint lTokenBalance = IERC20(reserve.aTokenAddress).balanceOf(address(this));
        uint variableDebt = IERC20(reserve.variableDebtTokenAddress).balanceOf(address(this));
        uint wantBalance = IERC20(wantAddress).balanceOf(address(this));
        return lTokenBalance + wantBalance - variableDebt;
    }

    function farm() external virtual nonReentrant whenNotPaused{
        _farm();
    }

    function _farm() internal virtual {
        address _wantAddress = wantAddress;
        uint256 wantAmt = IERC20(_wantAddress).balanceOf(address(this));
        if(wantAmt > 0){
            IPool _lendingPool = getLendingPool();
            IERC20(_wantAddress).safeIncreaseAllowance(address(_lendingPool), wantAmt);
            _lendingPool.supply(_wantAddress, wantAmt, address(this), referralCode);
        }
    }


    function withdraw(address _userAddress, uint256 _shareAmount)
        external
        virtual
        nonReentrant
        returns (uint)
    {
        uint _userShareBalance = balanceOf(msg.sender);
        uint _shareAmountFinal = _userShareBalance < _shareAmount ? _userShareBalance : _shareAmount;

        IPool _lendingPool = getLendingPool();
        uint _wantAmt = getNetAssetValue(_lendingPool) * _shareAmountFinal / totalSupply();
        if (withdrawFeeFactor < withdrawFeeFactorMax) {
            _wantAmt = _wantAmt * withdrawFeeFactor / withdrawFeeFactorMax;
        }
        require(_wantAmt > 0, "_wantAmt == 0");
        burn(_shareAmountFinal);

        return _lendingPool.withdraw(wantAddress, _wantAmt, _userAddress);
    }

    // 1. Harvest farm tokens
    // 2. Converts farm tokens into want tokens
    // 3. Deposits want tokens
    function earn(address _earnedAddress) external virtual nonReentrant whenNotPaused{
        _earn(_earnedAddress);
        _farm();
    }

    function _earn(address _earnedAddress) internal virtual  {
        // Harvest farm tokens
        address _wantAddress = wantAddress;
        DataTypes.ReserveData memory _reserve = getLendingPool().getReserveData(_wantAddress);
        address[] memory _t = new address[](2);
        _t[0] = _reserve.aTokenAddress;
        _t[1] = _reserve.variableDebtTokenAddress;
        incentivesController.claimRewardsToSelf(_t, type(uint).max, _earnedAddress);

        if (_earnedAddress == wethAddress) {
            _wrapETH();
        }

        uint256 earnedAmt = IERC20(_earnedAddress).balanceOf(address(this));
        //skip earning if earnedAmt too small.
        if(earnedAmt < 10000){
            return;
        }

        earnedAmt = buyBack(earnedAmt, _earnedAddress);

        // Converts farm tokens into want tokens
        if (_wantAddress == _earnedAddress) {
            return;
        }

        IZap _zap = zap;
        IERC20(_earnedAddress).safeIncreaseAllowance(address(_zap), earnedAmt);
        _zap.zapInToken(_earnedAddress, earnedAmt, _wantAddress);
    }

    //convert earned to AVA-WETH LP
    function buyBack(uint256 _earnedAmt, address _earnedAddress) internal virtual returns (uint256 remainAmt) {
        if (buyBackRate <= 0) {
            return _earnedAmt;
        }

        uint256 _buyBackAmt = _earnedAmt * buyBackRate / buyBackRateMax;
        if(interimBuybackHolder != address(0)){
            IERC20(_earnedAddress).transfer(interimBuybackHolder, _buyBackAmt);
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

    function setInterimBuybackHolder(address _interimBuybackHolder) external virtual onlyOwner
    {
        interimBuybackHolder = _interimBuybackHolder;
        emit SetInterimBuybackHolder(_interimBuybackHolder);
    }

    //handle unexpected airdrop rewards.
    function approveRewardHanlder(address _rewardHandler, address _rewardToken) external virtual onlyOwner{
        require(_rewardHandler != address(0), "address 0");
        require(_rewardToken != wantAddress, "wantAddress");
        DataTypes.ReserveData memory rd = getLendingPool().getReserveData(wantAddress);
        require(_rewardToken != rd.aTokenAddress, "aTokenAddress");

        IERC20(_rewardToken).safeIncreaseAllowance(_rewardHandler, type(uint).max);
        emit ApproveRewardHanlder(_rewardHandler, _rewardToken);
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

    function setZap(IZap _zap) external onlyOwner{
        zap = _zap;
        emit ZapSet(address(_zap));
    }


    function depositNative(address _userAddress)
        external
        payable
        virtual
        nonReentrant
        whenNotPaused
    {
        require(wantAddress == wethAddress, "native only");
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

    function withdrawNative(address _userAddress, uint256 _shareAmount)
        external
        virtual
        nonReentrant
        returns (uint)
    {
        require(wantAddress == wethAddress, "native only");
        uint _userShareBalance = balanceOf(msg.sender);
        uint _shareAmountFinal = _userShareBalance < _shareAmount ? _userShareBalance : _shareAmount;

        IPool _lendingPool = getLendingPool();
        uint _wantAmt = getNetAssetValue(_lendingPool) * _shareAmountFinal / totalSupply();
        if (withdrawFeeFactor < withdrawFeeFactorMax) {
            _wantAmt = _wantAmt * withdrawFeeFactor / withdrawFeeFactorMax;
        }
        require(_wantAmt > 0, "_wantAmt == 0");
        burn(_shareAmountFinal);

        _lendingPool.withdraw(wantAddress, _wantAmt, address(this));

        IWETH(wethAddress).withdraw(_wantAmt);
        (bool success, ) = _userAddress.call{value: _wantAmt}(new bytes(0));
        require(success, 'TRANSFER_FAILED');
        return _wantAmt;
    }

}
