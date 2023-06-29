// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../common/interfaces/IOrganization.sol";

import "../organizations/Organization.sol";

contract OrganizationFactory {
    function createOrganization(address hub, string calldata metadataURI) external returns (address) {
        IOrganization organization = new Organization(hub, metadataURI);
        organization.transferOwnership(msg.sender);
        return address(organization);
    }
}
