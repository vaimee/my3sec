import { ethers } from "hardhat";

export function getRandomAddress(): string {
  return ethers.Wallet.createRandom().address;
}

export function getRandomProfileId(): number {
  return Math.floor(Math.random() * 10000) + 10;
}
