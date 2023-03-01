import { writeFileSync } from "fs";
import { ethers } from "hardhat";

async function main() {
  const My3sec = await ethers.getContractFactory("My3Sec");
  const my3sec = await My3sec.deploy();

  await my3sec.deployed();

  console.log(`My3Sec deployed to ${my3sec.address}`);

  writeFileSync(
    "./deployed.json",
    JSON.stringify({
      my3sec: my3sec.address,
    })
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
