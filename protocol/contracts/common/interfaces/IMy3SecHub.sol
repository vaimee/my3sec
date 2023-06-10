// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IMy3SecHub {
    function getDefaultProfile(address account) external view returns (DataTypes.ProfileView memory);

    function getProfile(uint256 profileId) external view returns (DataTypes.ProfileView memory);

    function setDefaultProfile(uint256 profileId) external;

    function createProfile(DataTypes.CreateProfile calldata args) external returns (uint256);

    function giveEnergyTo(uint256 profileId, uint256 amount) external;

    function removeEnergyFrom(uint256 profileId, uint256 amount) external;

    function getOrganizationCount() external view returns (uint256);

    function getOrganization(uint256 index) external view returns (address);

    function createOrganization(string calldata metadataURI) external returns (address);

    function registerOrganization(address organization) external;

    function joinOrganization(address organizationAddress) external;

    function leaveOrganization(address organizationAddress) external;

    function logTime(address organizationAddress, uint256 taskId, uint256 time) external;

    function withdraw(address organizationAddress, uint256 taskId) external;
}
