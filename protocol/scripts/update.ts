import { writeFileSync } from "fs";
import { ethers, upgrades } from "hardhat";
import * as deployed from "../deployed.json";
import { buildDocumentation } from "./utils";

async function main() {
  // Factories
  const my3secHubFactory = await ethers.getContractFactory("My3SecHub");
  const my3secProfilesFactory = await ethers.getContractFactory("My3SecProfiles");
  const energyWalletFactory = await ethers.getContractFactory("EnergyWallet");
  const timeWalletFactory = await ethers.getContractFactory("TimeWallet");
  const skillWalletFactory = await ethers.getContractFactory("SkillWallet");

  // Deployments
  console.log("\n\t-- Upgrading My3SecHub --");
  const my3secHub = await upgrades.upgradeProxy(deployed.my3secHub, my3secHubFactory);

  console.log("\n\t-- Upgrading My3SecProfiles --");
  const my3secProfiles = await upgrades.upgradeProxy(deployed.my3secProfiles, my3secProfilesFactory, {
    call: {
      fn: "setHub",
      args: [my3secHub.address],
    },
  });

  console.log("\n\t-- Upgrading EnergyWallet --");
  const energyWallet = await upgrades.upgradeProxy(deployed.energyWallet, energyWalletFactory, {
    call: {
      fn: "setHub",
      args: [my3secHub.address],
    },
  });

  console.log("\n\t-- Upgrading TimeWallet --");
  const timeWallet = await upgrades.upgradeProxy(deployed.timeWallet, timeWalletFactory, {
    call: {
      fn: "setHub",
      args: [my3secHub.address],
    },
  });

  console.log("\n\t-- Upgrading SkillWallet --");
  const skillWallet = await upgrades.upgradeProxy(deployed.skillWallet, skillWalletFactory, {
    call: {
      fn: "setHub",
      args: [my3secHub.address],
    },
  });

  // Initializations
  console.log("\n\t-- Initializing My3SecHub --");
  await my3secHub.setOrganizationFactoryContract(deployed.organizationFactory);
  await my3secHub.setSkillRegistryContract(deployed.skillRegistry);
  await my3secHub.setMy3SecProfilesContract(my3secProfiles.address);
  await my3secHub.setEnergyWalletContract(energyWallet.address);
  await my3secHub.setTimeWalletContract(timeWallet.address);
  await my3secHub.setSkillWalletContract(skillWallet.address);

  // Save and logs addresses
  const addrs = {
    my3secHub: my3secHub.address,
    organizationFactory: deployed.organizationFactory,
    my3secToken: deployed.my3secHub,
    skillRegistry: deployed.skillRegistry,
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
