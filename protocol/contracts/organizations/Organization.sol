// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "../common/access/HubControllable.sol";
import "../common/access/Whitelistable.sol";
import "../common/interfaces/IMy3SecHub.sol";
import "../common/interfaces/IOrganization.sol";
import "../common/libraries/DataTypes.sol";
import "../common/libraries/Events.sol";
import "../common/libraries/Errors.sol";

contract Organization is IOrganization, HubControllable, Whitelistable {
    using EnumerableMap for EnumerableMap.UintToUintMap;
    using EnumerableSet for EnumerableSet.UintSet;

    string internal _metadataURI;

    EnumerableSet.UintSet internal _members;
    EnumerableSet.UintSet internal _pendingMembers;

    DataTypes.Project[] internal _projects;
    DataTypes.Task[] internal _tasks;

    modifier taskNotCompleted(uint256 taskId) {
        if (_tasks[taskId].status == DataTypes.TaskStatus.COMPLETED) revert Errors.AlreadyCompleted();
        _;
    }

    modifier projectExists(uint256 projectId) {
        if (projectId >= _projects.length) revert Errors.NotRegistered();
        _;
    }

    modifier taskExists(uint256 taskId) {
        if (taskId >= _tasks.length) revert Errors.NotRegistered();
        _;
    }

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
    function getMember(uint256 index) external view virtual override returns (uint256) {
        return _members.at(index);
    }

    /// @inheritdoc IOrganization
    function isMember(uint256 profileId) public view virtual override returns (bool) {
        return _members.contains(profileId);
    }

    /// @inheritdoc IOrganization
    function getPendingMemberCount() external view virtual override returns (uint256) {
        return _pendingMembers.length();
    }

    /// @inheritdoc IOrganization
    function getPendingMember(uint256 index) external view virtual override returns (uint256) {
        return _pendingMembers.at(index);
    }

    /// @inheritdoc IOrganization
    function isPendingMember(uint256 profileId) public view virtual override returns (bool) {
        return _pendingMembers.contains(profileId);
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
        IMy3SecHub(HUB).emitPendingMemberApproved(address(this), profileId);
    }

    /// @inheritdoc IOrganization
    function rejectPendingMember(uint256 profileId) external virtual override onlyWhitelisted {
        if (!_pendingMembers.contains(profileId)) revert Errors.NotPendingMember();
        _pendingMembers.remove(profileId);
        IMy3SecHub(HUB).emitPendingMemberRejected(address(this), profileId);
    }

    //=============================================================================
    // PROJECT
    //=============================================================================

    /// @inheritdoc IOrganization
    function getProjectCount() external view returns (uint256) {
        return _projects.length;
    }

    /// @inheritdoc IOrganization
    function getProject(uint256 index) external view projectExists(index) returns (DataTypes.ProjectView memory) {
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
    function getProjectMemberCount(uint256 projectId) external view projectExists(projectId) returns (uint256) {
        return _projects[projectId].members.length();
    }

    /// @inheritdoc IOrganization
    function getProjectMember(
        uint256 projectId,
        uint256 index
    ) external view projectExists(projectId) returns (uint256) {
        return _projects[projectId].members.at(index);
    }

    function isProjectMember(uint256 projectId, uint256 profileId) public view projectExists(projectId) returns (bool) {
        return _projects[projectId].members.contains(profileId);
    }

    /// @inheritdoc IOrganization
    function createProject(DataTypes.CreateProject calldata args) external onlyWhitelisted returns (uint256) {
        uint256 newProjectId = _projects.length;
        _projects.push();
        DataTypes.Project storage project = _projects[newProjectId];
        project.id = newProjectId;
        project.metadataURI = args.metadataURI;
        project.status = DataTypes.ProjectStatus.NOT_STARTED;
        IMy3SecHub(HUB).emitProjectCreated(address(this), newProjectId);
        return newProjectId;
    }

    /// @inheritdoc IOrganization
    function updateProject(
        uint256 projectId,
        DataTypes.UpdateProject calldata args
    ) external projectExists(projectId) onlyWhitelisted {
        _projects[projectId].metadataURI = args.metadataURI;
        _projects[projectId].status = args.status;
        IMy3SecHub(HUB).emitProjectUpdated(address(this), projectId);
    }

    /// @inheritdoc IOrganization
    function addProjectMember(uint256 projectId, uint256 profileId) external projectExists(projectId) onlyWhitelisted {
        _projects[projectId].members.add(profileId);
        IMy3SecHub(HUB).emitProjectMemberAdded(address(this), projectId, profileId);
    }

    /// @inheritdoc IOrganization
    function removeProjectMember(
        uint256 projectId,
        uint256 profileId
    ) external projectExists(projectId) onlyWhitelisted {
        _projects[projectId].members.remove(profileId);
        IMy3SecHub(HUB).emitProjectMemberRemoved(address(this), projectId, profileId);
    }

    //=============================================================================
    // TASK
    //=============================================================================

    /// @inheritdoc IOrganization
    function getTaskCount(uint256 projectId) external view projectExists(projectId) returns (uint256) {
        return _projects[projectId].tasks.length;
    }

    /// @inheritdoc IOrganization
    function getTask(
        uint256 projectId,
        uint256 index
    ) external view projectExists(projectId) returns (DataTypes.TaskView memory) {
        uint256 taskId = _projects[projectId].tasks[index];
        DataTypes.Task storage task = _tasks[taskId];

        DataTypes.TaskView memory taskView = DataTypes.TaskView({
            id: task.id,
            metadataURI: task.metadataURI,
            status: task.status,
            skills: task.skills
        });
        return taskView;
    }

    /// @inheritdoc IOrganization
    function getTask(uint256 taskId) external view taskExists(taskId) returns (DataTypes.TaskView memory) {
        DataTypes.Task storage task = _tasks[taskId];

        DataTypes.TaskView memory taskView = DataTypes.TaskView({
            id: task.id,
            metadataURI: task.metadataURI,
            status: task.status,
            skills: task.skills
        });
        return taskView;
    }

    /// @inheritdoc IOrganization
    function getTaskMemberCount(uint256 taskId) external view taskExists(taskId) returns (uint256) {
        return _tasks[taskId].members.length();
    }

    /// @inheritdoc IOrganization
    function getTaskMember(uint256 taskId, uint256 index) external view taskExists(taskId) returns (uint256) {
        return _tasks[taskId].members.at(index);
    }

    /// @inheritdoc IOrganization
    function isTaskMember(uint256 taskId, uint256 profileId) public view taskExists(taskId) returns (bool) {
        return _tasks[taskId].members.contains(profileId);
    }

    /// @inheritdoc IOrganization
    function getTaskLoggedTimeCount(uint256 taskId) external view taskExists(taskId) returns (uint256) {
        return _tasks[taskId].loggedTime.length();
    }

    /// @inheritdoc IOrganization
    function getTaskLoggedTime(
        uint256 taskId,
        uint256 index
    ) external view taskExists(taskId) returns (uint256, uint256) {
        return _tasks[taskId].loggedTime.at(index);
    }

    /// @inheritdoc IOrganization
    function getTaskLoggedTimeOfProfile(
        uint256 taskId,
        uint256 profileId
    ) external view taskExists(taskId) returns (uint256) {
        return _tasks[taskId].loggedTime.get(profileId);
    }

    /// @inheritdoc IOrganization
    function createTask(
        uint256 projectId,
        DataTypes.CreateTask calldata args
    ) external projectExists(projectId) onlyWhitelisted returns (uint256) {
        uint256 newTaskId = _tasks.length;
        _tasks.push();
        DataTypes.Task storage task = _tasks[newTaskId];
        task.id = newTaskId;
        task.metadataURI = args.metadataURI;
        task.status = DataTypes.TaskStatus.NOT_STARTED;
        task.skills = args.skills;

        _projects[projectId].tasks.push(newTaskId);
        IMy3SecHub(HUB).emitTaskCreated(address(this), projectId, newTaskId);
        return newTaskId;
    }

    /// @inheritdoc IOrganization
    function updateTask(
        uint256 taskId,
        DataTypes.UpdateTask calldata args
    ) external taskExists(taskId) taskNotCompleted(taskId) onlyWhitelisted {
        _tasks[taskId].metadataURI = args.metadataURI;
        _tasks[taskId].status = args.status;
        _tasks[taskId].skills = args.skills;
        IMy3SecHub(HUB).emitTaskUpdated(address(this), taskId);
    }

    /// @inheritdoc IOrganization
    function addTaskMember(
        uint256 taskId,
        uint256 profileId
    ) external taskExists(taskId) taskNotCompleted(taskId) onlyWhitelisted {
        _tasks[taskId].members.add(profileId);
        IMy3SecHub(HUB).emitTaskMemberAdded(address(this), taskId, profileId);
    }

    /// @inheritdoc IOrganization
    function removeTaskMember(
        uint256 taskId,
        uint256 profileId
    ) external taskExists(taskId) taskNotCompleted(taskId) onlyWhitelisted {
        _tasks[taskId].members.remove(profileId);
        IMy3SecHub(HUB).emitTaskMemberRemoved(address(this), taskId, profileId);
    }

    /// @inheritdoc IOrganization
    function updateTaskTime(
        uint256 profileId,
        uint256 taskId,
        uint256 time
    ) external taskExists(taskId) taskNotCompleted(taskId) onlyHub {
        if (!isTaskMember(taskId, profileId)) revert Errors.NotMember();

        if (!_tasks[taskId].loggedTime.contains(profileId)) {
            _tasks[taskId].loggedTime.set(profileId, time);
        } else {
            uint256 currentTime = _tasks[taskId].loggedTime.get(profileId);
            _tasks[taskId].loggedTime.set(profileId, currentTime + time);
        }
    }

    //=============================================================================
    // OVERRIDES
    //=============================================================================

    function transferOwnership(address newOwner) public override(IOrganization, Ownable) {
        super.transferOwnership(newOwner);
    }
}
