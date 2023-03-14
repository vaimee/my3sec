import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

import { EnergyManager } from "../../typechain-types";
import { getTestResources, TestResources } from "../utils";

describe("EnergyManager", () => {
  let resources: TestResources;
  let contract: EnergyManager;

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("EnergyManager");
    contract = await contractFactory.deploy();
    resources = await getTestResources();
  });

  describe("Deployment", () => {
    it("should have initial energy for address equals zero", async () => {
      await expect(contract.totalEnergyOf(resources.deployerAddress)).to.eventually.be.equal(0);
    });

    it("should have initial free energy for address equals to total energy", async () => {
      await expect(contract.totalEnergyOf(resources.deployerAddress)).to.eventually.be.equal(
        await contract.freeEnergyOf(resources.deployerAddress)
      );
    });

    it("should have initial allocated energy equals to zero", async () => {
      await expect(contract.allocatedEnergyOf(resources.deployerAddress)).to.eventually.be.equal(0);
    });

    it("should have initial received energy equals to zero", async () => {
      await expect(contract.receivedEnergyOf(resources.deployerAddress)).to.eventually.be.equal(0);
    });
  });

  describe("createEnergyFor", () => {
    it("should create energy for an address", async () => {
      const energy = 100;
      const receiver = ethers.Wallet.createRandom().address;

      await contract.createEnergyFor(receiver, energy);

      await expect(contract.totalEnergyOf(receiver)).to.eventually.be.equal(energy);
      await expect(contract.freeEnergyOf(receiver)).to.eventually.be.equal(energy);
      await expect(contract.allocatedEnergyOf(receiver)).to.eventually.be.equal(0);
    });
  });

  describe("destroyEnergyFor", () => {
    const receiver = ethers.Wallet.createRandom().address;

    beforeEach(async () => {
      await contract.createEnergyFor(receiver, 100);
    });

    it("should remove energy for an address", async () => {
      const energy = 100;

      await contract.destroyEnergyFor(receiver, energy);

      await expect(contract.totalEnergyOf(receiver)).to.eventually.be.equal(0);
      await expect(contract.freeEnergyOf(receiver)).to.eventually.be.equal(0);
      await expect(contract.allocatedEnergyOf(receiver)).to.eventually.be.equal(0);
    });
  });

  describe("giveEnergyTo", () => {
    beforeEach(async () => {
      const [_, energizer] = await ethers.getSigners();

      await contract.createEnergyFor(energizer.address, 100);
      contract.connect(energizer);
    });

    it("should give energy to another address", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energy = 10;
      const energized = ethers.Wallet.createRandom().address;

      await contract.connect(energizer).giveEnergyTo(energized, energy);

      expect(contract.receivedEnergyOf(energized)).to.be.eventually.equal(energy);
      expect(contract.freeEnergyOf(energizer.address)).to.eventually.be.equal(
        (await contract.totalEnergyOf(energizer.address)).toNumber() - energy
      );
      expect(contract.allocatedEnergyOf(energizer.address)).to.eventually.be.equal(energy);
    });

    it("should fail to give energy to himself", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energy = 10;

      await expect(contract.connect(energizer).giveEnergyTo(energizer.address, energy)).to.be.revertedWith(
        "Cannot give energy to yourself"
      );
    });

    it("should fail to give too much energy", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energy = 1000;
      const energized = ethers.Wallet.createRandom().address;

      await expect(contract.connect(energizer).giveEnergyTo(energized, energy)).to.be.revertedWith(
        "Insufficient energy"
      );
    });
  });
});
