import { ethers } from "hardhat";
import { expect } from "chai";

import { findEvent, waitForTx } from "../helpers/utils";

import { MOCK_ORG_METADATA_URI, my3secHub, eventsLibrary } from "./__setup.spec";
import { getRandomSigner } from "../helpers/utils";

describe("HUB: Certificate issuance", () => {
  it("should issue a certificate", async () => {
    const manager = await getRandomSigner();
    const managerAddress = await manager.getAddress();

    await waitForTx(my3secHub.connect(manager).createProfile({ metadataURI: MOCK_ORG_METADATA_URI }));
    const { id: profileId } = await my3secHub.connect(manager).getDefaultProfile(managerAddress);

    const createOrganizationTxR = await waitForTx(my3secHub.connect(manager).createOrganization(MOCK_ORG_METADATA_URI));
    const organizationAddress = findEvent(createOrganizationTxR, "OrganizationRegistered", eventsLibrary).args
      .organization;

    const issueCertificateTx = my3secHub
      .connect(manager)
      ["issueCertificate(address,uint256,string)"](organizationAddress, profileId, MOCK_ORG_METADATA_URI);
    const issueCertificateTxR = await waitForTx(issueCertificateTx);

    const certificateId = findEvent(issueCertificateTxR, "CertificateIssued", eventsLibrary).args.certificateId;

    expect(certificateId).to.exist;
    await expect(issueCertificateTx)
      .emit(eventsLibrary, "CertificateIssued")
      .withArgs(organizationAddress, profileId, certificateId);
  });

  it("should revert if the caller is not whitelisted", async () => {
    const manager = await getRandomSigner();
    const attacker = await getRandomSigner();
    const managerAddress = await manager.getAddress();

    await waitForTx(my3secHub.connect(manager).createProfile({ metadataURI: MOCK_ORG_METADATA_URI }));
    const { id: profileId } = await my3secHub.connect(manager).getDefaultProfile(managerAddress);

    const createOrganizationTxR = await waitForTx(my3secHub.connect(manager).createOrganization(MOCK_ORG_METADATA_URI));
    const organizationAddress = findEvent(createOrganizationTxR, "OrganizationRegistered", eventsLibrary).args
      .organization;

    const issueCertificateTx = my3secHub
      .connect(attacker)
      ["issueCertificate(address,uint256,string)"](organizationAddress, profileId, MOCK_ORG_METADATA_URI);

    await expect(issueCertificateTx).to.be.revertedWithCustomError(my3secHub, "NotWhitelisted");
  });

  it("should revert if the organization is not registered", async () => {
    const manager = await getRandomSigner();
    const managerAddress = await manager.getAddress();

    await waitForTx(my3secHub.connect(manager).createProfile({ metadataURI: MOCK_ORG_METADATA_URI }));
    const { id: profileId } = await my3secHub.connect(manager).getDefaultProfile(managerAddress);

    const organizationFactory = await ethers.getContractFactory("Organization");
    const organization = await organizationFactory.connect(manager).deploy(my3secHub.address, MOCK_ORG_METADATA_URI);

    await waitForTx(organization.connect(manager).addToWhitelist(managerAddress));

    const issueCertificateTx = my3secHub
      .connect(manager)
      ["issueCertificate(address,uint256,string)"](organization.address, profileId, MOCK_ORG_METADATA_URI);

    await expect(issueCertificateTx).to.be.revertedWithCustomError(my3secHub, "NotRegistered");
  });
});
