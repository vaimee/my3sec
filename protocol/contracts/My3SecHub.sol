// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./common/interfaces/IMy3SecHub.sol";
import "./common/interfaces/ISkillRegistry.sol";
import "./common/interfaces/ICertificateNFT.sol";
import "./common/interfaces/IMy3SecProfiles.sol";
import "./common/interfaces/IEnergyWallet.sol";
import "./common/interfaces/ITimeWallet.sol";
import "./common/interfaces/ISkillWallet.sol";
import "./common/interfaces/IOrganization.sol";
import "./common/libraries/Constants.sol";
import "./common/libraries/DataTypes.sol";
import "./common/libraries/Errors.sol";
import "./common/libraries/Events.sol";

import "./organizations/OrganizationFactory.sol";

contract My3SecHub is IMy3SecHub, OwnableUpgradeable {
    using EnumerableSet for EnumerableSet.AddressSet;

    address internal _governanceTimelockContractAddress;

    OrganizationFactory internal _organizationFactory;
    ISkillRegistry internal _skillRegistry;
    ICertificateNFT internal _certificateNFT;
    IMy3SecProfiles internal _my3SecProfiles;
    IEnergyWallet internal _energyWallet;
    ITimeWallet internal _timeWallet;
    ISkillWallet internal _skillWallet;

    EnumerableSet.AddressSet internal _organizations;

    // Org => TaskId => profileId
    mapping(address => mapping(uint256 => uint256)) rewards;

    modifier organizationRegistered(address organizationAddress) {
        if (!_organizations.contains(organizationAddress)) revert Errors.NotRegistered();
        _;
    }

    modifier onlyRegisteredOrganizationCaller() {
        if (!_organizations.contains(msg.sender)) revert Errors.CallerNotOrganization();
        _;
    }

    function initialize() public initializer {
        __Ownable_init();
    }

    function setGovernanceTimelockContractAddress(address contractAddress) external onlyOwner {
        _governanceTimelockContractAddress = contractAddress;
    }

    function setOrganizationFactoryContract(address contractAddress) external onlyOwner {
        _organizationFactory = OrganizationFactory(contractAddress);
    }

    function setSkillRegistryContract(address contractAddress) external onlyOwner {
        _skillRegistry = ISkillRegistry(contractAddress);
    }

    function setCertificateNFTContract(address contractAddress) external onlyOwner {
        _certificateNFT = ICertificateNFT(contractAddress);
    }

    function setMy3SecProfilesContract(address contractAddress) external onlyOwner {
        _my3SecProfiles = IMy3SecProfiles(contractAddress);
    }

    function setEnergyWalletContract(address contractAddress) external onlyOwner {
        _energyWallet = IEnergyWallet(contractAddress);
    }

    function setTimeWalletContract(address contractAddress) external onlyOwner {
        _timeWallet = ITimeWallet(contractAddress);
    }

    function setSkillWalletContract(address contractAddress) external onlyOwner {
        _skillWallet = ISkillWallet(contractAddress);
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
    function getProfileAccount(uint256 profileId) public view override returns (address) {
        return _my3SecProfiles.ownerOf(profileId);
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
        uint256 profileId = _my3SecProfiles.createProfile(msg.sender, args.metadataURI);
        _energyWallet.createEnergyFor(profileId, Constants.PROFILE_INITIAL_ENERGY);

        emit Events.ProfileCreated(profileId, msg.sender);
        return profileId;
    }

    /// @inheritdoc IMy3SecHub
    function updateProfile(uint256 profileId, DataTypes.UpdateProfile calldata args) external {
        bool isProfileOwner = msg.sender == getProfileAccount(profileId);
        if (!isProfileOwner) revert Errors.NotProfileOwner();
        _my3SecProfiles.updateProfile(profileId, args.metadataURI);
    }

    /// @inheritdoc IMy3SecHub
    function giveEnergyTo(uint256 profileId, uint256 amount) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        _energyWallet.giveEnergy(senderProfileId, profileId, amount);
        emit Events.EnergyGiven(senderProfileId, profileId, amount);
    }

    /// @inheritdoc IMy3SecHub
    function removeEnergyFrom(uint256 profileId, uint256 amount) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        _energyWallet.removeEnergy(profileId, senderProfileId, amount);
        emit Events.EnergyRemoved(profileId, senderProfileId, amount);
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
    function hasWithdrawn(address organizationAddress, uint256 taskId, uint256 profileId) external view returns (bool) {
        return rewards[organizationAddress][taskId] == profileId;
    }

    /// @inheritdoc IMy3SecHub
    function createOrganization(string calldata metadataURI) external returns (address) {
        address organizationAddress = _organizationFactory.createOrganization(address(this), metadataURI);
        IOrganization organization = IOrganization(organizationAddress);
        organization.addToWhitelist(msg.sender);
        organization.transferOwnership(msg.sender);

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
        if (!organization.isWhitelisted(msg.sender)) revert Errors.NotWhitelisted();

        _organizations.add(organizationAddress);
        emit Events.OrganizationRegistered(address(organization));
    }

    /// @inheritdoc IMy3SecHub
    function joinOrganization(address organizationAddress) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);
        organization.join(senderProfileId);
        emit Events.OrganizationJoined(organizationAddress, senderProfileId);
    }

    /// @inheritdoc IMy3SecHub
    function leaveOrganization(address organizationAddress) external override {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);
        organization.leave(senderProfileId);
        emit Events.OrganizationLeft(organizationAddress, senderProfileId);
    }

    /// @inheritdoc IMy3SecHub
    function logTime(
        address organizationAddress,
        uint256 taskId,
        uint256 time
    ) external override organizationRegistered(organizationAddress) {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);

        // Use the time for today; reverts if the time is not available
        _timeWallet.spendTimeFor(senderProfileId, time);

        organization.updateTaskTime(senderProfileId, taskId, time);

        emit Events.TimeLogged(senderProfileId, time);
    }

    /// @inheritdoc IMy3SecHub
    function withdraw(address organizationAddress, uint256 taskId) external {
        uint256 senderProfileId = _my3SecProfiles.getDefaultProfileId(msg.sender);
        IOrganization organization = IOrganization(organizationAddress);

        if (organization.isTaskMember(taskId, senderProfileId) != true) revert Errors.NotMember();

        DataTypes.TaskView memory task = organization.getTask(taskId);

        if (task.status != DataTypes.TaskStatus.COMPLETED) revert Errors.NotCompleted();

        if (rewards[organizationAddress][taskId] != 0) revert Errors.AlreadyWithdrawn();
        rewards[organizationAddress][taskId] = senderProfileId;

        uint256 skillCount = task.skills.length;
        for (uint256 i = 0; i < skillCount; i++) {
            uint256 time = organization.getTaskLoggedTimeOfProfile(taskId, senderProfileId);
            _skillWallet.recordExperience(senderProfileId, task.skills[i], time / 1 hours);
        }
        emit Events.ExperienceWithdrawn(organizationAddress, taskId, senderProfileId);
    }

    function _isOrganizationContract(address organization) internal view returns (bool) {
        try IOrganization(organization).getMemberCount() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }

    //=============================================================================
    // CERTIFICATE
    //=============================================================================

    /// @inheritdoc IMy3SecHub
    function issueCertificate(uint256 profileId, string memory uri) external {
        if (msg.sender != _governanceTimelockContractAddress) revert Errors.NotGovernance();
        address account = getProfileAccount(profileId);
        uint256 certificateId = _certificateNFT.safeMint(account, uri);
        emit Events.CertificateIssued(msg.sender, profileId, certificateId);
    }

    /// @inheritdoc IMy3SecHub
    function issueCertificate(
        address organizationAddress,
        uint256 profileId,
        string memory uri
    ) external organizationRegistered(organizationAddress) {
        bool isManager = IOrganization(organizationAddress).isWhitelisted(msg.sender);
        if (!isManager) revert Errors.NotWhitelisted();
        address account = getProfileAccount(profileId);
        uint256 certificateId = _certificateNFT.safeMint(account, uri);
        emit Events.CertificateIssued(organizationAddress, profileId, certificateId);
    }

    //=============================================================================
    // EMITTERS
    //=============================================================================

    /// @inheritdoc IMy3SecHub
    function emitPendingMemberApproved(
        address organization,
        uint256 profileId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.PendingMemberApproved(organization, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function emitPendingMemberRejected(
        address organization,
        uint256 profileId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.PendingMemberRejected(organization, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function emitProjectCreated(address organization, uint256 projectId) external onlyRegisteredOrganizationCaller {
        emit Events.ProjectCreated(organization, projectId);
    }

    /// @inheritdoc IMy3SecHub
    function emitProjectUpdated(address organization, uint256 projectId) external onlyRegisteredOrganizationCaller {
        emit Events.ProjectUpdated(organization, projectId);
    }

    /// @inheritdoc IMy3SecHub
    function emitProjectMemberAdded(
        address organization,
        uint256 projectId,
        uint256 profileId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.ProjectMemberAdded(organization, projectId, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function emitProjectMemberRemoved(
        address organization,
        uint256 projectId,
        uint256 profileId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.ProjectMemberRemoved(organization, projectId, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function emitTaskCreated(
        address organization,
        uint256 projectId,
        uint256 taskId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.TaskCreated(organization, projectId, taskId);
    }

    /// @inheritdoc IMy3SecHub
    function emitTaskUpdated(address organization, uint256 taskId) external onlyRegisteredOrganizationCaller {
        emit Events.TaskUpdated(organization, taskId);
    }

    /// @inheritdoc IMy3SecHub
    function emitTaskMemberAdded(
        address organization,
        uint256 taskId,
        uint256 profileId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.TaskMemberAdded(organization, taskId, profileId);
    }

    /// @inheritdoc IMy3SecHub
    function emitTaskMemberRemoved(
        address organization,
        uint256 taskId,
        uint256 profileId
    ) external onlyRegisteredOrganizationCaller {
        emit Events.TaskMemberRemoved(organization, taskId, profileId);
    }
}
