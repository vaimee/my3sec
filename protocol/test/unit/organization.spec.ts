import { ethers } from "hardhat";
import { expect } from "chai";

import { Organization } from "../../typechain-types";
import { getRandomProfileId } from "../helpers/utils";

const FAKE_METADATA_URI = "urn:dev:fake";

describe("Organization", () => {
  let contract: Organization;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const deployerAddress = deployer.address;

    const contractFactory = await ethers.getContractFactory("Organization");
    contract = await contractFactory.deploy(deployerAddress, FAKE_METADATA_URI);
    await contract.addToWhitelist(deployerAddress);
  });

  describe("Deployment", () => {
    it("should have store the metadata uri", async () => {
      const metadataUri = await contract.getMetadataURI();
      expect(metadataUri).to.be.equal(FAKE_METADATA_URI);
    });

    it("should have initial member count to zero", async () => {
      const memberCount = await contract.getMemberCount();
      expect(memberCount).to.be.equal(0);
    });

    it("should have initial pending member count to zero", async () => {
      const pendingMemberCount = await contract.getPendingMemberCount();
      expect(pendingMemberCount).to.be.equal(0);
    });
  });

  describe("join", () => {
    it("should let a profile join", async () => {
      const profileId = getRandomProfileId();

      await contract.join(profileId);

      const pendingMemberCount = await contract.getPendingMemberCount();
      const isMember = await contract.isMember(profileId);
      expect(pendingMemberCount).to.be.equal(1);
      expect(isMember).to.be.false;
    });

    it("should not add twice a profile if is pending", async () => {
      const profileId = getRandomProfileId();

      await contract.join(profileId);
      await contract.join(profileId);

      const pendingMemberCount = await contract.getPendingMemberCount();
      const isMember = await contract.isMember(profileId);
      expect(pendingMemberCount).to.be.equal(1);
      expect(isMember).to.be.false;
    });

    describe("approvePendingMember", () => {
      it("should approve joined member", async () => {
        const profileId = getRandomProfileId();

        await contract.join(profileId);

        let pendingMembers = await contract.getPendingMemberCount();
        expect(pendingMembers).to.be.equal(1);

        await contract.approvePendingMember(profileId);

        const memberCount = await contract.getMemberCount();
        const isMember = await contract.isMember(profileId);
        pendingMembers = await contract.getPendingMemberCount();
        expect(memberCount).to.be.equal(1);
        expect(pendingMembers).to.be.equal(0);
        expect(isMember).to.be.true;
      });

      it("should revert if is not a pending member", async () => {
        const profileId = getRandomProfileId();

        const pendingMembers = contract.approvePendingMember(profileId);
        await expect(pendingMembers).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });

      it("should revert if is already a member", async () => {
        const profileId = getRandomProfileId();

        await contract.join(profileId);
        await contract.approvePendingMember(profileId);

        const pendingMembers = contract.approvePendingMember(profileId);
        await expect(pendingMembers).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });

      describe("leave", () => {
        it("should let a member leave", async () => {
          const profileId = getRandomProfileId();

          await contract.join(profileId);
          await contract.approvePendingMember(profileId);

          await contract.leave(profileId);

          const memberCount = await contract.getMemberCount();
          const isMember = await contract.isMember(profileId);
          expect(memberCount).to.be.equal(0);
          expect(isMember).to.be.false;
        });

        it("should let a member leave also if his only pending", async () => {
          const profileId = getRandomProfileId();

          await contract.join(profileId);

          await contract.leave(profileId);

          const pendingMemberCount = await contract.getPendingMemberCount();
          const isMember = await contract.isMember(profileId);
          expect(pendingMemberCount).to.be.equal(0);
          expect(isMember).to.be.false;
        });

        it("should revert if not a member", async () => {
          const profileId = getRandomProfileId();

          const leave = contract.leave(profileId);
          await expect(leave).to.be.revertedWithCustomError(contract, "NotMember");
        });
      });
    });

    describe("rejectPendingMember", () => {
      it("should reject pending member", async () => {
        const profileId = getRandomProfileId();

        await contract.join(profileId);

        await contract.rejectPendingMember(profileId);

        const pendingMembers = await contract.getPendingMemberCount();
        expect(pendingMembers).to.be.equal(0);
      });

      it("should revert when rejecting a not pending member", async () => {
        const profileId = getRandomProfileId();

        const reject = contract.rejectPendingMember(profileId);

        await expect(reject).to.be.revertedWithCustomError(contract, "NotPendingMember");
      });
    });
  });
});
