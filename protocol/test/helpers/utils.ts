import { Signer, ContractTransaction, ContractReceipt } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

export async function getRandomSigner(): Promise<Signer> {
  const signers = await ethers.getSigners();
  const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

  await waitForTx(signers[0].sendTransaction({ to: wallet.address, value: ethers.utils.parseEther("1") }));

  return wallet;
}

export function getRandomAddress(): string {
  return ethers.Wallet.createRandom().address;
}

export function getRandomProfileId(): number {
  return Math.floor(Math.random() * 10000) + 10;
}

// This function is from Lens Protocol
export async function waitForTx(
  tx: Promise<ContractTransaction> | ContractTransaction,
  skipCheck = false
): Promise<ContractReceipt> {
  if (!skipCheck) await expect(tx).to.not.be.reverted;
  return await (await tx).wait();
}
