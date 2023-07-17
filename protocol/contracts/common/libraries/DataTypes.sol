// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library DataTypes {
    struct CreateProfile {
        string metadataURI;
    }

    struct UpdateProfile {
        string metadataURI;
    }

    struct ProfileView {
        uint256 id;
        string metadataURI;
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
        uint256[] tasks;
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
        uint256[] skills;
    }

    struct UpdateTask {
        string metadataURI;
        TaskStatus status;
        uint256[] skills;
    }

    struct Task {
        uint256 id;
        string metadataURI;
        TaskStatus status;
        uint256[] skills;
        EnumerableSet.UintSet members;
        EnumerableMap.UintToUintMap loggedTime;
    }

    struct TaskView {
        uint256 id;
        string metadataURI;
        TaskStatus status;
        uint256[] skills;
    }

    struct CreateSkill {
        string metadataURI;
    }

    struct UpdateSkill {
        string metadataURI;
    }

    struct SkillView {
        uint256 id;
        string metadataURI;
    }
}
