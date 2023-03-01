// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IEnergyManager.sol";

/**
 * @title EnergyManager contract
 * @dev This is the implementation of the Energy Manager.
 */
contract EnergyManager is IEnergyManager, Ownable {
    mapping(address => uint256) private _totalEnergy;
    mapping(address => uint256) private _allocatedEnergy;
    mapping(address => uint256) private _receivedEnergy;
    mapping(address => mapping(address => uint256)) private _energyAllocationMap;

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
    function energizedBy(address account) external view override returns (EnergyInfo[] memory) {}

    /// @inheritdoc IEnergyManager
    function energizersOf(address account) external view override returns (EnergyInfo[] memory) {}

    /// @inheritdoc IEnergyManager
    function giveEnergyTo(address account, uint256 amount) external override {
        require(amount <= freeEnergyOf(msg.sender), "Insufficient energy");
        _allocatedEnergy[msg.sender] += amount;
        _energyAllocationMap[msg.sender][account] += amount;
        _receivedEnergy[account] += amount;
    }

    /// @inheritdoc IEnergyManager
    function removeEnergyFrom(address account, uint256 amount) external override {
        require(amount <= _energyAllocationMap[msg.sender][account], "Exceeded given energy");
        _receivedEnergy[account] -= amount;
        _energyAllocationMap[msg.sender][account] -= amount;
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
