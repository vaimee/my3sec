import { ethers } from "hardhat";
import { Signer } from "ethers";

export interface TestResources {
  deployer: Signer;
  deployerAddress: string;
}

export async function getTestResources(): Promise<TestResources> {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();
  return {
    deployer,
    deployerAddress,
  };
}

export function getRandomAddress(): string {
  return ethers.Wallet.createRandom().address;
}

export function getRandomProfileId(): number {
  return Math.floor(Math.random() * 10000) + 10;
}
