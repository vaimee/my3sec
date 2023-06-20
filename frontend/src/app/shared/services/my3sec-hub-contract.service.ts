import { environment } from 'environments/environment';
import { BigNumber, ethers, providers } from 'ethers';
import { Observable, forkJoin, from, mergeMap, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { My3SecHub, My3SecHub__factory } from '@vaimee/my3sec-contracts/dist';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/My3SecHub';

@Injectable({
  providedIn: 'root',
})
export class My3secHubContractService {
  private contractAddress = environment.contracts.my3secHub;

  private contract: My3SecHub;

  constructor() {
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

  public createProfile(metadataURI: string): Observable<number> {
    const args = { metadataURI };

    return from(this.contract.createProfile(args)).pipe(
      switchMap(async tx => {
        const receipt = await tx.wait();
        const event = receipt.events?.[0];
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.args?.['profileId'].toNumber();
      })
    );
  }

  public setDefaultProfile(profileId: number): Observable<unknown> {
    return from(this.contract.setDefaultProfile(profileId));
  }

  public giveEnergyTo(profileId: number, amount: number): Observable<unknown> {
    return from(this.contract.giveEnergyTo(profileId, amount));
  }

  public removeEnergyFrom(profileId: number, amount: number): Observable<unknown> {
    return from(this.contract.removeEnergyFrom(profileId, amount));
  }

  public getOrganizationsIds(): Observable<string[]> {
    return from(this.contract.getOrganizationCount()).pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total.toNumber(); i++) {
          requests.push(this.contract.getOrganization(i));
        }
        return forkJoin(requests);
      })
    );
  }

  public getOrganizationMetadataUri(id: string): Observable<string> {
    return from(this.contract.getOrganization(id));
  }

  public getOrganizationCount(): Observable<BigNumber> {
    return from(this.contract.getOrganizationCount());
  }

  public withdrawExperience(organizationAddress: string, taskId: string): Observable<ethers.ContractTransaction> {
    return from(this.contract.withdraw(organizationAddress, taskId));
  }

  private async wait(tx: ethers.ContractTransaction): Promise<void> {
    await tx.wait();
    return;
  }

  public giveEnergyBlocking(profileId: number, amount: number) {
    return from(this.contract.giveEnergyTo(profileId, amount)).pipe(switchMap(this.wait));
  }

  public removeEnergyBlocking(profileId: number, amount: number) {
    return from(this.contract.removeEnergyFrom(profileId, amount)).pipe(switchMap(this.wait));
  }

  public withdrawExperienceBlocking(organizationAddress: string, taskId: string) {
    return from(this.contract.withdraw(organizationAddress, taskId)).pipe(switchMap(this.wait));
  }
}
