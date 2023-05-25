// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "../common/access/HubControllable.sol";
import "../common/access/Whitelistable.sol";
import "../common/interfaces/IOrganization.sol";
import "../common/libraries/DataTypes.sol";
import "../common/libraries/Errors.sol";

contract Organization is IOrganization, HubControllable, Whitelistable {
    using EnumerableSet for EnumerableSet.UintSet;

    string internal _metadataURI;

    EnumerableSet.UintSet internal _members;
    EnumerableSet.UintSet internal _pendingMembers;

    DataTypes.Project[] internal _projects;

    constructor(address hub, string memory metadataURI) HubControllable(hub) {
        _metadataURI = metadataURI;
    }

    /// @inheritdoc IOrganization
    function getMetadataURI() external view virtual override returns (string memory) {
        return _metadataURI;
    }

    /// @inheritdoc IOrganization
    function getMemberCount() external view virtual override returns (uint256) {
        return _members.length();
    }

    /// @inheritdoc IOrganization
    function getPendingMemberCount() external view virtual override returns (uint256) {
        return _pendingMembers.length();
    }

    /// @inheritdoc IOrganization
    function isMember(uint256 profileId) public view virtual override returns (bool) {
        return _members.contains(profileId);
    }

    /// @inheritdoc IOrganization
    function setMetadataURI(string memory metadataURI) external virtual override onlyWhitelisted {
        _metadataURI = metadataURI;
    }

    /// @inheritdoc IOrganization
    function join(uint256 profileId) external virtual override onlyHub {
        if (_members.contains(profileId)) revert Errors.AlreadyMember();
        _pendingMembers.add(profileId);
    }

    /// @inheritdoc IOrganization
    function leave(uint256 profileId) external virtual override onlyHub {
        if (_pendingMembers.contains(profileId)) {
            _pendingMembers.remove(profileId);
            return;
        }

        if (_members.contains(profileId)) {
            _members.remove(profileId);
            return;
        }

        revert Errors.NotMember();
    }

    /// @inheritdoc IOrganization
    function approvePendingMember(uint256 profileId) external virtual override onlyWhitelisted {
        if (!_pendingMembers.contains(profileId)) revert Errors.NotPendingMember();
        _pendingMembers.remove(profileId);
        _members.add(profileId);
    }

    /// @inheritdoc IOrganization
    function rejectPendingMember(uint256 profileId) external virtual override onlyWhitelisted {
        if (!_pendingMembers.contains(profileId)) revert Errors.NotPendingMember();
        _pendingMembers.remove(profileId);
    }

    // Project

    /// @inheritdoc IOrganization
    function getProjectCount() external view returns (uint256) {
        return _projects.length;
    }

    /// @inheritdoc IOrganization
    function getProject(uint256 index) external view returns (DataTypes.ProjectView memory) {
        DataTypes.Project storage project = _projects[index];
        DataTypes.ProjectView memory projectView = DataTypes.ProjectView({
            id: project.id,
            metadataURI: project.metadataURI,
            status: project.status,
            taskCount: project.tasks.length
        });
        return projectView;
    }

    /// @inheritdoc IOrganization
    function getProjectMemberCount(uint256 projectId) external view returns (uint256) {
        return _projects[projectId].members.length();
    }

    /// @inheritdoc IOrganization
    function getProjectMember(uint256 projectId, uint256 index) external view returns (uint256) {
        return _projects[projectId].members.at(index);
    }

    /// @inheritdoc IOrganization
    function createProject(DataTypes.CreateProject calldata args) external returns (uint256) {
        uint256 newProjectId = _projects.length;
        _projects.push();
        DataTypes.Project storage project = _projects[newProjectId];
        project.id = newProjectId;
        project.metadataURI = args.metadataURI;
        project.status = DataTypes.ProjectStatus.NOT_STARTED;
        return newProjectId;
    }

    /// @inheritdoc IOrganization
    function updateProject(uint256 projectId, DataTypes.UpdateProject calldata args) external {
        _projects[projectId].metadataURI = args.metadataURI;
        _projects[projectId].status = args.status;
    }

    /// @inheritdoc IOrganization
    function addProjectMember(uint256 projectId, uint256 profileId) external {
        _projects[projectId].members.add(profileId);
    }

    /// @inheritdoc IOrganization
    function removeProjectMember(uint256 projectId, uint256 profileId) external {
        _projects[projectId].members.remove(profileId);
    }

    // Task

    /// @inheritdoc IOrganization
    function getTaskCount(uint256 projectId) external view returns (uint256) {
        return _projects[projectId].tasks.length;
    }

    /// @inheritdoc IOrganization
    function getTask(uint256 projectId, uint256 index) external view returns (DataTypes.TaskView memory) {
        DataTypes.Task storage task = _projects[projectId].tasks[index];
        DataTypes.TaskView memory taskView = DataTypes.TaskView({
            id: task.id,
            metadataURI: task.metadataURI,
            status: task.status
        });
        return taskView;
    }

    /// @inheritdoc IOrganization
    function getTaskMemberCount(uint256 projectId, uint256 taskId) external view returns (uint256) {
        return _projects[projectId].tasks[taskId].members.length();
    }

    /// @inheritdoc IOrganization
    function getTaskMember(uint256 projectId, uint256 taskId, uint256 index) external view returns (uint256) {
        return _projects[projectId].tasks[taskId].members.at(index);
    }

    /// @inheritdoc IOrganization
    function createTask(uint256 projectId, DataTypes.CreateTask calldata args) external returns (uint256) {
        uint256 newTasktId = _projects[projectId].tasks.length;
        _projects[projectId].tasks.push();
        DataTypes.Task storage task = _projects[projectId].tasks[newTasktId];
        task.id = newTasktId;
        task.metadataURI = args.metadataURI;
        task.status = DataTypes.TaskStatus.NOT_STARTED;
        return newTasktId;
    }

    /// @inheritdoc IOrganization
    function updateTask(uint256 projectId, uint256 taskId, DataTypes.UpdateTask calldata args) external {
        _projects[projectId].tasks[taskId].metadataURI = args.metadataURI;
        _projects[projectId].tasks[taskId].status = args.status;
    }

    /// @inheritdoc IOrganization
    function addTaskMember(uint256 projectId, uint256 taskId, uint256 profileId) external {
        _projects[projectId].tasks[taskId].members.add(profileId);
    }

    /// @inheritdoc IOrganization
    function removeTaskMember(uint256 projectId, uint256 taskId, uint256 profileId) external {
        _projects[projectId].tasks[taskId].members.remove(profileId);
    }

    // Overrides

    function transferOwnership(address newOwner) public override(IOrganization, Ownable) {
        super.transferOwnership(newOwner);
    }

    function isWhitelisted(address account) public view override(IOrganization, Whitelistable) returns (bool) {
        return super.isWhitelisted(account);
    }
}
