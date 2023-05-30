// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library Events {
    event OrganizationRegistered(address indexed organization);
    event TimeLogged(uint256 indexed profileId, uint256 time);
}
