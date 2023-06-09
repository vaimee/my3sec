import { ethers } from "hardhat";
import { expect } from "chai";

import { SkillRegistry, Events } from "../../typechain-types";
import { waitForTx } from "../helpers/utils";

const BASE_URI = "https://example.com/";
const METADATA_URI = "https://example.com/metadata.json";

describe("SkillRegistry", async () => {
  const contractFactory = await ethers.getContractFactory("SkillRegistry");

  let contract: SkillRegistry;
  let EventsLibrary: Events;

  beforeEach(async () => {
    contract = await contractFactory.deploy(BASE_URI);
    EventsLibrary = await ethers.getContractAt("Events", contract.address);
  });

  describe("Deployment", () => {
    it("should have zero skills", async () => {
      expect(await contract.getSkillCount()).to.equal(0);
    });

    it("should revert when base URI is empty", async () => {
      await expect(contractFactory.deploy("")).to.be.revertedWithCustomError(contract, "InitParamsInvalid");
    });
  });

  describe("createSkill", () => {
    it("should create a skill", async () => {
      const tx = await contract.createSkill({ metadataURI: METADATA_URI });
      await tx.wait();
      const skill = await contract.getSkill(0);
      const skillCount = await contract.getSkillCount();

      await expect(tx).to.emit(EventsLibrary, "SkillCreated").withArgs(0);
      expect(skill.id).to.equal(0);
      expect(skill.metadataURI).to.equal(METADATA_URI);
      expect(skillCount).to.equal(1);
    });

    it("should create a skill with empty metadata uri", async () => {
      const tx = await contract.createSkill({ metadataURI: "" });
      await tx.wait();
      const skill = await contract.getSkill(0);
      const skillCount = await contract.getSkillCount();

      await expect(tx).to.emit(EventsLibrary, "SkillCreated").withArgs(0);
      expect(skill.id).to.equal(0);
      expect(skill.metadataURI).to.equal(BASE_URI + "0");
      expect(skillCount).to.equal(1);
    });

    describe("updateSkill", () => {
      it("should update a skill", async () => {
        await contract.createSkill({ metadataURI: METADATA_URI });
        await waitForTx(contract.updateSkill(0, { metadataURI: "https://example.com/updated.json" }));
        const skill = await contract.getSkill(0);
        const skillCount = await contract.getSkillCount();

        expect(skill.id).to.equal(0);
        expect(skill.metadataURI).to.equal("https://example.com/updated.json");
        expect(skillCount).to.equal(1);
      });

      it("should revert when skill does not exist", async () => {
        await expect(
          contract.updateSkill(0, { metadataURI: "https://example.com/updated.json" })
        ).to.be.revertedWithCustomError(contract, "SkillNotFound");
      });
    });

    describe("getSkill", () => {
      it("should return the skill", async () => {
        await contract.createSkill({ metadataURI: METADATA_URI });
        const skill = await contract.getSkill(0);

        expect(skill.id).to.equal(0);
        expect(skill.metadataURI).to.equal(METADATA_URI);
      });

      it("should return the skill with base uri", async () => {
        await contract.createSkill({ metadataURI: "" });
        const skill = await contract.getSkill(0);

        expect(skill.id).to.equal(0);
        expect(skill.metadataURI).to.equal(`${BASE_URI}0`);
      });
    });
  });

  describe("setBaseURI", () => {
    it("should update base uri", async () => {
      const currentBaseURI = await contract.getBaseURI();
      await waitForTx(contract.setBaseURI("https://example.com/updated/"));

      const updatedBaseURI = await contract.getBaseURI();

      expect(currentBaseURI).to.equal(BASE_URI);
      expect(updatedBaseURI).to.equal("https://example.com/updated/");
    });

    it("should revert when base uri is empty", async () => {
      await expect(contract.setBaseURI("")).to.be.revertedWithCustomError(contract, "InitParamsInvalid");
    });
  });
});
