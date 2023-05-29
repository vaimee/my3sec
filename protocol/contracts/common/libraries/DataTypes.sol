// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library DataTypes {
    struct CreateProfile {
        string uri;
    }

    struct ProfileView {
        string uri;
    }

    enum ProjectStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        CANCELED
    }

    struct CreateProject {
        string metadataURI;
    }

    struct UpdateProject {
        string metadataURI;
        ProjectStatus status;
    }

    struct Project {
        uint256 id;
        string metadataURI;
        ProjectStatus status;
        EnumerableSet.UintSet members;
        Task[] tasks;
    }

    struct ProjectView {
        uint256 id;
        string metadataURI;
        ProjectStatus status;
        uint256 taskCount;
    }

    enum TaskStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        CANCELED
    }

    struct CreateTask {
        string metadataURI;
    }

    struct UpdateTask {
        string metadataURI;
        TaskStatus status;
    }

    struct Task {
        uint256 id;
        string metadataURI;
        TaskStatus status;
        EnumerableSet.UintSet members;
    }

    struct TaskView {
        uint256 id;
        string metadataURI;
        TaskStatus status;
    }
}
