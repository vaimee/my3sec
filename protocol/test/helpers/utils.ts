import { Signer } from "ethers";
import { ethers } from "hardhat";

export async function getRandomSigner(): Promise<Signer> {
  const signers = await ethers.getSigners();
  const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
  const tx = await signers[0].sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") });
  tx.wait();
  return wallet;
}

export function getRandomAddress(): string {
  return ethers.Wallet.createRandom().address;
}

export function getRandomProfileId(): number {
  return Math.floor(Math.random() * 10000) + 10;
}
