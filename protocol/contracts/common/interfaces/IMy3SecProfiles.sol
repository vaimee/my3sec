// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface IMy3SecProfiles is IERC721Upgradeable {
    function getDefaultProfileId(address account) external view returns (uint256);

    function setDefaultProfile(address account, uint256 profileId) external;

    function createProfile(address to, string memory uri) external returns (uint256);

    function updateProfile(uint256 profileId, string memory uri) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
