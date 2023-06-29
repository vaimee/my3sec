// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../interfaces/IWhitelistable.sol";
import "../libraries/DataTypes.sol";

interface IOrganization is IWhitelistable {
    function getMetadataURI() external view returns (string memory);

    function getMemberCount() external view returns (uint256);

    function getMember(uint256 index) external view returns (uint256);

    function isMember(uint256 profileId) external view returns (bool);

    function getPendingMemberCount() external view returns (uint256);

    function getPendingMember(uint256 index) external view returns (uint256);

    function isPendingMember(uint256 profileId) external view returns (bool);

    function setMetadataURI(string memory metadataURI) external;

    function join(uint256 profileId) external;

    function leave(uint256 profileId) external;

    function approvePendingMember(uint256 profileId) external;

    function rejectPendingMember(uint256 profileId) external;

    //=============================================================================
    // PROJECT
    //=============================================================================

    function getProjectCount() external view returns (uint256);

    function getProject(uint256 index) external view returns (DataTypes.ProjectView memory);

    function getProjectMemberCount(uint256 projectId) external view returns (uint256);

    function getProjectMember(uint256 projectId, uint256 index) external view returns (uint256);

    function isProjectMember(uint256 projectId, uint256 profileId) external view returns (bool);

    function createProject(DataTypes.CreateProject calldata args) external returns (uint256);

    function updateProject(uint256 projectId, DataTypes.UpdateProject calldata args) external;

    function addProjectMember(uint256 projectId, uint256 profileId) external;

    function removeProjectMember(uint256 projectId, uint256 profileId) external;

    //=============================================================================
    // TASK
    //=============================================================================

    function getTaskCount(uint256 projectId) external view returns (uint256);

    function getTask(uint256 projectId, uint256 index) external view returns (DataTypes.TaskView memory);

    function getTask(uint256 taskId) external view returns (DataTypes.TaskView memory);

    function getTaskMemberCount(uint256 taskId) external view returns (uint256);

    function getTaskMember(uint256 taskId, uint256 index) external view returns (uint256);

    function isTaskMember(uint256 taskId, uint256 profileId) external view returns (bool);

    function getTaskLoggedTimeCount(uint256 taskId) external view returns (uint256);

    function getTaskLoggedTime(uint256 taskId, uint256 index) external view returns (uint256, uint256);

    function getTaskLoggedTimeOfProfile(uint256 taskId, uint256 profileId) external view returns (uint256);

    function createTask(uint256 projectId, DataTypes.CreateTask calldata args) external returns (uint256);

    function updateTask(uint256 taskId, DataTypes.UpdateTask calldata args) external;

    function addTaskMember(uint256 taskId, uint256 profileId) external;

    function removeTaskMember(uint256 taskId, uint256 profileId) external;

    function updateTaskTime(uint256 projectId, uint256 taskId, uint256 time) external;

    //=============================================================================
    // OVERRIDES
    //=============================================================================

    function transferOwnership(address newOwner) external;
}
