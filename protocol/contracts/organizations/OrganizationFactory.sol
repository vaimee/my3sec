// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../common/interfaces/IOrganization.sol";

import "../organizations/Organization.sol";

contract OrganizationFactory {
    function createOrganization(string calldata metadataURI) external returns (address) {
        IOrganization organization = new Organization(msg.sender, metadataURI);
        organization.transferOwnership(msg.sender);
        return address(organization);
    }
}
