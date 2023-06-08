// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "../common/access/HubControllable.sol";
import "../common/interfaces/ISkillWallet.sol";

contract SkillWallet is ISkillWallet, HubControllable {
    using EnumerableMap for EnumerableMap.UintToUintMap;
    
    // ProfileID => EnumerableMap(SkillID => Experience)
    mapping(uint256 => EnumerableMap.UintToUintMap) private _skillMap;

    constructor(address hub) HubControllable(hub) {}

    /// @inheritdoc ISkillWallet
    function getSkillCount(uint256 profileID) external view override returns (uint256) {
        EnumerableMap.UintToUintMap storage map = _skillMap[profileID];
        return map.length();
    }

    /// @inheritdoc ISkillWallet
    function getSkill(uint256 profileID, uint256 index) external view override returns (uint256, uint256) {
        EnumerableMap.UintToUintMap storage map = _skillMap[profileID];
        return map.at(index);
    }

    /// @inheritdoc ISkillWallet
    function recordExperience(uint256 profileID, uint256 skillID, uint256 amount) external override onlyHub {
        EnumerableMap.UintToUintMap storage map = _skillMap[profileID];
        (, uint256 currentExperience) = map.tryGet(skillID);
        map.set(skillID, currentExperience + amount);
    }
}
