// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../libraries/DataTypes.sol";

interface IOrganization {
    function getMetadataURI() external view returns (string memory);

    function getMemberCount() external view returns (uint256);

    function getPendingMemberCount() external view returns (uint256);

    function isMember(uint256 profileId) external view returns (bool);

    function setMetadataURI(string memory metadataURI) external;

    function join(uint256 profileId) external;

    function leave(uint256 profileId) external;

    function approvePendingMember(uint256 profileId) external;
    
    function rejectPendingMember(uint256 profileId) external;

    // Overrides

    function transferOwnership(address newOwner) external;

    function isWhitelisted(address account) external view returns (bool);
}
