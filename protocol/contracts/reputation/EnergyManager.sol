// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "../interfaces/IEnergyManager.sol";

/**
 * @title EnergyManager contract
 * @dev This is the implementation of the Energy Manager.
 */
contract EnergyManager is IEnergyManager, Ownable {
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    mapping(address => uint256) private _totalEnergy;
    mapping(address => uint256) private _allocatedEnergy;
    mapping(address => uint256) private _receivedEnergy;
    mapping(address => EnumerableMap.AddressToUintMap) private _energyAllocationMap;
    mapping(address => EnumerableMap.AddressToUintMap) private _reverseEnergyAllocationMap;

    /**
     * Energy Manager Contract Constructor.
     */
    constructor() {}

    /// @inheritdoc IEnergyManager
    function totalEnergyOf(address account) external view override returns (uint256) {
        return _totalEnergy[account];
    }

    /// @inheritdoc IEnergyManager
    function freeEnergyOf(address account) public view override returns (uint256) {
        return _totalEnergy[account] - _allocatedEnergy[account];
    }

    /// @inheritdoc IEnergyManager
    function allocatedEnergyOf(address account) external view override returns (uint256) {
        return _allocatedEnergy[account];
    }

    /// @inheritdoc IEnergyManager
    function receivedEnergyOf(address account) external view override returns (uint256) {
        return _receivedEnergy[account];
    }

    /// @inheritdoc IEnergyManager
    function energizedBy(address account, uint256 index) external view override returns (address, uint256) {
        return _energyAllocationMap[account].at(index);
    }

    /// @inheritdoc IEnergyManager
    function energizersOf(address account, uint256 index) external view override returns (address, uint256) {
        return _reverseEnergyAllocationMap[account].at(index);
    }

    /// @inheritdoc IEnergyManager
    function totalEnergizedBy(address account) external view returns (uint256) {
        return _energyAllocationMap[account].length();
    }

    /// @inheritdoc IEnergyManager
    function totalEnergizersOf(address account) external view returns (uint256) {
        return _reverseEnergyAllocationMap[account].length();
    }

    /// @inheritdoc IEnergyManager
    function giveEnergyTo(address account, uint256 amount) external override {
        require(account != msg.sender, "Cannot give energy to yourself");
        require(amount <= freeEnergyOf(msg.sender), "Insufficient energy");

        _allocatedEnergy[msg.sender] += amount;
        (, uint256 currentAllocatedEnergy) = _energyAllocationMap[msg.sender].tryGet(account);
        uint256 nextAllocatedEnergy = currentAllocatedEnergy + amount;
        _energyAllocationMap[msg.sender].set(account, nextAllocatedEnergy);
        _reverseEnergyAllocationMap[account].set(msg.sender, nextAllocatedEnergy);

        _receivedEnergy[account] += amount;
    }

    /// @inheritdoc IEnergyManager
    function removeEnergyFrom(address account, uint256 amount) external override {
        require(_energyAllocationMap[msg.sender].contains(account), "Account not referenced");
        require(amount <= _energyAllocationMap[msg.sender].get(account), "Exceeded given energy");

        _receivedEnergy[account] -= amount;
        uint256 nextAllocatedEnergy = _energyAllocationMap[msg.sender].get(account) - amount;
        _energyAllocationMap[msg.sender].set(account, nextAllocatedEnergy);
        _reverseEnergyAllocationMap[account].set(msg.sender, nextAllocatedEnergy);

        _allocatedEnergy[msg.sender] -= amount;
    }

    /// @inheritdoc IEnergyManager
    function createEnergyFor(address account, uint256 amount) external override onlyOwner {
        _totalEnergy[account] += amount;
    }

    /// @inheritdoc IEnergyManager
    function destroyEnergyFor(address account, uint256 amount) external override onlyOwner {
        require(amount <= freeEnergyOf(account), "Exceeded free energy");
        require(amount <= _totalEnergy[account], "Exceeded total energy");
        _totalEnergy[account] -= amount;
    }
}
