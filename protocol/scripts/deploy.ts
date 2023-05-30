import { writeFileSync } from "fs";
import { ethers } from "hardhat";

const MY3SEC_TOKEN_INITIAL_SUPPLY = 10000000;

async function main() {
  // Factories
  const my3secHubFactory = await ethers.getContractFactory("My3SecHub");
  const my3secTokenFactory = await ethers.getContractFactory("My3SecToken");
  const my3secProfilesFactory = await ethers.getContractFactory("My3SecProfiles");
  const energyManagerFactory = await ethers.getContractFactory("EnergyManager");
  const timeWalletFactory = await ethers.getContractFactory("TimeWallet");

  // Deployments
  console.log("\n\t-- Deploying My3SecHub --");
  const my3secHub = await my3secHubFactory.deploy();

  console.log("\n\t-- Deploying My3SecToken --");
  const my3secToken = await my3secTokenFactory.deploy(my3secHub.address, MY3SEC_TOKEN_INITIAL_SUPPLY);

  console.log("\n\t-- Deploying My3SecProfiles --");
  const my3secProfiles = await my3secProfilesFactory.deploy(my3secHub.address);

  console.log("\n\t-- Deploying EnergyManager --");
  const energyManager = await energyManagerFactory.deploy(my3secHub.address);

  console.log("\n\t-- Deploying TimeWallet --");
  const timeWallet = await timeWalletFactory.deploy(my3secHub.address);

  // Initializations
  console.log("\n\t-- Initializing My3SecHub --");
  await my3secHub.setMy3SecProfilesContract(my3secProfiles.address);
  await my3secHub.setEnergyManagerContract(energyManager.address);
  await my3secHub.setTimeWalletContract(timeWallet.address);

  // Save and logs addresses
  const addrs = {
    my3secHub: my3secHub.address,
    my3secToken: my3secToken.address,
    my3secProfiles: my3secProfiles.address,
    energyManager: energyManager.address,
    timeWallet: timeWallet.address,
  };
  const json = JSON.stringify(addrs, null, 2);
  console.log(json);

  writeFileSync("./deployed.json", json, "utf-8");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
