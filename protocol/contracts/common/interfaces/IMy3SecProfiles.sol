// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IMy3SecProfiles {
    function getDefaultProfileId(address account) external view returns (uint256);

    function setDefaultProfile(address account, uint256 profileId) external;

    function createProfile(address to, string memory uri) external returns (uint256);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
