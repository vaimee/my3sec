// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ISkillWallet {
    function getSkillCount(uint256 profileID) external view returns (uint256);

    function getSkill(uint256 profileID, uint256 index) external view returns (uint256, uint256);

    function recordExperience(uint256 profileID, uint256 skillID, uint256 amount) external;
}
