// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IMy3SecHub.sol";
import "./interfaces/IMy3SecProfiles.sol";
import "./interfaces/IEnergyManager.sol";
import "./libraries/DataTypes.sol";

import "./tokens/My3SecProfiles.sol";
import "./reputation/EnergyManager.sol";

contract My3SecHub is IMy3SecHub, Ownable {
    IMy3SecProfiles internal _my3SecProfiles;
    IEnergyManager internal _energyManager;

    function setMy3SecProfilesContract(address contractAddress) external onlyOwner {
        _my3SecProfiles = My3SecProfiles(contractAddress);
    }

    function setEnergyManagerContract(address contractAddress) external onlyOwner {
        _energyManager = EnergyManager(contractAddress);
    }

    /// ***************************************
    /// *****PROFILE INTERACTION FUNCTIONS*****
    /// ***************************************

    /// @inheritdoc IMy3SecHub
    function getDefaultProfile(address account) external view override returns (DataTypes.ProfileStruct memory) {
        uint256 profileId = _my3SecProfiles.getDefaultProfileId(account);
        return getProfile(profileId);
    }

    /// @inheritdoc IMy3SecHub
    function getProfile(uint256 profileId) public view override returns (DataTypes.ProfileStruct memory) {
        string memory uri = _my3SecProfiles.tokenURI(profileId);
        DataTypes.ProfileStruct memory profile = DataTypes.ProfileStruct(uri);
        return profile;
    }

    /// @inheritdoc IMy3SecHub
    function setDefaultProfile(uint256 profileId) external override {
        _my3SecProfiles.setDefaultProfile(msg.sender, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function createProfile(DataTypes.CreateProfileData calldata args) external override returns (uint256) {
        uint256 profileId = _my3SecProfiles.createProfile(msg.sender, args.uri);
        return profileId;
    }
}
