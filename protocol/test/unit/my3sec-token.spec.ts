import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

import { My3SecToken } from "../../typechain-types";

describe("My3SecToken", () => {
  const ONE_MILLION = 1000000;

  let contract: My3SecToken;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const deployerAddress = deployer.address;

    const contractFactory = await ethers.getContractFactory("My3SecToken");
    contract = await contractFactory.deploy(deployerAddress, ONE_MILLION);
  });

  describe("Deployment", () => {
    it("should have the right initial supply", async () => {
      const initialSupply = BigNumber.from(10).pow(18).mul(ONE_MILLION);
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).eq(initialSupply);
    });
  });
});
