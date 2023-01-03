// SPDX-License-Identifier: GLP-v3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/crosschain/IStargateRouter.sol";
import "../interfaces/crosschain/IStargateReceiver.sol";
import "../interfaces/crosschain/UserOperation.sol";
import "../interfaces/crosschain/IStargateEthVault.sol";
import "../interfaces/crosschain/IModule.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '../libraries/BytesLib.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "../interfaces/crosschain/PermitStruct.sol";

contract AvaultRouter is IStargateReceiver, Ownable {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    mapping (uint=>bytes) public chainIdToSGReceiver; // destChainId => sgReceiver, constrain for safety

    address public immutable SGETH;
    address public immutable STARGATE_ROUTER;
    ISwapRouter public immutable UNISWAP_ROUTER;

    address public immutable MODULE;

    uint private constant ADDRESS_ENCODE_LENGTH = 32;
    uint private constant ADDR_SIZE = 20;
    uint private constant ETH_POOL_ID = 13;
    uint private constant MAX_SLIPPAGE = 10000;

    uint private constant UNISWAP_MIN_OUTPUT = 100000; // refer to 0.1 USDC

    event EXEC_ERROR(address srcAddress, string reason);
    event EXEC_PANIC(address srcAddress, uint errorCode);
    event EXEC_REVERT(address srcAddress, bytes lowLevelData);
    event SET_SGRECEIVER(uint indexed _chainId, address _sgReceiver);

    constructor(address _SGETH, address _STARGATE_ROUTER, ISwapRouter _UNISWAP_ROUTER, address _MODULE){
        SGETH = _SGETH;
        STARGATE_ROUTER = _STARGATE_ROUTER;
        UNISWAP_ROUTER = _UNISWAP_ROUTER;
        MODULE = _MODULE;
    }

    // this contract needs to accept ETH
    receive() external payable {}

    function crossAssetCallNative(
        uint dstChainId,                      // Stargate/LayerZero chainId
        address payable _refundAddress,                     // message refund address if overpaid
        uint amountIn,                    // exact amount of native token coming in on source
        uint _maxSlippagePercent,              //  bridge slippage, 1 = 0.01%. Could be set arbitrary
        uint _dstGasForCall,             // gas for destination Stargate Router (including sgReceive). get from Config.
        bytes memory payload            // (address _srcAddress, UserOperation memory _uo) = abi.decode(_payload, (address, UserOperation));
    )external payable{
        require(amountIn > 0, "amountIn must be greater than 0");
        require(msg.value > amountIn, "stargate requires fee to pay crosschain message");
        
        // wrap the ETH into SGETH
        IStargateEthVault(SGETH).deposit{value: amountIn}();
        IStargateEthVault(SGETH).approve(STARGATE_ROUTER, amountIn);

        // messageFee is the remainder of the msg.value after wrap
        // STARGATE_ROUTER.quoteLayerZeroFee(..._dstGasForCall...)
        uint256 messageFee = msg.value - amountIn;
        // compose a stargate swap() using the WETH that was just wrapped
        bytes memory _sgReceiver = chainIdToSGReceiver[dstChainId];
        require(_sgReceiver.length > 0, "invalid chainId");
        IStargateRouter(STARGATE_ROUTER).swap{value: messageFee}(
            uint16(dstChainId),                        // destination Stargate chainId
            ETH_POOL_ID,                             // WETH Stargate poolId on source
            ETH_POOL_ID,                             // WETH Stargate poolId on destination
            _refundAddress,                     // message refund address if overpaid
            amountIn,                          // the amount in Local Decimals to swap()
            amountIn * (MAX_SLIPPAGE - _maxSlippagePercent) / MAX_SLIPPAGE,  // < amountIn - StargateFeeLibraryV02.getFees(...)
            IStargateRouter.lzTxObj(_dstGasForCall, 0, ""),
            _sgReceiver,         // destination address, the sgReceive() implementer
            payload                           // empty payload, since sending to EOA
        );
        
    }

    function crossAssetCallWithPermit(
        bytes memory _path,             //uniswap exactIn path. e.g. abi.enodePacked(UNI, 0.3%, WETH, 0.05%, USDC) or abi.encodePacked(USDC)
        uint dstChainId,                      // Stargate/LayerZero chainId
        uint srcPoolId,                       // stargate poolId, scrToken should be USDC or USDT...
        uint dstPoolId,                       // stargate destination poolId, destToken could be USDC, USDT, BUSD or other stablecoin.
        address payable _refundAddress,                     // message refund address if overpaid
        uint amountIn,                    // exact amount of native token coming in on source
        uint _maxSlippagePercent,              //  1 = 0.01%. Could be set arbitrary
        uint _dstGasForCall,             // gas for destination Stargate Router (including sgReceive)
        bytes memory payload,        // (address _srcAddress, UserOperation memory _uo) = abi.decode(_payload, (address, UserOperation));
        PermitStruct calldata _permit
    ) external payable{
        IERC20Permit(_path.toAddress(0)).permit(msg.sender, address(this), amountIn, _permit.deadline, _permit.v, _permit.r, _permit.s);
        crossAssetCall(
            _path,             //uniswap exactIn path. e.g. abi.enodePacked(UNI, 0.3%, WETH, 0.05%, USDC) or abi.encodePacked(USDC)
            dstChainId,                      // Stargate/LayerZero chainId
            srcPoolId,                       // stargate poolId, scrToken should be USDC or USDT...
            dstPoolId,                       // stargate destination poolId, destToken could be USDC, USDT, BUSD or other stablecoin.
            _refundAddress,                     // message refund address if overpaid
            amountIn,                    // exact amount of native token coming in on source
            _maxSlippagePercent,              //  1 = 0.01%. Could be set arbitrary
            _dstGasForCall,             // gas for destination Stargate Router (including sgReceive)
            payload        // (address _srcAddress, UserOperation memory _uo) = abi.decode(_payload, (address, UserOperation));
        );
    }

    //-----------------------------------------------------------------------------------------------------------------------
    // bridge asset and calldata, DO NOT call this if you don't know its meaning.
    function crossAssetCall(
        bytes memory _path,             //uniswap exactIn path. e.g. abi.enodePacked(UNI, 0.3%, WETH, 0.05%, USDC) or abi.encodePacked(USDC)
        uint dstChainId,                      // Stargate/LayerZero chainId
        uint srcPoolId,                       // stargate poolId, scrToken should be USDC or USDT...
        uint dstPoolId,                       // stargate destination poolId, destToken could be USDC, USDT, BUSD or other stablecoin.
        address payable _refundAddress,                     // message refund address if overpaid
        uint amountIn,                    // exact amount of native token coming in on source
        uint _maxSlippagePercent,              //  1 = 0.01%. Could be set arbitrary
        uint _dstGasForCall,             // gas for destination Stargate Router (including sgReceive)
        bytes memory payload        // (address _srcAddress, UserOperation memory _uo) = abi.decode(_payload, (address, UserOperation));
    ) public payable{
        require(msg.value > 0, "gas fee required");
        require(amountIn > 0, 'amountIn == 0');

        address _srcBridgeToken;
        uint _srcBridgeTokenAmount;
        {
            // user approved token
            address _userToken = _path.toAddress(0);
            IERC20(_userToken).safeTransferFrom(msg.sender, address(this), amountIn);
            
            //swap if need
            _srcBridgeToken = _path.toAddress(_path.length - ADDR_SIZE);
            if(_srcBridgeToken != _userToken){
                IERC20(_userToken).safeIncreaseAllowance(address(UNISWAP_ROUTER), amountIn);
                ISwapRouter.ExactInputParams memory _t = ISwapRouter.ExactInputParams(_path, address(this), block.timestamp + 10, amountIn, UNISWAP_MIN_OUTPUT);
                _srcBridgeTokenAmount = UNISWAP_ROUTER.exactInput(_t);
            }else{
                _srcBridgeTokenAmount = amountIn;
            }
        }

        IERC20(_srcBridgeToken).approve(STARGATE_ROUTER, _srcBridgeTokenAmount);
        IStargateRouter.lzTxObj memory _lzTxObj = IStargateRouter.lzTxObj(_dstGasForCall, 0, "0x");
        bytes memory _sgReceiver = chainIdToSGReceiver[dstChainId];
        require(_sgReceiver.length > 0, "invalid chainId");
        // Stargate's Router.swap() function sends the tokens to the destination chain.
        IStargateRouter(STARGATE_ROUTER).swap{value:msg.value}(
            uint16(dstChainId),                                     // the destination chain id
            srcPoolId,                                      // the source Stargate poolId
            dstPoolId,                                      // the destination Stargate poolId
            _refundAddress,                            // refund adddress. if msg.sender pays too much gas, return extra eth
            _srcBridgeTokenAmount,                                   // total tokens to send to destination chain
            _srcBridgeTokenAmount * (MAX_SLIPPAGE - _maxSlippagePercent) / MAX_SLIPPAGE,  // minimum
            _lzTxObj,       // 500,000 for the sgReceive()
            _sgReceiver,         // destination address, the sgReceive() implementer
            payload                                            // bytes payload
        );
    }

    //-----------------------------------------------------------------------------------------------------------------------
    // sgReceive() - the destination contract must implement this function to receive the tokens and payload
    function sgReceive(uint16 /*_chainId*/, bytes memory /*_sgBridgeAddress*/, uint /*_nonce*/, address _token, uint amountLD, bytes memory _payload) override external {
        require(msg.sender == STARGATE_ROUTER, "only stargate router can call sgReceive!");

        address _srcAddress;
        UserOperation memory _uo;
        if(_payload.length <= ADDRESS_ENCODE_LENGTH){
            (_srcAddress) = abi.decode(_payload, (address));
        }else{
            (_srcAddress, _uo) = abi.decode(_payload, (address, UserOperation));
        }
        
        address _safe = IModule(MODULE).getSafe(_srcAddress);
        
        //transfer token to _safe
        if(_token == SGETH){
            (bool _success,) = _safe.call{value: amountLD}("");
            require(_success, "ETH transfer fail");
        }else{
            IERC20(_token).safeTransfer(_safe, amountLD);
        }

        if(_payload.length > ADDRESS_ENCODE_LENGTH){
            //try exec UO to _safe
            try IModule(MODULE).exec(_srcAddress, _uo){

            } catch Error(string memory reason) {
                // This is executed in case
                // revert was called inside execUO
                // and a reason string was provided.
                emit EXEC_ERROR(_srcAddress, reason);
            } catch Panic(uint errorCode) {
                // This is executed in case of a panic,
                // i.e. a serious error like division by zero
                // or overflow. The error code can be used
                // to determine the kind of error.
                emit EXEC_PANIC(_srcAddress, errorCode);
            } catch (bytes memory lowLevelData) {
                // This is executed in case revert() was used.
                emit EXEC_REVERT(_srcAddress, lowLevelData);
            }
        }
    }

    /**
     * @param _chainId: destination stargate chainId
     */
    function setSGReceiver(uint _chainId, address _sgReceiver) external onlyOwner{
        chainIdToSGReceiver[_chainId] = abi.encodePacked(_sgReceiver);
        emit SET_SGRECEIVER(_chainId, _sgReceiver);
    }

    function getStuckToken(address _token) external onlyOwner{
        if(_token == address(0)){
            //native token
            payable(msg.sender).transfer(address(this).balance);
        }else{
            IERC20(_token).safeTransfer(msg.sender, IERC20(_token).balanceOf(address(this)));
        }
    }
}