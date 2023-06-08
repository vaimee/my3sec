// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../common/interfaces/ISkillRegistry.sol";
import "../common/libraries/DataTypes.sol";
import "../common/libraries/Events.sol";
import "../common/libraries/Errors.sol";

contract SkillRegistry is ISkillRegistry {
    using Strings for uint256;

    string[] internal _skills;
    string internal _baseURI;

    modifier baseURINotEmpty(string memory baseURI) {
        if (bytes(baseURI).length < 1) {
            revert Errors.InitParamsInvalid();
        }
        _;
    }

    modifier skillExists(uint256 id) {
        if (_skills.length < 1 || id > _skills.length - 1) {
            revert Errors.SkillNotFound();
        }
        _;
    }

    constructor(string memory baseURI) baseURINotEmpty(baseURI) {
        _baseURI = baseURI;
    }

    /// @inheritdoc ISkillRegistry
    function getSkillCount() external view returns (uint256) {
        return _skills.length;
    }

    /// @inheritdoc ISkillRegistry
    function getSkill(uint256 index) external view skillExists(index) returns (DataTypes.SkillView memory) {
        string memory metadataURI = _skills[index];
        if (bytes(metadataURI).length > 1) {
            return DataTypes.SkillView(index, metadataURI);
        }

        return DataTypes.SkillView(index, string(abi.encodePacked(_baseURI, index.toString())));
    }

    /// @inheritdoc ISkillRegistry
    function getBaseURI() external view returns (string memory) {
        return _baseURI;
    }

    /// @inheritdoc ISkillRegistry
    function setBaseURI(string memory baseURI) external baseURINotEmpty(baseURI) {
        _baseURI = baseURI;
    }

    /// @inheritdoc ISkillRegistry
    function createSkill(DataTypes.CreateSkill calldata args) external {
        _skills.push(args.metadataURI);
        uint256 id = _skills.length - 1;
        emit Events.SkillCreated(id);
    }

    /// @inheritdoc ISkillRegistry
    function updateSkill(uint256 id, DataTypes.UpdateSkill calldata args) external skillExists(id) {
        _skills[id] = args.metadataURI;
    }
}
