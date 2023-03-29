// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IMy3SecHub {
    function getDefaultProfile(address account) external view returns (DataTypes.ProfileStruct memory);

    function getProfile(uint256 profileId) external view returns (DataTypes.ProfileStruct memory);

    function setDefaultProfile(uint256 profileId) external;

    function createProfile(DataTypes.CreateProfileData calldata args) external returns (uint256);

    function giveEnergyTo(uint256 profileId, uint256 amount) external;

    function removeEnergyFrom(uint256 profileId, uint256 amount) external;
}
