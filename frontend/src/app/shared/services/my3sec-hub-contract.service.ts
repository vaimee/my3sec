import { environment } from 'environments/environment';
import { BigNumber, ethers, providers } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { Observable, forkJoin, from, map, mergeMap, of, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { Events__factory, My3SecHub, My3SecHub__factory } from '@vaimee/my3sec-contracts/dist';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/My3SecHub';

@Injectable({
  providedIn: 'root',
})
export class My3secHubContractService {
  private contractAddress = environment.contracts.my3secHub;

  private contract: My3SecHub;

  constructor(private metamaskService: MetamaskService) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    const signer = provider.getSigner();
    this.contract = My3SecHub__factory.connect(this.contractAddress, signer);
  }

  public getDefaultProfile(account: string): Observable<DataTypes.ProfileViewStructOutput> {
    return from(this.contract.getDefaultProfile(account));
  }

  public getProfile(profileId: number): Observable<DataTypes.ProfileViewStructOutput> {
    return from(this.contract.getProfile(profileId));
  }

  public getProfileAccount(profileId: number): Observable<string> {
    return from(this.contract.getProfileAccount(profileId));
  }

  public issueCertificate(
    organizationAddress: string,
    profileId: number,
    uri: string
  ): Observable<ethers.ContractReceipt> {
    return from(this.contract['issueCertificate(address,uint256,string)'](organizationAddress, profileId, uri)).pipe(
      switchMap(this.wait)
    );
  }

  public createProfile(metadataURI: string): Observable<number> {
    return from(this.contract.createProfile({ metadataURI })).pipe(
      switchMap(this.wait),
      map(receipt => {
        const event = this.findEvent(receipt, 'ProfileCreated');
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.args?.['profileId'].toNumber();
      })
    );
  }

  public createOrganization(metadataURI: string): Observable<string> {
    return from(this.contract.createOrganization(metadataURI)).pipe(
      switchMap(this.wait),
      map(receipt => {
        const event = receipt.events?.[0];
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.address;
      })
    );
  }

  public setDefaultProfile(profileId: number): Observable<unknown> {
    return from(this.contract.setDefaultProfile(profileId));
  }

  public joinOrganization(organizationAddress: string): Observable<ethers.ContractReceipt> {
    return from(this.contract.joinOrganization(organizationAddress)).pipe(switchMap(this.wait));
  }

  public leaveOrganization(organizationAddress: string): Observable<ethers.ContractReceipt> {
    return from(this.contract.leaveOrganization(organizationAddress)).pipe(switchMap(this.wait));
  }

  public giveEnergyTo(profileId: number, amount: number): Observable<ethers.ContractReceipt> {
    return from(this.contract.giveEnergyTo(profileId, amount)).pipe(switchMap(this.wait));
  }

  public removeEnergyFrom(profileId: number, amount: number): Observable<ethers.ContractReceipt> {
    return from(this.contract.removeEnergyFrom(profileId, amount)).pipe(switchMap(this.wait));
  }

  public hasWithdrawnExperience(organizationAddress: string, taskId: number, profileId: number): Observable<boolean> {
    return from(this.contract.hasWithdrawn(organizationAddress, taskId, profileId));
  }

  public hasCurrentUserWithdrawnExperience(organizationAddress: string, taskId: number): Observable<boolean> {
    return this.getDefaultProfile(this.metamaskService.userAddress).pipe(
      switchMap(({ id }) => this.hasWithdrawnExperience(organizationAddress, taskId, id.toNumber()))
    );
  }

  public getOrganizationsAddress(): Observable<string[]> {
    return from(this.contract.getOrganizationCount()).pipe(
      mergeMap(total => {
        if (total.toNumber() === 0) return of([]);
        const requests = [];
        for (let i = 0; i < total.toNumber(); i++) {
          requests.push(this.contract.getOrganization(i));
        }
        return forkJoin(requests);
      })
    );
  }

  public getOrganizationAddress(index: string): Observable<string> {
    return from(this.contract.getOrganization(index));
  }

  public logTime(organizationAddress: string, taskId: number, time: number): Observable<ethers.ContractReceipt> {
    return from(this.contract.logTime(organizationAddress, taskId, time * 60 * 60)).pipe(switchMap(this.wait));
  }

  public getOrganizationCount(): Observable<BigNumber> {
    return from(this.contract.getOrganizationCount());
  }

  public withdrawExperience(organizationAddress: string, taskId: number): Observable<ethers.ContractReceipt> {
    return from(this.contract.withdraw(organizationAddress, taskId)).pipe(switchMap(this.wait));
  }

  private wait(tx: ethers.ContractTransaction): Observable<ethers.ContractReceipt> {
    return from(tx.wait());
  }

  private findEvent(receipt: ethers.ContractReceipt, name: string, emitterAddress?: string) {
    const contractInterface = Events__factory.createInterface();

    const events = receipt.logs;

    if (events != undefined) {
      // match name from list of events in eventContract, when found, compute the sigHash
      let sigHash: string | undefined;
      for (const contractEvent of Object.keys(contractInterface.events)) {
        if (contractEvent.startsWith(name) && contractEvent.charAt(name.length) == '(') {
          sigHash = keccak256(toUtf8Bytes(contractEvent));
          break;
        }
      }
      // Throw if the sigHash was not found
      if (!sigHash) {
        throw Error(
          `Event "${name}" not found in provided contract (default: Events library). \nAre you sure you're using the right contract?`
        );
      }

      for (const emittedEvent of events) {
        // If we find one with the correct sighash, check if it is the one we're looking for
        if (emittedEvent.topics[0] == sigHash) {
          // If an emitter address is passed, validate that this is indeed the correct emitter, if not, continue
          if (emitterAddress) {
            if (emittedEvent.address != emitterAddress) continue;
          }
          const event = contractInterface.parseLog(emittedEvent);
          return event;
        }
      }
      // Throw if the event args were not expected or the event was not found in the logs
      throw Error(`Event "${name}" not found emitted by "${emitterAddress}" in given transaction log`);
    } else {
      throw Error('No events were emitted');
    }
  }
}
