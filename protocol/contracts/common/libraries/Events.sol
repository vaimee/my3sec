// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library Events {
    event ProfileCreated(uint256 indexed profileId, address indexed owner);
    event EnergyGiven(uint256 indexed fromProfileId, uint256 indexed toProfileId, uint256 amount); /** x */
    event EnergyRemoved(uint256 indexed fromProfileId, uint256 indexed toProfileId, uint256 amount); /** x */
    event OrganizationRegistered(address indexed organization);
    event OrganizationJoined(address indexed organization, uint256 indexed profileId); /** x */
    event OrganizationLeft(address indexed organization, uint256 indexed profileId); /** x */
    event PendingMemberApproved(address indexed organization, uint256 indexed profileId);
    event PendingMemberRejected(address indexed organization, uint256 indexed profileId);
    event ProjectCreated(address indexed organization, uint256 indexed projectId);
    event ProjectUpdated(address indexed organization, uint256 indexed projectId);
    event ProjectMemberAdded(address indexed organization, uint256 indexed projectId, uint256 indexed profileId);
    event ProjectMemberRemoved(address indexed organization, uint256 indexed projectId, uint256 indexed profileId);
    event TaskCreated(address indexed organization, uint256 indexed projectId, uint256 indexed taskId);
    event TaskUpdated(address indexed organization, uint256 indexed taskId);
    event TaskMemberAdded(address indexed organization, uint256 indexed taskId, uint256 indexed profileId);
    event TaskMemberRemoved(address indexed organization, uint256 indexed taskId, uint256 indexed profileId);
    event TimeLogged(uint256 indexed profileId, uint256 time);
    event ExperienceWithdrawn(address indexed organization, uint256 indexed taskId, uint256 indexed profileId); /** x */
    event SkillCreated(uint256 indexed skillId);
    event CertificateIssued(address from, uint256 indexed profileId, uint256 indexed certificateId);
}
