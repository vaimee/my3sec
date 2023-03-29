import { writeFileSync } from "fs";
import { ethers } from "hardhat";

async function main() {
  const My3SecHub = await ethers.getContractFactory("My3SecHub");
  const my3secHub = await My3SecHub.deploy();

  await my3secHub.deployed();

  console.log(`My3SecHub deployed to ${my3secHub.address}`);

  writeFileSync(
    "./deployed.json",
    JSON.stringify({
      my3sec: my3secHub.address,
    })
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
