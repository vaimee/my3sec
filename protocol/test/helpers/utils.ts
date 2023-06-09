import { Signer, ContractTransaction, ContractReceipt, logger, Contract } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
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

// This function is from Lens Protocol
export function findEvent(receipt: ContractReceipt, name: string, eventContract: Contract, emitterAddress?: string) {
  const events = receipt.logs;

  if (events != undefined) {
    // match name from list of events in eventContract, when found, compute the sigHash
    let sigHash: string | undefined;
    for (const contractEvent of Object.keys(eventContract.interface.events)) {
      if (contractEvent.startsWith(name) && contractEvent.charAt(name.length) == "(") {
        sigHash = keccak256(toUtf8Bytes(contractEvent));
        break;
      }
    }
    // Throw if the sigHash was not found
    if (!sigHash) {
      logger.throwError(
        `Event "${name}" not found in provided contract (default: Events libary). \nAre you sure you're using the right contract?`
      );
    }

    for (const emittedEvent of events) {
      // If we find one with the correct sighash, check if it is the one we're looking for
      if (emittedEvent.topics[0] == sigHash) {
        // If an emitter address is passed, validate that this is indeed the correct emitter, if not, continue
        if (emitterAddress) {
          if (emittedEvent.address != emitterAddress) continue;
        }
        const event = eventContract.interface.parseLog(emittedEvent);
        return event;
      }
    }
    // Throw if the event args were not expected or the event was not found in the logs
    logger.throwError(`Event "${name}" not found emitted by "${emitterAddress}" in given transaction log`);
  } else {
    logger.throwError("No events were emitted");
  }
}
