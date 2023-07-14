import { writeFileSync } from "fs";
import { ethers, upgrades } from "hardhat";
import { buildDocumentation } from "./utils";

const MY3SEC_TOKEN_INITIAL_SUPPLY = 10000000;
const SKILL_REGISTRY_BASE_URI = "https://my3sec.vaimee.com/skills/";

async function main() {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  // Factories
  const my3secHubFactory = await ethers.getContractFactory("My3SecHub");
  const organizationFactoryFactory = await ethers.getContractFactory("OrganizationFactory");
  const my3secTokenFactory = await ethers.getContractFactory("My3SecToken");
  const timelockFactory = await ethers.getContractFactory("Timelock");
  const my3SecGovernanceFactory = await ethers.getContractFactory("My3SecGovernance");
  const skillRegistryFactory = await ethers.getContractFactory("SkillRegistry");
  const certificateNFTFactory = await ethers.getContractFactory("CertificateNFT");
  const my3secProfilesFactory = await ethers.getContractFactory("My3SecProfiles");
  const energyWalletFactory = await ethers.getContractFactory("EnergyWallet");
  const timeWalletFactory = await ethers.getContractFactory("TimeWallet");
  const skillWalletFactory = await ethers.getContractFactory("SkillWallet");

  // Deployments
  console.log("\n\t-- Deploying My3SecHub --");
  const my3secHub = await upgrades.deployProxy(my3secHubFactory, []);

  console.log("\n\t-- Deploying OrganizationFactory --");
  const organizationFactory = await organizationFactoryFactory.deploy();

  console.log("\n\t-- Deploying My3SecToken --");
  const my3secToken = await my3secTokenFactory.deploy(my3secHub.address, MY3SEC_TOKEN_INITIAL_SUPPLY);

  console.log("\n\t-- Deploying Timelock --");
  const timelock = await timelockFactory.deploy([], []);

  console.log("\n\t-- Deploying My3SecGovernance --");
  const my3SecGovernance = await my3SecGovernanceFactory.deploy(my3secToken.address, timelock.address);

  console.log("\n\t-- Deploying SkillRegistry --");
  const skillRegistry = await skillRegistryFactory.deploy(SKILL_REGISTRY_BASE_URI);

  console.log("\n\t-- Deploying CertificateNFT --");
  const certificateNFT = await certificateNFTFactory.deploy();

  console.log("\n\t-- Deploying My3SecProfiles --");
  const my3secProfiles = await upgrades.deployProxy(my3secProfilesFactory, [my3secHub.address]);

  console.log("\n\t-- Deploying EnergyWallet --");
  const energyWallet = await upgrades.deployProxy(energyWalletFactory, [my3secHub.address]);

  console.log("\n\t-- Deploying TimeWallet --");
  const timeWallet = await upgrades.deployProxy(timeWalletFactory, [my3secHub.address]);

  console.log("\n\t-- Deploying SkillWallet --");
  const skillWallet = await upgrades.deployProxy(skillWalletFactory, [my3secHub.address]);

  // Initializations
  console.log("\n\t-- Initializing My3SecHub --");
  await my3secHub.setGovernanceTimelockContractAddress(timelock.address);
  await my3secHub.setOrganizationFactoryContract(organizationFactory.address);
  await my3secHub.setSkillRegistryContract(skillRegistry.address);
  await my3secHub.setCertificateNFTContract(certificateNFT.address);
  await my3secHub.setMy3SecProfilesContract(my3secProfiles.address);
  await my3secHub.setEnergyWalletContract(energyWallet.address);
  await my3secHub.setTimeWalletContract(timeWallet.address);
  await my3secHub.setSkillWalletContract(skillWallet.address);

  console.log("\n\t-- Initializing My3SecGovernance --");
  const proposerRole = await timelock.PROPOSER_ROLE();
  const timelockAdminRole = await timelock.TIMELOCK_ADMIN_ROLE();
  await timelock.grantRole(proposerRole, my3SecGovernance.address);
  await timelock.revokeRole(timelockAdminRole, deployer.address);

  console.log("\n\t-- Initializing CertificateNFT --");
  await certificateNFT.transferOwnership(my3secHub.address);

  // Save and logs addresses
  const addrs = {
    my3secHub: my3secHub.address,
    organizationFactory: organizationFactory.address,
    my3secToken: my3secToken.address,
    timelock: timelock.address,
    my3SecGovernance: my3SecGovernance.address,
    skillRegistry: skillRegistry.address,
    certificateNFT: certificateNFT.address,
    my3secProfiles: my3secProfiles.address,
    energyWallet: energyWallet.address,
    timeWallet: timeWallet.address,
    skillWallet: skillWallet.address,
  };
  const json = JSON.stringify(addrs, null, 2);
  console.log(json);

  writeFileSync("./deployed.json", json, "utf-8");
  writeFileSync("./DEPLOYED.md", buildDocumentation(addrs), "utf-8");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
