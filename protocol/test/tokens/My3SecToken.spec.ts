import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

import { My3SecToken } from "../../typechain-types";
import { getTestResources, TestResources } from "../utils";

describe("My3SecToken", () => {
  const ONE_MILLION = 1000000;

  let resources: TestResources;
  let contract: My3SecToken;

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("My3SecToken");
    contract = await contractFactory.deploy(ONE_MILLION);
    resources = await getTestResources();
  });

  describe("Deployment", () => {
    it("should have the right initial supply", async () => {
      const initialSupply = BigNumber.from(10).pow(18).mul(ONE_MILLION);
      const totalSupply = await contract.totalSupply();
      expect(totalSupply).eq(initialSupply);
    });
  });
});
