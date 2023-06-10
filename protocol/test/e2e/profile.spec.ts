import { expect } from "chai";

import {
  PROFILE_INITIAL_ENERGY,
  MOCK_PROFILE_URI,
  my3secHub,
  eventsLibrary,
  my3secProfiles,
  energyWallet,
} from "./__setup.spec";
import { findEvent, getRandomSigner, waitForTx } from "../helpers/utils";

describe("HUB: Profile creation", () => {
  it("should create the user first profile", async () => {
    const randomUser = await getRandomSigner();
    const randomUserAddress = await randomUser.getAddress();

    const receipt = await waitForTx(my3secHub.connect(randomUser).createProfile({ metadataURI: MOCK_PROFILE_URI }));

    const event = await findEvent(receipt, "ProfileCreated", eventsLibrary);
    const profilesCount = await my3secProfiles.balanceOf(randomUserAddress);
    const defaultProfileId = await my3secProfiles.getDefaultProfileId(randomUserAddress);
    const totalEnergy = await energyWallet.totalEnergyOf(defaultProfileId);

    expect(event.args.profileId).is.greaterThan(0);
    expect(profilesCount).eq(1);
    expect(defaultProfileId).eq(event.args.profileId);
    expect(totalEnergy).eq(PROFILE_INITIAL_ENERGY);
  });

  it("should create the user second profile", async () => {
    const randomUser = await getRandomSigner();
    const randomUserAddress = await randomUser.getAddress();

    const firstProfileReceipt = await waitForTx(
      my3secHub.connect(randomUser).createProfile({ metadataURI: MOCK_PROFILE_URI })
    );

    const secondProfileReceipt = await waitForTx(
      my3secHub.connect(randomUser).createProfile({ metadataURI: MOCK_PROFILE_URI })
    );

    const firstEvent = await findEvent(firstProfileReceipt, "ProfileCreated", eventsLibrary);
    const secondEvent = await findEvent(secondProfileReceipt, "ProfileCreated", eventsLibrary);
    const profilesCount = await my3secProfiles.balanceOf(randomUserAddress);
    const defaultProfileId = await my3secProfiles.getDefaultProfileId(randomUserAddress);
    const totalEnergy = await energyWallet.totalEnergyOf(defaultProfileId);

    expect(firstEvent.args.profileId).is.greaterThan(0);
    expect(secondEvent.args.profileId).is.greaterThan(0);
    expect(profilesCount).eq(2);
    expect(defaultProfileId).eq(firstEvent.args.profileId);
    expect(totalEnergy).eq(PROFILE_INITIAL_ENERGY);
  });

  it("should retrieve the user default profile", async () => {
    const randomUser = await getRandomSigner();
    const randomUserAddress = await randomUser.getAddress();

    const receipt = await waitForTx(my3secHub.connect(randomUser).createProfile({ metadataURI: MOCK_PROFILE_URI }));
    const event = await findEvent(receipt, "ProfileCreated", eventsLibrary);

    const { id, metadataURI } = await my3secHub.getDefaultProfile(randomUserAddress);

    expect(id).eq(event.args.profileId);
    expect(metadataURI).eq(MOCK_PROFILE_URI);
  });

  it("should retrieve the user profile by id", async () => {
    const randomUser = await getRandomSigner();

    const receipt = await waitForTx(my3secHub.connect(randomUser).createProfile({ metadataURI: MOCK_PROFILE_URI }));
    const event = await findEvent(receipt, "ProfileCreated", eventsLibrary);

    const { id, metadataURI } = await my3secHub.getProfile(event.args.profileId);

    expect(id).eq(event.args.profileId);
    expect(metadataURI).eq(MOCK_PROFILE_URI);
  });
});
