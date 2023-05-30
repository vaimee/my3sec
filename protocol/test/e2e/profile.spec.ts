import { ethers } from "hardhat";
import { expect } from "chai";

import {
  PROFILE_INITIAL_ENERGY,
  MOCK_PROFILE_URI,
  user,
  userAddress,
  my3secHub,
  my3secToken,
  my3secProfiles,
  energyManager,
} from "./__setup.spec";

describe("HUB: Profile creation", () => {
  it("should create the user first profile", async () => {
    await my3secHub.connect(user).createProfile({ metadataURI: MOCK_PROFILE_URI });

    const profilesCount = await my3secProfiles.balanceOf(userAddress);
    const defaultProfileId = await my3secProfiles.getDefaultProfileId(userAddress);
    const totalEnergy = await energyManager.totalEnergyOf(defaultProfileId);

    expect(profilesCount).eq(1);
    expect(defaultProfileId).eq(1);
    expect(totalEnergy).eq(PROFILE_INITIAL_ENERGY);
  });

  it("should create the user second profile", async () => {
    await my3secHub.connect(user).createProfile({ metadataURI: MOCK_PROFILE_URI });

    const profilesCount = await my3secProfiles.balanceOf(userAddress);
    const defaultProfileId = await my3secProfiles.getDefaultProfileId(userAddress);
    const totalEnergy = await energyManager.totalEnergyOf(defaultProfileId);

    expect(profilesCount).eq(2);
    expect(defaultProfileId).eq(1);
    expect(totalEnergy).eq(PROFILE_INITIAL_ENERGY);
  });

  it("should retrieve the user default profile", async () => {
    const { id, metadataURI } = await my3secHub.getDefaultProfile(userAddress);
    expect(id).eq(1);
    expect(metadataURI).eq(MOCK_PROFILE_URI);
  });

  it("should retrieve the user profile by id", async () => {
    const { id, metadataURI } = await my3secHub.getProfile(2);
    expect(id).eq(2);
    expect(metadataURI).eq(MOCK_PROFILE_URI);
  });
});
