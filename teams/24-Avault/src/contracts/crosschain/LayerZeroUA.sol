// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/crosschain/ILayerZeroReceiver.sol";
import "../interfaces/crosschain/ILayerZeroUserApplicationConfig.sol";
import "../interfaces/crosschain/ILayerZeroEndpoint.sol";
import "../interfaces/crosschain/IModule.sol";
import "../interfaces/crosschain/UserOperation.sol";

/*
 * a generic LzReceiver implementation
 */
contract LayerZeroUA is Ownable, ILayerZeroReceiver, ILayerZeroUserApplicationConfig {
    ILayerZeroEndpoint public immutable lzEndpoint;
    IModule public immutable module;
    uint16 public immutable lzChainId; 

    address public precrime;
    uint public minGasLimit;

    event SetPrecrime(address precrime);
    event SetMinGasLimit(uint _minGasLimit);

    constructor(address _endpoint, address _module, uint16 _lzChainId) {
        lzEndpoint = ILayerZeroEndpoint(_endpoint);
        module = IModule(_module);
        lzChainId = _lzChainId;
        minGasLimit = 140000;
    }

    function lzReceive(uint16, bytes calldata, uint64, bytes calldata _payload) external override {
        // lzReceive must be called by the endpoint for security
        require(_msgSender() == address(lzEndpoint), "LzApp: invalid endpoint caller");

        (address srcAddress, UserOperation memory uo) = abi.decode(_payload, (address, UserOperation));
        module.exec(srcAddress, uo);
    }

    /**
     * @param _dstChainId: refer to https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids
     * @param _payload: abi.encode(srcAddress, uo);
     * @param _zroPaymentAddress: set to address(0x0) if not paying in ZRO (LayerZero Token)
     * @param _adapterParams: refer to https://layerzero.gitbook.io/docs/evm-guides/advanced/relayer-adapter-parameters
     * @dev about the value: refer to how to estimate destination gas fee: https://layerzero.gitbook.io/docs/evm-guides/code-examples/estimating-message-fees#call-estimatefees-to-return-a-tuple-containing-the-cross-chain-message-fee.
     */ 
    function lzSend(uint16 _dstChainId, address _destAddress, bytes memory _payload, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams) external payable {
        if(_dstChainId == lzChainId){
            if(msg.value > 0){
                payable(_msgSender()).transfer(msg.value);
            }
            (address srcAddress, UserOperation memory uo) = abi.decode(_payload, (address, UserOperation));
            module.exec(srcAddress, uo);
        }else{
            require(_getGasLimit(_adapterParams) > minGasLimit, "low gas param");
            lzEndpoint.send{value: msg.value}(_dstChainId, abi.encodePacked(_destAddress, address(this)), _payload, _refundAddress, _zroPaymentAddress, _adapterParams);
        }
    }

    function _getGasLimit(bytes memory _adapterParams) internal pure virtual returns (uint gasLimit) {
        require(_adapterParams.length >= 34, "LzApp: invalid adapterParams");
        assembly {
            gasLimit := mload(add(_adapterParams, 34))
        }
    }

    //---------------------------UserApplication config----------------------------------------
    function getConfig(uint16 _version, uint16 _chainId, address, uint _configType) external view returns (bytes memory) {
        return lzEndpoint.getConfig(_version, _chainId, address(this), _configType);
    }

    // generic config for LayerZero user Application
    function setConfig(uint16 _version, uint16 _chainId, uint _configType, bytes calldata _config) external override onlyOwner {
        lzEndpoint.setConfig(_version, _chainId, _configType, _config);
    }

    function setSendVersion(uint16 _version) external override onlyOwner {
        lzEndpoint.setSendVersion(_version);
    }

    function setReceiveVersion(uint16 _version) external override onlyOwner {
        lzEndpoint.setReceiveVersion(_version);
    }

    function forceResumeReceive(uint16 _srcChainId, bytes calldata _srcAddress) external override onlyOwner {
        lzEndpoint.forceResumeReceive(_srcChainId, _srcAddress);
    }

    function setPrecrime(address _precrime) external onlyOwner {
        precrime = _precrime;
        emit SetPrecrime(_precrime);
    }

    function setMinGasLimit(uint _minGasLimit) external onlyOwner {
        minGasLimit = _minGasLimit;
        emit SetMinGasLimit(_minGasLimit);
    }

}
