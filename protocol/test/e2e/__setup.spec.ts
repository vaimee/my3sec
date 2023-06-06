import { Signer } from "ethers";
import { ethers } from "hardhat";

import { EnergyWallet, My3SecHub, My3SecProfiles, My3SecToken, OrganizationFactory } from "../../typechain-types";

export const MY3SEC_TOKEN_INITIAL_SUPPLY = 10000;
export const PROFILE_INITIAL_ENERGY = 10;
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
export let organizationFactory: OrganizationFactory;
export let my3secToken: My3SecToken;
export let my3secProfiles: My3SecProfiles;
export let energyWallet: EnergyWallet;

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
  const my3secProfilesFactory = await ethers.getContractFactory("My3SecProfiles");
  const energyWalletFactory = await ethers.getContractFactory("EnergyWallet");

  // Deployments
  my3secHub = await my3secHubFactory.deploy();
  organizationFactory = await organizationFactoryFactory.deploy();
  my3secToken = await my3secTokenFactory.deploy(my3secHub.address, MY3SEC_TOKEN_INITIAL_SUPPLY);
  my3secProfiles = await my3secProfilesFactory.deploy(my3secHub.address);
  energyWallet = await energyWalletFactory.deploy(my3secHub.address);

  // Initializations
  await my3secHub.setOrganizationFactoryContract(organizationFactory.address);
  await my3secHub.setMy3SecProfilesContract(my3secProfiles.address);
  await my3secHub.setEnergyWalletContract(energyWallet.address);
});
