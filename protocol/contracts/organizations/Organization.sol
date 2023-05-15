// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "../common/access/HubControllable.sol";
import "../common/access/Whitelistable.sol";
import "../common/interfaces/IOrganization.sol";
import "../common/libraries/DataTypes.sol";
import "../common/libraries/Errors.sol";

contract Organization is IOrganization, HubControllable, Whitelistable {
    using EnumerableSet for EnumerableSet.UintSet;

    string internal _metadataURI;

    EnumerableSet.UintSet internal _members;
    EnumerableSet.UintSet internal _pendingMembers;

    constructor(address hub, string memory metadataURI) HubControllable(hub) {
        _metadataURI = metadataURI;
    }

    /// @inheritdoc IOrganization
    function getMetadataURI() external view virtual override returns (string memory) {
        return _metadataURI;
    }

    /// @inheritdoc IOrganization
    function getMemberCount() external view virtual override returns (uint256) {
        return _members.length();
    }

    /// @inheritdoc IOrganization
    function getPendingMemberCount() external view virtual override returns (uint256) {
        return _pendingMembers.length();
    }

    /// @inheritdoc IOrganization
    function isMember(uint256 profileId) public view virtual override returns (bool) {
        return _members.contains(profileId);
    }

    /// @inheritdoc IOrganization
    function setMetadataURI(string memory metadataURI) external virtual override onlyWhitelisted {
        _metadataURI = metadataURI;
    }

    /// @inheritdoc IOrganization
    function join(uint256 profileId) external virtual override onlyHub {
        if (_members.contains(profileId)) revert Errors.AlreadyMember();
        _pendingMembers.add(profileId);
    }

    /// @inheritdoc IOrganization
    function leave(uint256 profileId) external virtual override onlyHub {
        if (!_members.contains(profileId)) revert Errors.NotMember();
        _members.remove(profileId);
    }

    /// @inheritdoc IOrganization
    function approvePendingMember(uint256 profileId) external virtual override onlyWhitelisted {
        if (!_pendingMembers.contains(profileId)) revert Errors.NotPendingMember();
        _pendingMembers.remove(profileId);
        _members.add(profileId);
    }

    // Overrides

    function transferOwnership(address newOwner) public override(IOrganization, Ownable) {
        super.transferOwnership(newOwner);
    }

    function isWhitelisted(address account) public view override(IOrganization, Whitelistable) returns (bool) {
        return super.isWhitelisted(account);
    }
}
