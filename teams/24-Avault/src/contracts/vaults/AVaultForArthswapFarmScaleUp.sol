// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IArthswapFarm.sol";
import "../interfaces/IPancakeRouter02.sol";
import "../interfaces/IWETH.sol";
import "../interfaces/IDistributable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract AVaultForArthswapFarmScaleUp is Ownable, ReentrancyGuard, Pausable, ERC20Permit {
    // Maximises yields in pancakeswap

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public immutable farmContractAddress; // address of farm, eg, PCS, Thugs etc.
    uint256 public immutable pid; // pid of pool in farmContractAddress
    address public immutable wantAddress;
    address public immutable token0Address;
    address public immutable token1Address;
    address public immutable earnedAddress;
    address public uniRouterAddress; // uniswap, pancakeswap etc, earnedToken <-> wantToken
    address public wethToAvaRouterAddress; // earnedToken -> AVaultToken

    address public immutable wethAddress;
    address public immutable AVAAddress;

    uint256 public immutable scale;

    uint256 public wantLockedTotal; // this contract's last WantToken amount

    uint256 public buyBackRate;
    uint256 public constant buyBackRateMax = 10000; // 100 = 1%
    uint256 public constant buyBackRateUL = 800;
    IDistributable public buyBackAddress;

    uint256 public withdrawFeeFactor;
    uint256 public constant withdrawFeeFactorMax = 10000;
    uint256 public constant withdrawFeeFactorLL = 9950; // 0.5% is the max fee settable. LL = lowerlimit

    uint256 public slippageFactor;
    uint256 public constant slippageFactorUL = 995;

    address[] public earnedToWethPath;
    address[] public wethToAVAPath;
    address[] public earnedToToken0Path;
    address[] public earnedToToken1Path;
    address[] public token0ToEarnedPath;
    address[] public token1ToEarnedPath;

    address public interimBuybackHolder;

    event SetSettings(
        uint256 _withdrawFeeFactor,
        uint256 _buyBackRate,
        uint256 _slippageFactor
    );

    event SetUniRouterAddress(address _uniRouterAddress);
    event SetWethToAvaRouterAddress(address _wethToAvaRouterAddress);
    event SetBuyBackAddress(IDistributable _buyBackAddress);
    event SetInterimBuybackHolder(address _interimBuybackHolder);
    event PathsUpdated();
    event ApproveRewardHanlder(address _rewardHandler, address _rewardToken);


    constructor(
        address[] memory _addresses,
        uint256 _pid,
        address[] memory _earnedToWethPath,
        address[] memory _wethToAVAPath,
        address[] memory _earnedToToken0Path,
        address[] memory _earnedToToken1Path,
        address[] memory _token0ToEarnedPath,
        address[] memory _token1ToEarnedPath,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint _scale
    ) ERC20(_tokenName, _tokenSymbol) ERC20Permit(_tokenName){
        wethAddress = _wethToAVAPath[0];
        AVAAddress = _wethToAVAPath[_wethToAVAPath.length - 1];
        wantAddress = _addresses[0];
        token0Address = _token0ToEarnedPath[0];
        token1Address = _token1ToEarnedPath[0];
        earnedAddress = _earnedToToken0Path[0];

        farmContractAddress = _addresses[1];
        pid = _pid;

        uniRouterAddress = _addresses[2];
        wethToAvaRouterAddress = _addresses[3];
        
        earnedToWethPath = _earnedToWethPath;
        wethToAVAPath = _wethToAVAPath;
        earnedToToken0Path = _earnedToToken0Path;
        earnedToToken1Path = _earnedToToken1Path;
        token0ToEarnedPath = _token0ToEarnedPath;
        token1ToEarnedPath = _token1ToEarnedPath;

        buyBackAddress = IDistributable(_addresses[4]);
        interimBuybackHolder = _addresses[5];

        buyBackRate = 300; // 3% of eanred amount, compound fee - handle by Distributor
        withdrawFeeFactor = 9998; // 0.02% of withdraw amount, withdraw fee - return back to user pool
        slippageFactor = 950; // 5% of compound swap slippage tolerance (could be zero?)

        scale = _scale;
    }

    receive() external payable {}

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
        IERC20(wantAddress).safeTransferFrom(
            address(msg.sender),
            address(this),
            _wantAmt
        );

        uint256 sharesAdded;
        if (wantLockedTotal > 0 && totalSupply() > 0) {
            sharesAdded = _wantAmt * totalSupply() / wantLockedTotal;
        }else{
            sharesAdded = _wantAmt * scale;
        }
        _mint(_userAddress, sharesAdded);

        _farm();

        updateWantLockedTotal();
    }

    function farm() external virtual nonReentrant {
        _farm();
        updateWantLockedTotal();
    }

    function _farm() internal virtual {
        uint256 wantAmt = IERC20(wantAddress).balanceOf(address(this));
        if(wantAmt > 0){
            IERC20(wantAddress).safeIncreaseAllowance(farmContractAddress, wantAmt);

            IArthswapFarm(farmContractAddress).deposit(pid, wantAmt, address(this));
        }
    }

    function updateWantLockedTotal() internal virtual{
        (uint _poolAmt,) = IArthswapFarm(farmContractAddress).userInfos(pid, address(this));
        uint _thisAmt = IERC20(wantAddress).balanceOf(address(this));
        wantLockedTotal = _thisAmt + _poolAmt;
    }

    function _unfarm(uint256 _wantAmt) internal virtual {
        IArthswapFarm(farmContractAddress).withdraw(pid, _wantAmt, address(this));
    }

    function withdraw(address _userAddress, uint256 _shareAmount)
        external
        virtual
        nonReentrant
    {
        uint _wantAmt = wantLockedTotal * _shareAmount / totalSupply();
        if (withdrawFeeFactor < withdrawFeeFactorMax) {
            _wantAmt = _wantAmt.mul(withdrawFeeFactor).div(
                withdrawFeeFactorMax
            );
        }
        require(_wantAmt > 0, "_wantAmt == 0");
        burn(_shareAmount);

        uint256 wantAmt = IERC20(wantAddress).balanceOf(address(this));
        if(wantAmt < _wantAmt){
            _unfarm(_wantAmt - wantAmt);
            wantAmt = IERC20(wantAddress).balanceOf(address(this));
        }

        if (_wantAmt > wantAmt) {
            _wantAmt = wantAmt;
        }

        IERC20(wantAddress).safeTransfer(_userAddress, _wantAmt);

        updateWantLockedTotal();
    }

    function emergencyWithdraw()
        external
        virtual
        onlyOwner
    {
        IArthswapFarm(farmContractAddress).emergencyWithdraw(pid, address(this));
    }

    // 1. Harvest farm tokens
    // 2. Converts farm tokens into want tokens
    // 3. Deposits want tokens
    function earn() external virtual nonReentrant whenNotPaused{
        _earn();
        _farm();
        updateWantLockedTotal();
    }

    function _earn() internal virtual  {
        // Harvest farm tokens
        IArthswapFarm(farmContractAddress).harvest(pid, address(this));

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
        if (wantAddress == _earnedAddress) {
            return;
        }

        address _uniRouterAddress = uniRouterAddress;
        IERC20(_earnedAddress).safeApprove(_uniRouterAddress, 0);
        IERC20(_earnedAddress).safeIncreaseAllowance(
            _uniRouterAddress,
            earnedAmt
        );

        if (_earnedAddress != token0Address) {
            // Swap half earned to token0
            _safeSwap(
                _uniRouterAddress,
                earnedAmt.div(2),
                slippageFactor,
                earnedToToken0Path,
                address(this),
                block.timestamp.add(600)
            );
        }

        if (_earnedAddress != token1Address) {
            // Swap half earned to token1
            _safeSwap(
                _uniRouterAddress,
                earnedAmt.div(2),
                slippageFactor,
                earnedToToken1Path,
                address(this),
                block.timestamp.add(600)
            );
        }

        // Get want tokens, ie. add liquidity
        uint256 token0Amt = IERC20(token0Address).balanceOf(address(this));
        uint256 token1Amt = IERC20(token1Address).balanceOf(address(this));
        if (token0Amt > 0 && token1Amt > 0) {
            IERC20(token0Address).safeIncreaseAllowance(
                _uniRouterAddress,
                token0Amt
            );
            IERC20(token1Address).safeIncreaseAllowance(
                _uniRouterAddress,
                token1Amt
            );
            IPancakeRouter02(_uniRouterAddress).addLiquidity(
                token0Address,
                token1Address,
                token0Amt,
                token1Amt,
                0,
                0,
                address(this),
                block.timestamp.add(600)
            );
        }
    }

    //convert earned to AVA-WETH LP
    function buyBack(uint256 _earnedAmt) internal virtual returns (uint256 remainAmt) {
        if (buyBackRate <= 0) {
            return _earnedAmt;
        }

        //gas saving
        address _earnedAddress = earnedAddress;
        address _wethAddress = wethAddress;
        address _AVAAddress = AVAAddress;
        address _wethToAvaRouterAddress = wethToAvaRouterAddress;

        uint256 buyBackAmt = _earnedAmt.mul(buyBackRate).div(buyBackRateMax);
        if(interimBuybackHolder != address(0)){
            IERC20(_earnedAddress).transfer(interimBuybackHolder, buyBackAmt);
        }else{
            //convert all to WETH
            if (_earnedAddress != _wethAddress){
                if(_earnedAddress == _AVAAddress){
                    buyBackAmt = buyBackAmt / 2;
                }
                address _uniRouterAddress = uniRouterAddress;
                IERC20(_earnedAddress).safeIncreaseAllowance(
                    _uniRouterAddress,
                    buyBackAmt
                );

                _safeSwap(
                    _uniRouterAddress,
                    buyBackAmt,
                    slippageFactor,
                    earnedToWethPath,
                    address(this),
                    block.timestamp.add(600)
                );
            }
            _wrapETH();

            //convert half WETH to AVA
            uint wethAmt = IERC20(_wethAddress).balanceOf(address(this));
            if (_earnedAddress != _AVAAddress) {
                wethAmt = wethAmt / 2;
                IERC20(_earnedAddress).safeIncreaseAllowance(
                    _wethToAvaRouterAddress,
                    wethAmt
                );

                _safeSwap(
                    _wethToAvaRouterAddress,
                    wethAmt,
                    slippageFactor,
                    wethToAVAPath,
                    address(this),
                    block.timestamp.add(600)
                );
            }

            //add liquidity
            uint256 wethAmtFinal = IERC20(_wethAddress).balanceOf(address(this));
            uint256 avaAmtFinal = IERC20(_AVAAddress).balanceOf(address(this));
            if (wethAmtFinal > 0 && avaAmtFinal > 0) {
                IDistributable _buyBackAddress = buyBackAddress;
                IERC20(_wethAddress).safeIncreaseAllowance(
                    _wethToAvaRouterAddress,
                    wethAmtFinal
                );
                IERC20(_AVAAddress).safeIncreaseAllowance(
                    _wethToAvaRouterAddress,
                    avaAmtFinal
                );
                IPancakeRouter02(_wethToAvaRouterAddress).addLiquidity(
                    _wethAddress,
                    _AVAAddress,
                    wethAmtFinal,
                    avaAmtFinal,
                    0,
                    0,
                    address(_buyBackAddress),
                    block.timestamp.add(600)
                );

                _buyBackAddress.distributeRewards();
            }
        }
        
        return IERC20(_earnedAddress).balanceOf(address(this));
    }

    function convertDustToEarned() public virtual whenNotPaused {
        // Converts dust tokens into earned tokens, which will be reinvested on the next _earn().

        // Converts token0 dust (if any) to earned tokens
        uint256 token0Amt = IERC20(token0Address).balanceOf(address(this));
        if (token0Address != earnedAddress && token0Amt > 0) {
            IERC20(token0Address).safeIncreaseAllowance(
                uniRouterAddress,
                token0Amt
            );

            // Swap all dust tokens to earned tokens
            _safeSwap(
                uniRouterAddress,
                token0Amt,
                slippageFactor,
                token0ToEarnedPath,
                address(this),
                block.timestamp.add(600)
            );
        }

        // Converts token1 dust (if any) to earned tokens
        uint256 token1Amt = IERC20(token1Address).balanceOf(address(this));
        if (token1Address != earnedAddress && token1Amt > 0) {
            IERC20(token1Address).safeIncreaseAllowance(
                uniRouterAddress,
                token1Amt
            );

            // Swap all dust tokens to earned tokens
            _safeSwap(
                uniRouterAddress,
                token1Amt,
                slippageFactor,
                token1ToEarnedPath,
                address(this),
                block.timestamp.add(600)
            );
        }
    }

    function pause() public virtual onlyOwner {
        _pause();
    }

    function unpause() public virtual onlyOwner {
        _unpause();
    }

    function setSettings(
        uint256 _withdrawFeeFactor,
        uint256 _buyBackRate,
        uint256 _slippageFactor
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

        require(
            _slippageFactor <= slippageFactorUL,
            "_slippageFactor too high"
        );
        slippageFactor = _slippageFactor;

        emit SetSettings(
            _withdrawFeeFactor,
            _buyBackRate,
            _slippageFactor
        );
    }

    function setPaths(
        address[] memory _earnedToWethPath,
        address[] memory _wethToAVAPath,
        address[] memory _earnedToToken0Path,
        address[] memory _earnedToToken1Path,
        address[] memory _token0ToEarnedPath,
        address[] memory _token1ToEarnedPath
    ) external virtual onlyOwner{
        require(earnedToWethPath[0] == _earnedToWethPath[0] && earnedToWethPath[earnedToWethPath.length - 1] == _earnedToWethPath[_earnedToWethPath.length - 1], "earnedToWethPath");
        require(wethToAVAPath[0] == _wethToAVAPath[0] && wethToAVAPath[wethToAVAPath.length - 1] == _wethToAVAPath[_wethToAVAPath.length - 1], "wethToAVAPath");
        require(earnedToToken0Path[0] == _earnedToToken0Path[0] && earnedToToken0Path[earnedToToken0Path.length - 1] == _earnedToToken0Path[_earnedToToken0Path.length - 1], "earnedToToken0Path");
        require(earnedToToken1Path[0] == _earnedToToken1Path[0] && earnedToToken1Path[earnedToToken1Path.length - 1] == _earnedToToken1Path[_earnedToToken1Path.length - 1], "earnedToToken1Path");
        require(token0ToEarnedPath[0] == _token0ToEarnedPath[0] && token0ToEarnedPath[token0ToEarnedPath.length - 1] == _token0ToEarnedPath[_token0ToEarnedPath.length - 1], "token0ToEarnedPath");
        require(token1ToEarnedPath[0] == _token1ToEarnedPath[0] && token1ToEarnedPath[token1ToEarnedPath.length - 1] == _token1ToEarnedPath[_token1ToEarnedPath.length - 1], "token1ToEarnedPath");
        earnedToWethPath = _earnedToWethPath;
        wethToAVAPath = _wethToAVAPath;
        earnedToToken0Path = _earnedToToken0Path;
        earnedToToken1Path = _earnedToToken1Path;
        token0ToEarnedPath = _token0ToEarnedPath;
        token1ToEarnedPath = _token1ToEarnedPath;
        emit PathsUpdated();
    }

    function setUniRouterAddress(address _uniRouterAddress)
        external
        virtual
        onlyOwner
    {
        uniRouterAddress = _uniRouterAddress;
        emit SetUniRouterAddress(_uniRouterAddress);
    }

    function setWethToAvaRouterAddress(address _wethToAvaRouterAddress)
        external
        virtual
        onlyOwner
    {
        wethToAvaRouterAddress = _wethToAvaRouterAddress;
        emit SetWethToAvaRouterAddress(_wethToAvaRouterAddress);
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
        require(_rewardToken != token0Address, "token0");
        require(_rewardToken != token1Address, "token1");
        require(_rewardToken != wantAddress, "wantAddress");
        require(_rewardToken != earnedAddress, "earnedAddress");

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

    function _safeSwap(
        address _uniRouterAddress,
        uint256 _amountIn,
        uint256 _slippageFactor,
        address[] memory _path,
        address _to,
        uint256 _deadline
    ) internal virtual {
        uint256[] memory amounts =
            IPancakeRouter02(_uniRouterAddress).getAmountsOut(_amountIn, _path);
        uint256 amountOut = amounts[amounts.length.sub(1)];

        IPancakeRouter02(_uniRouterAddress)
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
            _amountIn,
            amountOut.mul(_slippageFactor).div(1000),
            _path,
            _to,
            _deadline
        );
    }

    function burn(uint _amount) public {
        _burn(_msgSender(), _amount);
    }

}
