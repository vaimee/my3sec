// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IMy3SecHub {
    //=============================================================================
    // PROFILE
    //=============================================================================
    function getDefaultProfile(address account) external view returns (DataTypes.ProfileView memory);

    function getProfileAccount(uint256 profileId) external view returns (address);

    function getProfile(uint256 profileId) external view returns (DataTypes.ProfileView memory);

    function setDefaultProfile(uint256 profileId) external;

    function createProfile(DataTypes.CreateProfile calldata args) external returns (uint256);

    function updateProfile(uint256 profileId, DataTypes.UpdateProfile calldata args) external;

    function giveEnergyTo(uint256 profileId, uint256 amount) external;

    function removeEnergyFrom(uint256 profileId, uint256 amount) external;

    //=============================================================================
    // ORGANIZATION
    //=============================================================================

    function getOrganizationCount() external view returns (uint256);

    function getOrganization(uint256 index) external view returns (address);

    function hasWithdrawn(address organizationAddress, uint256 taskId, uint256 profileId) external view returns (bool);

    function createOrganization(string calldata metadataURI) external returns (address);

    function registerOrganization(address organization) external;

    function joinOrganization(address organizationAddress) external;

    function leaveOrganization(address organizationAddress) external;

    function logTime(address organizationAddress, uint256 taskId, uint256 time) external;

    function withdraw(address organizationAddress, uint256 taskId) external;

    //=============================================================================
    // CERTIFICATE
    //=============================================================================

    function issueCertificate(uint256 profileId, string memory uri) external;

    function issueCertificate(address organizationAddress, uint256 profileId, string memory uri) external;

    //=============================================================================
    // EMITTERS
    //=============================================================================

    function emitPendingMemberApproved(address organization, uint256 profileId) external;

    function emitPendingMemberRejected(address organization, uint256 profileId) external;

    function emitProjectCreated(address organization, uint256 projectId) external;

    function emitProjectUpdated(address organization, uint256 projectId) external;

    function emitProjectMemberAdded(address organization, uint256 projectId, uint256 profileId) external;

    function emitProjectMemberRemoved(address organization, uint256 projectId, uint256 profileId) external;

    function emitTaskCreated(address organization, uint256 projectId, uint256 taskId) external;

    function emitTaskUpdated(address organization, uint256 taskId) external;

    function emitTaskMemberAdded(address organization, uint256 taskId, uint256 profileId) external;

    function emitTaskMemberRemoved(address organization, uint256 taskId, uint256 profileId) external;
}
