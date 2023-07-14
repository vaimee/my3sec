// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library Events {
    event ProfileCreated(uint256 indexed profileId, address indexed owner);
    event OrganizationRegistered(address indexed organization);
    event ProjectCreated(address indexed organization, uint256 indexed projectId);
    event TaskCreated(address indexed organization, uint256 indexed projectId, uint256 indexed taskId);
    event TimeLogged(uint256 indexed profileId, uint256 time);
    event SkillCreated(uint256 indexed skillId);
    event CertificateIssued(address from, uint256 indexed profileId, uint256 indexed certificateId);
}
