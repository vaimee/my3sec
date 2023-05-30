// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "../common/access/HubControllable.sol";
import "../common/interfaces/IEnergyWallet.sol";

/**
 * @title EnergyWallet contract
 * @dev This is the implementation of the Energy Wallet.
 */
contract EnergyWallet is IEnergyWallet, HubControllable {
    using EnumerableMap for EnumerableMap.UintToUintMap;

    mapping(uint256 => uint256) private _totalEnergy;
    mapping(uint256 => uint256) private _allocatedEnergy;
    mapping(uint256 => uint256) private _receivedEnergy;
    mapping(uint256 => EnumerableMap.UintToUintMap) private _energyAllocationMap;
    mapping(uint256 => EnumerableMap.UintToUintMap) private _reverseEnergyAllocationMap;

    /**
     * Energy Wallet Contract Constructor.
     */
    constructor(address hub) HubControllable(hub) {}

    /// @inheritdoc IEnergyWallet
    function totalEnergyOf(uint256 profileId) external view override returns (uint256) {
        return _totalEnergy[profileId];
    }

    /// @inheritdoc IEnergyWallet
    function freeEnergyOf(uint256 profileId) public view override returns (uint256) {
        return _totalEnergy[profileId] - _allocatedEnergy[profileId];
    }

    /// @inheritdoc IEnergyWallet
    function allocatedEnergyOf(uint256 profileId) external view override returns (uint256) {
        return _allocatedEnergy[profileId];
    }

    /// @inheritdoc IEnergyWallet
    function receivedEnergyOf(uint256 profileId) external view override returns (uint256) {
        return _receivedEnergy[profileId];
    }

    /// @inheritdoc IEnergyWallet
    function energizedBy(uint256 profileId, uint256 index) external view override returns (uint256, uint256) {
        return _energyAllocationMap[profileId].at(index);
    }

    /// @inheritdoc IEnergyWallet
    function energizersOf(uint256 profileId, uint256 index) external view override returns (uint256, uint256) {
        return _reverseEnergyAllocationMap[profileId].at(index);
    }

    /// @inheritdoc IEnergyWallet
    function totalEnergizedBy(uint256 profileId) external view returns (uint256) {
        return _energyAllocationMap[profileId].length();
    }

    /// @inheritdoc IEnergyWallet
    function totalEnergizersOf(uint256 profileId) external view returns (uint256) {
        return _reverseEnergyAllocationMap[profileId].length();
    }

    /// @inheritdoc IEnergyWallet
    function giveEnergy(uint256 from, uint256 to, uint256 amount) external override onlyHub {
        require(to != from, "Cannot give energy to yourself");
        require(amount <= freeEnergyOf(from), "Insufficient energy");

        _allocatedEnergy[from] += amount;
        (, uint256 currentAllocatedEnergy) = _energyAllocationMap[from].tryGet(to);
        uint256 nextAllocatedEnergy = currentAllocatedEnergy + amount;
        _energyAllocationMap[from].set(to, nextAllocatedEnergy);
        _reverseEnergyAllocationMap[to].set(from, nextAllocatedEnergy);

        _receivedEnergy[to] += amount;
    }

    /// @inheritdoc IEnergyWallet
    function removeEnergy(uint256 from, uint256 to, uint256 amount) external override onlyHub {
        require(_energyAllocationMap[to].contains(from), "Profile not referenced");
        require(amount <= _energyAllocationMap[to].get(from), "Exceeded given energy");

        _receivedEnergy[from] -= amount;
        uint256 nextAllocatedEnergy = _energyAllocationMap[to].get(from) - amount;
        _energyAllocationMap[to].set(from, nextAllocatedEnergy);
        _reverseEnergyAllocationMap[from].set(to, nextAllocatedEnergy);

        _allocatedEnergy[to] -= amount;
    }

    /// @inheritdoc IEnergyWallet
    function createEnergyFor(uint256 profileId, uint256 amount) external override onlyHub {
        _totalEnergy[profileId] += amount;
    }

    /// @inheritdoc IEnergyWallet
    function destroyEnergyFor(uint256 profileId, uint256 amount) external override onlyHub {
        require(amount <= freeEnergyOf(profileId), "Exceeded free energy");
        require(amount <= _totalEnergy[profileId], "Exceeded total energy");
        _totalEnergy[profileId] -= amount;
    }
}
