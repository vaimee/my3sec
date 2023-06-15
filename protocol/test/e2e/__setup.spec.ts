import { Signer } from "ethers";
import { ethers, upgrades } from "hardhat";

import {
  EnergyWallet,
  Events,
  My3SecGovernance,
  My3SecHub,
  My3SecProfiles,
  My3SecToken,
  OrganizationFactory,
  SkillRegistry,
  SkillWallet,
  TimeWallet,
  Timelock,
} from "../../typechain-types";

export const MY3SEC_TOKEN_INITIAL_SUPPLY = 10000;
export const PROFILE_INITIAL_ENERGY = 10;
export const MOCK_BASE_URI = "https://mock.com/";
export const MOCK_PROFILE_URI = "ipfs://bafkreihfyz2lialtpcscydvqxu5zwciahuk7wvgdphscnak4rg67snxsay";
export const MOCK_ORG_METADATA_URI = "ipfs://bafkreihfyz2lialtpcscydvqxu5zwciahuk7wvgdphscnak4rg67snxsay";

export let accounts: Signer[];
export let deployer: Signer;
export let user: Signer;
export let userTwo: Signer;
export let userThree: Signer;
export let deployerAddress: string;
export let userAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;

export let my3secHub: My3SecHub;
export let eventsLibrary: Events;
export let organizationFactory: OrganizationFactory;
export let my3secToken: My3SecToken;
export let timelock: Timelock;
export let my3SecGovernance: My3SecGovernance;
export let skillRegistry: SkillRegistry;
export let my3secProfiles: My3SecProfiles;
export let energyWallet: EnergyWallet;
export let timeWallet: TimeWallet;
export let skillWallet: SkillWallet;

/**
 * NOTE: this function is registered as a global before. This means that it will run once.
 */
before(async () => {
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  user = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[4];

  deployerAddress = await deployer.getAddress();
  userAddress = await user.getAddress();
  userTwoAddress = await userTwo.getAddress();
  userThreeAddress = await userThree.getAddress();

  // Factories
  const my3secHubFactory = await ethers.getContractFactory("My3SecHub");
  const organizationFactoryFactory = await ethers.getContractFactory("OrganizationFactory");
  const my3secTokenFactory = await ethers.getContractFactory("My3SecToken");
  const timelockFactory = await ethers.getContractFactory("Timelock");
  const my3SecGovernanceFactory = await ethers.getContractFactory("My3SecGovernance");
  const skillRegistryFactory = await ethers.getContractFactory("SkillRegistry");
  const my3secProfilesFactory = await ethers.getContractFactory("My3SecProfiles");
  const energyWalletFactory = await ethers.getContractFactory("EnergyWallet");
  const timeWalletFactory = await ethers.getContractFactory("TimeWallet");
  const skillWalletFactory = await ethers.getContractFactory("SkillWallet");

  // Deployments
  my3secHub = (await upgrades.deployProxy(my3secHubFactory, [])) as My3SecHub;
  eventsLibrary = await ethers.getContractAt("Events", my3secHub.address, user);
  organizationFactory = await organizationFactoryFactory.deploy();
  my3secToken = await my3secTokenFactory.deploy(my3secHub.address, MY3SEC_TOKEN_INITIAL_SUPPLY);
  timelock = await timelockFactory.deploy([], []);
  my3SecGovernance = await my3SecGovernanceFactory.deploy(my3secToken.address, timelock.address);
  skillRegistry = await skillRegistryFactory.deploy(MOCK_BASE_URI);
  my3secProfiles = (await upgrades.deployProxy(my3secProfilesFactory, [my3secHub.address])) as My3SecProfiles;
  energyWallet = (await upgrades.deployProxy(energyWalletFactory, [my3secHub.address])) as EnergyWallet;
  timeWallet = (await upgrades.deployProxy(timeWalletFactory, [my3secHub.address])) as TimeWallet;
  skillWallet = (await upgrades.deployProxy(skillWalletFactory, [my3secHub.address])) as SkillWallet;

  // Initializations
  await my3secHub.setOrganizationFactoryContract(organizationFactory.address);
  await my3secHub.setMy3SecProfilesContract(my3secProfiles.address);
  await my3secHub.setSkillRegistryContract(skillRegistry.address);
  await my3secHub.setEnergyWalletContract(energyWallet.address);
  await my3secHub.setTimeWalletContract(timeWallet.address);
  await my3secHub.setSkillWalletContract(skillWallet.address);

  const proposerRole = await timelock.PROPOSER_ROLE();
  const timelockAdminRole = await timelock.TIMELOCK_ADMIN_ROLE();
  await timelock.grantRole(proposerRole, my3SecGovernance.address);
  await timelock.revokeRole(timelockAdminRole, deployerAddress);
});
