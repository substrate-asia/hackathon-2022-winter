// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../interfaces/IAVault.sol";

contract CompoundAggregator{

    event earnError(address _vault, string _reason);
    event earnPanic(address _vault, uint _errorCode);
    event earnFail(address _vault, bytes _lowLevelData);

    event ajustLTVError(address _vault, string _reason);
    event ajustLTVPanic(address _vault, uint _errorCode);
    event ajustLTVFail(address _vault, bytes _lowLevelData);

    function batchEarn(address[] calldata _vaults) external{
        uint _l = _vaults.length;
        for(uint i = 0; i < _l; i++){
            IAVault _vault = IAVault(_vaults[i]);
            try _vault.earn() {
                
            } catch Error(string memory reason) {
                // This is executed in case
                // revert was called inside getData
                // and a reason string was provided.
                emit earnError(_vaults[i], reason);
            } catch Panic(uint errorCode) {
                // This is executed in case of a panic,
                // i.e. a serious error like division by zero
                // or overflow. The error code can be used
                // to determine the kind of error.
                emit earnPanic(_vaults[i], errorCode);
            } catch (bytes memory lowLevelData) {
                // This is executed in case revert() was used.
                emit earnFail(_vaults[i], lowLevelData);
            }
        }
    }

    function batchAjustLTV(address[] calldata _vaults) external{
        uint _l = _vaults.length;
        for(uint i = 0; i < _l; i++){
            IAVault _vault = IAVault(_vaults[i]);
            try _vault.ajustToTargetLTV() {
                
            } catch Error(string memory reason) {
                // This is executed in case
                // revert was called inside getData
                // and a reason string was provided.
                emit earnError(_vaults[i], reason);
            } catch Panic(uint errorCode) {
                // This is executed in case of a panic,
                // i.e. a serious error like division by zero
                // or overflow. The error code can be used
                // to determine the kind of error.
                emit earnPanic(_vaults[i], errorCode);
            } catch (bytes memory lowLevelData) {
                // This is executed in case revert() was used.
                emit earnFail(_vaults[i], lowLevelData);
            }
        }
    }
}