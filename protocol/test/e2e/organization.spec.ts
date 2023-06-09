import { ethers } from "hardhat";
import { expect } from "chai";

import { waitForTx } from "../helpers/utils";

import {
  PROFILE_INITIAL_ENERGY,
  MOCK_ORG_METADATA_URI,
  user,
  userAddress,
  userTwo,
  my3secHub,
  skillWallet,
} from "./__setup.spec";
import { getRandomSigner } from "../helpers/utils";

describe("HUB: Organization creation and registration", () => {
  it("should create a new organization", async () => {
    const EventsLibrary = await ethers.getContractAt("Events", my3secHub.address, user);
    const currentOrgsCount = await my3secHub.getOrganizationCount();

    const orgCreationTransaction = await my3secHub.connect(user).createOrganization(MOCK_ORG_METADATA_URI);
    const nextOrgsCount = await my3secHub.getOrganizationCount();

    await expect(orgCreationTransaction).emit(EventsLibrary, "OrganizationRegistered");
    expect(nextOrgsCount).to.be.greaterThan(currentOrgsCount);
  });

  it("should register an organization", async () => {
    const EventsLibrary = await ethers.getContractAt("Events", my3secHub.address, user);
    const organizationFactory = await ethers.getContractFactory("Organization");
    const organization = await organizationFactory.connect(user).deploy(my3secHub.address, MOCK_ORG_METADATA_URI);
    const currentOrgsCount = await my3secHub.getOrganizationCount();

    await waitForTx(organization.connect(user).addToWhitelist(userAddress));

    const orgCreationTransaction = await my3secHub.connect(user).registerOrganization(organization.address);
    const nextOrgsCount = await my3secHub.getOrganizationCount();

    expect(nextOrgsCount).to.be.greaterThan(currentOrgsCount);
    await expect(orgCreationTransaction).emit(EventsLibrary, "OrganizationRegistered").withArgs(organization.address);
  });

  it("should revert registration of an organization if the contract is not IOrganization", async () => {
    const orgCreationTransaction = my3secHub.connect(user).registerOrganization(my3secHub.address);

    await expect(orgCreationTransaction).to.be.revertedWithCustomError(my3secHub, "InvalidContract");
  });

  describe("Organization logging hours", () => {
    it("should get experience from logged hours", async () => {
      const manager = await getRandomSigner();
      const worker = await getRandomSigner();
      const managerAddress = await manager.getAddress();
      const workerAddress = await worker.getAddress();

      const EventsLibrary = await ethers.getContractAt("Events", my3secHub.address, user);
      const organizationFactory = await ethers.getContractFactory("Organization");
      const organization = await organizationFactory.connect(manager).deploy(my3secHub.address, MOCK_ORG_METADATA_URI);

      await waitForTx(organization.connect(manager).addToWhitelist(managerAddress));

      await waitForTx(my3secHub.connect(manager).createProfile({ metadataURI: MOCK_ORG_METADATA_URI }));
      await waitForTx(my3secHub.connect(worker).createProfile({ metadataURI: MOCK_ORG_METADATA_URI }));

      const { id: managerProfileId } = await my3secHub.connect(manager).getDefaultProfile(managerAddress);
      const { id: workerProfileId } = await my3secHub.connect(worker).getDefaultProfile(workerAddress);

      await waitForTx(my3secHub.connect(manager).registerOrganization(organization.address));

      await waitForTx(organization.connect(manager).createProject({ metadataURI: MOCK_ORG_METADATA_URI }));

      await waitForTx(
        organization.connect(manager).createTask(0, { metadataURI: MOCK_ORG_METADATA_URI, skills: [0, 1, 2] })
      );

      await waitForTx(organization.connect(manager).addProjectMember(0, workerProfileId));
      await waitForTx(organization.connect(manager).addTaskMember(0, 0, workerProfileId));

      for (let i = 0; i < 3; i++) {
        await waitForTx(my3secHub.connect(worker).logTime(organization.address, 0, 0, 3600));
      }

      await waitForTx(
        organization
          .connect(manager)
          .updateTask(0, 0, { metadataURI: MOCK_ORG_METADATA_URI, skills: [0, 1, 2], status: 2 })
      );

      await waitForTx(my3secHub.connect(worker).withdraw(organization.address, 0, 0));

      // TODO: check all the skills
      const tuple = await skillWallet.getSkill(workerProfileId, 0);
      expect(tuple[1]).to.be.equal(3);
    });
  });
});
