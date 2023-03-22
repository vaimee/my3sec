import { ethers } from "hardhat";
import { expect } from "chai";

import { EnergyManager } from "../../typechain-types";
import { getRandomAddress, getTestResources, TestResources } from "../utils";

const ACCOUNT_INITIAL_ENERGY = 100;
const TOTAL_TEST_USERS = 5;

describe("EnergyManager", () => {
  let resources: TestResources;
  let contract: EnergyManager;

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("EnergyManager");
    contract = await contractFactory.deploy();
    resources = await getTestResources();
  });

  describe("Deployment", () => {
    it("should have initial energy equals zero", async () => {
      const { deployerAddress } = resources;
      const deployerTotalEnergy = await contract.totalEnergyOf(deployerAddress);
      expect(deployerTotalEnergy).to.be.equal(0);
    });

    it("should have initial free energy equals to total energy", async () => {
      const { deployerAddress } = resources;
      const deployerTotalEnergy = await contract.totalEnergyOf(deployerAddress);
      const deployerFreeEnergy = await contract.freeEnergyOf(resources.deployerAddress);
      expect(deployerTotalEnergy).to.be.equal(deployerFreeEnergy);
    });

    it("should have initial allocated energy equals to zero", async () => {
      const { deployerAddress } = resources;
      const deployerAllocatedEnergy = await contract.allocatedEnergyOf(deployerAddress);
      expect(deployerAllocatedEnergy).to.be.equal(0);
    });

    it("should have initial received energy equals to zero", async () => {
      const { deployerAddress } = resources;
      const deployerReceivedEnergy = await contract.receivedEnergyOf(deployerAddress);
      expect(deployerReceivedEnergy).to.be.equal(0);
    });
  });

  describe("createEnergyFor", () => {
    it("should create energy for an address", async () => {
      const receiverAddress = getRandomAddress();
      const energy = ACCOUNT_INITIAL_ENERGY;

      await contract.createEnergyFor(receiverAddress, energy);

      const receiverTotalEnergy = await contract.totalEnergyOf(receiverAddress);
      const receiverFreeEnergy = await contract.freeEnergyOf(receiverAddress);
      const receiverAllocatedEnergy = await contract.allocatedEnergyOf(receiverAddress);

      expect(receiverTotalEnergy).to.be.equal(energy);
      expect(receiverFreeEnergy).to.be.equal(energy);
      expect(receiverAllocatedEnergy).to.be.equal(0);
    });
  });

  describe("destroyEnergyFor", () => {
    it("should fail to give energy to himself", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energy = 10;

      const tx = contract.connect(energizer).giveEnergyTo(energizer.address, energy);

      await expect(tx).to.be.revertedWith("Cannot give energy to yourself");
    });

    it("should fail to give too much energy", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energizedAddress = getRandomAddress();
      const energy = 1000;

      const tx = contract.connect(energizer).giveEnergyTo(energizedAddress, energy);

      await expect(tx).to.be.revertedWith("Insufficient energy");
    });

    it("should remove energy from an address", async () => {
      const targetAddress = getRandomAddress();
      const energy = ACCOUNT_INITIAL_ENERGY;
      await contract.createEnergyFor(targetAddress, energy);

      await contract.destroyEnergyFor(targetAddress, energy);

      const targetTotalEnergy = await contract.totalEnergyOf(targetAddress);
      const targetFreeEnergy = await contract.freeEnergyOf(targetAddress);
      const targetAllocatedEnergy = await contract.allocatedEnergyOf(targetAddress);

      expect(targetTotalEnergy).to.be.equal(0);
      expect(targetFreeEnergy).to.be.equal(0);
      expect(targetAllocatedEnergy).to.be.equal(0);
    });
  });

  describe("giveEnergyTo", () => {
    beforeEach(async () => {
      const [_, energizer] = await ethers.getSigners();

      await contract.createEnergyFor(energizer.address, ACCOUNT_INITIAL_ENERGY);
      contract.connect(energizer);
    });

    it("should give energy to another address", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energizerAddress = energizer.address;
      const energizedAddress = getRandomAddress();
      const energy = 10;

      await contract.connect(energizer).giveEnergyTo(energizedAddress, energy);

      const energizedReceivedEnergy = await contract.receivedEnergyOf(energizedAddress);
      const energizerFreeEnergy = await contract.freeEnergyOf(energizerAddress);
      const energizerTotalEnergy = await contract.totalEnergyOf(energizerAddress);
      const energizerAllocatedEnergy = await contract.allocatedEnergyOf(energizerAddress);
      const totalEnergizedByEnergizer = await contract.totalEnergizedBy(energizerAddress);
      const totalEnergizersOfEnergized = await contract.totalEnergizersOf(energizedAddress);
      const [retrievedEnergizedAddress, retrievedEnergizedEnergy] = await contract.energizedBy(energizerAddress, 0);
      const [retrievedEnergizerAddress, retrievedEnergizerEnergy] = await contract.energizersOf(energizedAddress, 0);

      expect(energizedReceivedEnergy).to.be.equal(energy);
      expect(energizerFreeEnergy).to.be.equal(energizerTotalEnergy.sub(energy));
      expect(energizerAllocatedEnergy).to.be.equal(energy);
      expect(totalEnergizedByEnergizer).to.be.equal(1);
      expect(totalEnergizersOfEnergized).to.be.equal(1);
      expect(retrievedEnergizedAddress).to.be.equal(energizedAddress);
      expect(retrievedEnergizedEnergy).to.be.equal(energy);
      expect(retrievedEnergizerAddress).to.be.equal(energizerAddress);
      expect(retrievedEnergizerEnergy).to.be.equal(energy);
    });

    it("should give energy to multiple addresses", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energizerAddress = energizer.address;
      const energy = 10;

      for (let i = 0; i < TOTAL_TEST_USERS; i++) {
        const receiverAddress = getRandomAddress();

        await contract.connect(energizer).giveEnergyTo(receiverAddress, energy);

        const receiverReceivedEnergy = await contract.receivedEnergyOf(receiverAddress);
        const [energizedAddress, energizedEnergy] = await contract.energizedBy(energizerAddress, i);

        expect(receiverReceivedEnergy).to.be.equal(energy);
        expect(energizedAddress).to.be.equal(receiverAddress);
        expect(energizedEnergy).to.be.equal(energy);
      }

      const energizerFreeEnergy = await contract.freeEnergyOf(energizerAddress);
      const energizerTotalEnergy = await contract.totalEnergyOf(energizerAddress);
      const energizerAllocatedEnergy = await contract.allocatedEnergyOf(energizerAddress);
      const totalEnergizedByEnergizer = await contract.totalEnergizedBy(energizerAddress);

      expect(energizerFreeEnergy).to.be.equal(energizerTotalEnergy.sub(energy * TOTAL_TEST_USERS));
      expect(energizerAllocatedEnergy).to.be.equal(energy * TOTAL_TEST_USERS);
      expect(totalEnergizedByEnergizer).to.be.equal(TOTAL_TEST_USERS);
    });

    it("should receive energy from multiple addresses", async () => {
      const signers = await ethers.getSigners();
      const receiverAddress = getRandomAddress();
      const energy = 10;

      for (let i = 0; i < TOTAL_TEST_USERS; i++) {
        await contract.createEnergyFor(signers[i].address, ACCOUNT_INITIAL_ENERGY);

        await contract.connect(signers[i]).giveEnergyTo(receiverAddress, energy);

        const receiverReceivedEnergy = await contract.receivedEnergyOf(receiverAddress);
        const senderAllocatedEnergy = await contract.allocatedEnergyOf(signers[i].address);
        const [energizerAddress, energizerEnergy] = await contract.energizersOf(receiverAddress, i);

        expect(receiverReceivedEnergy).to.be.equal(energy * (i + 1));
        expect(senderAllocatedEnergy).to.be.equal(energy);
        expect(energizerAddress).to.be.equal(signers[i].address);
        expect(energizerEnergy).to.be.equal(energy);
      }

      const totalEnergizersOfReceiver = await contract.totalEnergizersOf(receiverAddress);
      expect(totalEnergizersOfReceiver).to.be.equal(TOTAL_TEST_USERS);
    });
  });

  describe("removeEnergyFrom", () => {
    const INITIAL_GIVEN_ENERGY = 90;

    let energizerAddress: string;
    let energizedAddress: string;

    beforeEach(async () => {
      const [_, energizer] = await ethers.getSigners();

      await contract.createEnergyFor(energizer.address, ACCOUNT_INITIAL_ENERGY);
      contract.connect(energizer);

      energizerAddress = energizer.address;
      energizedAddress = getRandomAddress();

      await contract.connect(energizer).giveEnergyTo(energizedAddress, INITIAL_GIVEN_ENERGY);
    });

    it("should fail to remove energy from a not energized address", async () => {
      const [_, energizer] = await ethers.getSigners();
      const targetAddress = getRandomAddress();
      const energy = 10;

      const tx = contract.connect(energizer).removeEnergyFrom(targetAddress, energy);

      await expect(tx).to.be.revertedWith("Account not referenced");
    });

    it("should fail to remove more energy that the already allocated", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energy = 10000;

      const tx = contract.connect(energizer).removeEnergyFrom(energizedAddress, energy);

      await expect(tx).to.be.revertedWith("Exceeded given energy");
    });

    it("should remove energy from an already energized address", async () => {
      const [_, energizer] = await ethers.getSigners();
      const energy = 10;

      await contract.connect(energizer).removeEnergyFrom(energizedAddress, energy);

      const energizedReceivedEnergy = await contract.receivedEnergyOf(energizedAddress);
      const energizerFreeEnergy = await contract.freeEnergyOf(energizerAddress);
      const energizerTotalEnergy = await contract.totalEnergyOf(energizerAddress);
      const energizerAllocatedEnergy = await contract.allocatedEnergyOf(energizerAddress);
      const totalEnergizedByEnergizer = await contract.totalEnergizedBy(energizerAddress);
      const totalEnergizersOfEnergized = await contract.totalEnergizersOf(energizedAddress);
      const [retrievedEnergizedAddress, retrievedEnergizedEnergy] = await contract.energizedBy(energizerAddress, 0);
      const [retrievedEnergizerAddress, retrievedEnergizerEnergy] = await contract.energizersOf(energizedAddress, 0);

      expect(energizedReceivedEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
      expect(energizerFreeEnergy).to.be.equal(energizerTotalEnergy.sub(INITIAL_GIVEN_ENERGY).add(energy));
      expect(energizerAllocatedEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
      expect(totalEnergizedByEnergizer).to.be.equal(1);
      expect(totalEnergizersOfEnergized).to.be.equal(1);
      expect(retrievedEnergizedAddress).to.be.equal(energizedAddress);
      expect(retrievedEnergizedEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
      expect(retrievedEnergizerAddress).to.be.equal(energizerAddress);
      expect(retrievedEnergizerEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
    });
  });
});
