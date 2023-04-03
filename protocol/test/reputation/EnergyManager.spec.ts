import { ethers } from "hardhat";
import { expect } from "chai";

import { EnergyManager } from "../../typechain-types";
import { getRandomProfileId, getTestResources, TestResources } from "../utils";

const PROFILE_INITIAL_ENERGY = 100;
const TOTAL_TEST_USERS = 5;

const ENERGIZED_ID = 1;
const ENERGIZER_ID = 2;

describe("EnergyManager", () => {
  let resources: TestResources;
  let contract: EnergyManager;

  beforeEach(async () => {
    const contractFactory = await ethers.getContractFactory("EnergyManager");
    contract = await contractFactory.deploy();
    resources = await getTestResources();

    await contract.addToWhitelist(resources.deployerAddress);
  });

  describe("Deployment", () => {
    it("should have initial energy equals zero", async () => {
      const totalEnergy = await contract.totalEnergyOf(ENERGIZED_ID);
      expect(totalEnergy).to.be.equal(0);
    });

    it("should have initial free energy equals to total energy", async () => {
      const totalEnergy = await contract.totalEnergyOf(ENERGIZED_ID);
      const freeEnergy = await contract.freeEnergyOf(ENERGIZED_ID);
      expect(totalEnergy).to.be.equal(freeEnergy);
    });

    it("should have initial allocated energy equals to zero", async () => {
      const allocatedEnergy = await contract.allocatedEnergyOf(ENERGIZED_ID);
      expect(allocatedEnergy).to.be.equal(0);
    });

    it("should have initial received energy equals to zero", async () => {
      const receivedEnergy = await contract.receivedEnergyOf(ENERGIZED_ID);
      expect(receivedEnergy).to.be.equal(0);
    });
  });

  describe("createEnergyFor", () => {
    it("should create energy for a profile", async () => {
      const energy = PROFILE_INITIAL_ENERGY;

      await contract.createEnergyFor(ENERGIZED_ID, energy);

      const totalEnergy = await contract.totalEnergyOf(ENERGIZED_ID);
      const freeEnergy = await contract.freeEnergyOf(ENERGIZED_ID);
      const allocatedEnergy = await contract.allocatedEnergyOf(ENERGIZED_ID);

      expect(totalEnergy).to.be.equal(energy);
      expect(freeEnergy).to.be.equal(energy);
      expect(allocatedEnergy).to.be.equal(0);
    });
  });

  describe("destroyEnergyFor", () => {
    it("should fail to give energy to himself", async () => {
      const energy = 10;

      const tx = contract.giveEnergy(ENERGIZER_ID, ENERGIZER_ID, energy);

      await expect(tx).to.be.revertedWith("Cannot give energy to yourself");
    });

    it("should fail to give too much energy", async () => {
      const energy = 1000;

      const tx = contract.giveEnergy(ENERGIZER_ID, ENERGIZED_ID, energy);

      await expect(tx).to.be.revertedWith("Insufficient energy");
    });

    it("should remove energy from a profile", async () => {
      const energy = PROFILE_INITIAL_ENERGY;
      await contract.createEnergyFor(ENERGIZED_ID, energy);

      await contract.destroyEnergyFor(ENERGIZED_ID, energy);

      const totalEnergy = await contract.totalEnergyOf(ENERGIZED_ID);
      const freeEnergy = await contract.freeEnergyOf(ENERGIZED_ID);
      const allocatedEnergy = await contract.allocatedEnergyOf(ENERGIZED_ID);

      expect(totalEnergy).to.be.equal(0);
      expect(freeEnergy).to.be.equal(0);
      expect(allocatedEnergy).to.be.equal(0);
    });
  });

  describe("giveEnergy", () => {
    beforeEach(async () => {
      await contract.createEnergyFor(ENERGIZER_ID, PROFILE_INITIAL_ENERGY);
    });

    it("should give energy to another profile", async () => {
      const energy = 10;

      await contract.giveEnergy(ENERGIZER_ID, ENERGIZED_ID, energy);

      const energizedReceivedEnergy = await contract.receivedEnergyOf(ENERGIZED_ID);
      const energizerFreeEnergy = await contract.freeEnergyOf(ENERGIZER_ID);
      const energizerTotalEnergy = await contract.totalEnergyOf(ENERGIZER_ID);
      const energizerAllocatedEnergy = await contract.allocatedEnergyOf(ENERGIZER_ID);
      const totalEnergizedByEnergizer = await contract.totalEnergizedBy(ENERGIZER_ID);
      const totalEnergizersOfEnergized = await contract.totalEnergizersOf(ENERGIZED_ID);
      const [energizedProfileId, energizedEnergy] = await contract.energizedBy(ENERGIZER_ID, 0);
      const [energizerProfileId, energizerEnergy] = await contract.energizersOf(ENERGIZED_ID, 0);

      expect(energizedReceivedEnergy).to.be.equal(energy);
      expect(energizerFreeEnergy).to.be.equal(energizerTotalEnergy.sub(energy));
      expect(energizerAllocatedEnergy).to.be.equal(energy);
      expect(totalEnergizedByEnergizer).to.be.equal(1);
      expect(totalEnergizersOfEnergized).to.be.equal(1);
      expect(energizedProfileId).to.be.equal(ENERGIZED_ID);
      expect(energizedEnergy).to.be.equal(energy);
      expect(energizerProfileId).to.be.equal(ENERGIZER_ID);
      expect(energizerEnergy).to.be.equal(energy);
    });

    it("should give energy to multiple profiles", async () => {
      const energy = 10;

      for (let i = 0; i < TOTAL_TEST_USERS; i++) {
        const energized = getRandomProfileId();

        await contract.giveEnergy(ENERGIZER_ID, energized, energy);

        const energizedReceivedEnergy = await contract.receivedEnergyOf(energized);
        const [energizedProfileId, energizedEnergy] = await contract.energizedBy(ENERGIZER_ID, i);

        expect(energizedReceivedEnergy).to.be.equal(energy);
        expect(energizedProfileId).to.be.equal(energized);
        expect(energizedEnergy).to.be.equal(energy);
      }

      const energizerFreeEnergy = await contract.freeEnergyOf(ENERGIZER_ID);
      const energizerTotalEnergy = await contract.totalEnergyOf(ENERGIZER_ID);
      const energizerAllocatedEnergy = await contract.allocatedEnergyOf(ENERGIZER_ID);
      const totalEnergizedByEnergizer = await contract.totalEnergizedBy(ENERGIZER_ID);

      expect(energizerFreeEnergy).to.be.equal(energizerTotalEnergy.sub(energy * TOTAL_TEST_USERS));
      expect(energizerAllocatedEnergy).to.be.equal(energy * TOTAL_TEST_USERS);
      expect(totalEnergizedByEnergizer).to.be.equal(TOTAL_TEST_USERS);
    });

    it("should receive energy from multiple profiles", async () => {
      const energy = 10;
      const energizers = [];

      for (let i = 0; i < TOTAL_TEST_USERS; i++) {
        const energizer = getRandomProfileId();
        energizers.push(energizer);

        await contract.createEnergyFor(energizer, PROFILE_INITIAL_ENERGY);

        await contract.giveEnergy(energizer, ENERGIZED_ID, energy);

        const energizedReceivedEnergy = await contract.receivedEnergyOf(ENERGIZED_ID);
        const senderAllocatedEnergy = await contract.allocatedEnergyOf(energizer);
        const [energizerProfileId, energizerEnergy] = await contract.energizersOf(ENERGIZED_ID, i);

        expect(energizedReceivedEnergy).to.be.equal(energy * (i + 1));
        expect(senderAllocatedEnergy).to.be.equal(energy);
        expect(energizerProfileId).to.be.equal(energizer);
        expect(energizerEnergy).to.be.equal(energy);
      }

      const totalEnergizersOfReceiver = await contract.totalEnergizersOf(ENERGIZED_ID);
      expect(totalEnergizersOfReceiver).to.be.equal(TOTAL_TEST_USERS);
    });
  });

  describe("removeEnergy", () => {
    const INITIAL_GIVEN_ENERGY = 90;

    beforeEach(async () => {
      await contract.createEnergyFor(ENERGIZER_ID, PROFILE_INITIAL_ENERGY);
      await contract.giveEnergy(ENERGIZER_ID, ENERGIZED_ID, INITIAL_GIVEN_ENERGY);
    });

    it("should fail to remove energy from a not energized profile", async () => {
      const notEnergized = getRandomProfileId();
      const energy = 10;

      const tx = contract.removeEnergy(notEnergized, ENERGIZER_ID, energy);

      await expect(tx).to.be.revertedWith("Profile not referenced");
    });

    it("should fail to remove more energy that the already allocated", async () => {
      const energy = 10000;

      const tx = contract.removeEnergy(ENERGIZED_ID, ENERGIZER_ID, energy);

      await expect(tx).to.be.revertedWith("Exceeded given energy");
    });

    it("should remove energy from an already energized profile", async () => {
      const energy = 10;

      await contract.removeEnergy(ENERGIZED_ID, ENERGIZER_ID, energy);

      const energizedReceivedEnergy = await contract.receivedEnergyOf(ENERGIZED_ID);
      const energizerFreeEnergy = await contract.freeEnergyOf(ENERGIZER_ID);
      const energizerTotalEnergy = await contract.totalEnergyOf(ENERGIZER_ID);
      const energizerAllocatedEnergy = await contract.allocatedEnergyOf(ENERGIZER_ID);
      const totalEnergizedByEnergizer = await contract.totalEnergizedBy(ENERGIZER_ID);
      const totalEnergizersOfEnergized = await contract.totalEnergizersOf(ENERGIZED_ID);
      const [energizedProfileId, energizedEnergy] = await contract.energizedBy(ENERGIZER_ID, 0);
      const [energizerProfileId, energizerEnergy] = await contract.energizersOf(ENERGIZED_ID, 0);

      expect(energizedReceivedEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
      expect(energizerFreeEnergy).to.be.equal(energizerTotalEnergy.sub(INITIAL_GIVEN_ENERGY).add(energy));
      expect(energizerAllocatedEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
      expect(totalEnergizedByEnergizer).to.be.equal(1);
      expect(totalEnergizersOfEnergized).to.be.equal(1);
      expect(energizedProfileId).to.be.equal(ENERGIZED_ID);
      expect(energizedEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
      expect(energizerProfileId).to.be.equal(ENERGIZER_ID);
      expect(energizerEnergy).to.be.equal(INITIAL_GIVEN_ENERGY - energy);
    });
  });
});
