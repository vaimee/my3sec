// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../libraries/DataTypes.sol";

interface ISkillRegistry {
    function getSkillCount() external view returns (uint256);
    
    function getSkill(uint256 index) external view returns (DataTypes.SkillView memory);
    
    function setBaseURI(string memory baseURI) external;
    
    function createSkill(DataTypes.CreateSkill calldata args) external ;

    function updateSkill(uint256 id, DataTypes.UpdateSkill calldata args) external;
}