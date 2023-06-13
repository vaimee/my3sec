// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableMapUpgradeable.sol";

import "../common/access/HubControllableUpgradeable.sol";
import "../common/interfaces/ISkillWallet.sol";

contract SkillWallet is ISkillWallet, HubControllableUpgradeable {
    using EnumerableMapUpgradeable for EnumerableMapUpgradeable.UintToUintMap;

    // ProfileID => EnumerableMap(SkillID => Experience)
    mapping(uint256 => EnumerableMapUpgradeable.UintToUintMap) private _skillMap;

    function initialize(address hub) public initializer {
        __HubControllable_init(hub);
    }

    /// @inheritdoc ISkillWallet
    function getSkillCount(uint256 profileID) external view override returns (uint256) {
        EnumerableMapUpgradeable.UintToUintMap storage map = _skillMap[profileID];
        return map.length();
    }

    /// @inheritdoc ISkillWallet
    function getSkill(uint256 profileID, uint256 index) external view override returns (uint256, uint256) {
        EnumerableMapUpgradeable.UintToUintMap storage map = _skillMap[profileID];
        return map.at(index);
    }

    /// @inheritdoc ISkillWallet
    function recordExperience(uint256 profileID, uint256 skillID, uint256 amount) external override onlyHub {
        EnumerableMapUpgradeable.UintToUintMap storage map = _skillMap[profileID];
        (, uint256 currentExperience) = map.tryGet(skillID);
        map.set(skillID, currentExperience + amount);
    }
}
