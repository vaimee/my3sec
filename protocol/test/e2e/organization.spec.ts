import { ethers } from "hardhat";
import { expect } from "chai";

import { PROFILE_INITIAL_ENERGY, MOCK_ORG_METADATA_URI, user, userAddress, my3secHub } from "./__setup.spec";

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
    const organization = await organizationFactory.deploy(my3secHub.address, MOCK_ORG_METADATA_URI);
    const currentOrgsCount = await my3secHub.getOrganizationCount();

    const orgCreationTransaction = await my3secHub.connect(user).registerOrganization(organization.address);
    const nextOrgsCount = await my3secHub.getOrganizationCount();

    expect(nextOrgsCount).to.be.greaterThan(currentOrgsCount);
    await expect(orgCreationTransaction).emit(EventsLibrary, "OrganizationRegistered").withArgs(organization.address);
  });

  it("should revert registration of an organization if the contract is not IOrganization", async () => {
    const orgCreationTransaction = my3secHub.connect(user).registerOrganization(my3secHub.address);

    await expect(orgCreationTransaction).to.be.revertedWithCustomError(my3secHub, "InvalidContract");
  });
});
