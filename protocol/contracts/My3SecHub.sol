// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./common/interfaces/IMy3SecHub.sol";
import "./common/interfaces/IMy3SecProfiles.sol";
import "./common/interfaces/IEnergyManager.sol";
import "./common/interfaces/ITimeWallet.sol";
import "./common/interfaces/IOrganization.sol";
import "./common/libraries/Constants.sol";
import "./common/libraries/DataTypes.sol";
import "./common/libraries/Errors.sol";
import "./common/libraries/Events.sol";

import "./profiles/My3SecProfiles.sol";
import "./profiles/EnergyManager.sol";
import "./profiles/TimeWallet.sol";
import "./organizations/Organization.sol";

contract My3SecHub is IMy3SecHub, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    IMy3SecProfiles internal _my3SecProfiles;
    IEnergyManager internal _energyManager;
    ITimeWallet internal _timeWallet;

    EnumerableSet.AddressSet internal _organizations;

    function setMy3SecProfilesContract(address contractAddress) external onlyOwner {
        _my3SecProfiles = My3SecProfiles(contractAddress);
    }

    function setEnergyManagerContract(address contractAddress) external onlyOwner {
        _energyManager = EnergyManager(contractAddress);
    }

    function setTimeWalletContract(address contractAddress) external onlyOwner {
        _timeWallet = TimeWallet(contractAddress);
    }

    //=============================================================================
    // PROFILE
    //=============================================================================

    /// @inheritdoc IMy3SecHub
    function getDefaultProfile(address account) external view override returns (DataTypes.ProfileView memory) {
        uint256 profileId = _my3SecProfiles.getDefaultProfileId(account);
        return getProfile(profileId);
    }

    /// @inheritdoc IMy3SecHub
    function getProfile(uint256 profileId) public view override returns (DataTypes.ProfileView memory) {
        string memory uri = _my3SecProfiles.tokenURI(profileId);
        DataTypes.ProfileView memory profile = DataTypes.ProfileView(profileId, uri);
        return profile;
    }

    /// @inheritdoc IMy3SecHub
    function setDefaultProfile(uint256 profileId) external override {
        _my3SecProfiles.setDefaultProfile(msg.sender, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function createProfile(DataTypes.CreateProfile calldata args) external override returns (uint256) {
        uint256 profileId = _my3SecProfiles.createProfile(msg.sender, args.uri);
        _energyManager.createEnergyFor(profileId, Constants.PROFILE_INITIAL_ENERGY);
        return profileId;
    }

    /// @inheritdoc IMy3SecHub
    function giveEnergyTo(uint256 profileId, uint256 amount) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        _energyManager.giveEnergy(senderProfileId, profileId, amount);
    }

    /// @inheritdoc IMy3SecHub
    function removeEnergyFrom(uint256 profileId, uint256 amount) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        _energyManager.removeEnergy(profileId, senderProfileId, amount);
    }

    //=============================================================================
    // ORGANIZATION
    //=============================================================================

    /// @inheritdoc IMy3SecHub
    function getOrganizationCount() public view override returns (uint256) {
        return _organizations.length();
    }

    /// @inheritdoc IMy3SecHub
    function getOrganization(uint256 index) external view override returns (address) {
        if (index < 0 || index >= getOrganizationCount()) revert Errors.IndexOutOfBounds();
        return _organizations.at(index);
    }

    /// @inheritdoc IMy3SecHub
    function createOrganization(string calldata metadataURI) external returns (address) {
        IOrganization organization = new Organization(address(this), metadataURI);
        organization.transferOwnership(msg.sender);

        address organizationAddress = address(organization);
        _organizations.add(organizationAddress);
        emit Events.OrganizationRegistered(organizationAddress);

        return organizationAddress;
    }

    /// @inheritdoc IMy3SecHub
    function registerOrganization(address organizationAddress) external override {
        if (_organizations.contains(organizationAddress)) revert Errors.AlreadyRegistered();

        // 1. Check if the address corresponds to a deployed contract
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(organizationAddress)
        }
        if (codeSize == 0) revert Errors.InvalidContract();

        // 2. Check if the organization contract complies with the required interface
        if (!_isOrganizationContract(organizationAddress)) revert Errors.InvalidContract();
        IOrganization organization = IOrganization(organizationAddress);

        // 3. Check if the sender is whitelisted in the organization
        if (organization.isWhitelisted(msg.sender)) revert Errors.NotWhitelisted();

        _organizations.add(organizationAddress);
        emit Events.OrganizationRegistered(address(organization));
    }

    /// @inheritdoc IMy3SecHub
    function joinOrganization(address organizationAddress) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);
        organization.join(senderProfileId);
    }

    /// @inheritdoc IMy3SecHub
    function leaveOrganization(address organizationAddress) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);
        organization.leave(senderProfileId);
    }

    /// @inheritdoc IMy3SecHub
    function logTime(address organizationAddress, uint256 projectId, uint256 taskId, uint256 time) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);

        // Use the time for today; reverts if the time is not available
        _timeWallet.spendTimeFor(senderProfileId, time);

        organization.updateTaskTime(senderProfileId, projectId, taskId, time);

        emit Events.TimeLogged(senderProfileId, time);
    }

    function _isOrganizationContract(address organization) internal view returns (bool) {
        try IOrganization(organization).getMemberCount() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }
}
