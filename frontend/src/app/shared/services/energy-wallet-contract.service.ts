import { environment } from 'environments/environment';
import { BigNumber, ethers, providers } from 'ethers';
import { Observable, from, map } from 'rxjs';

import { Injectable } from '@angular/core';

import { ProfileEnergyData } from '@profiles/interfaces';
import { EnergyWallet, EnergyWallet__factory } from '@vaimee/my3sec-contracts/dist';

@Injectable({
  providedIn: 'root',
})
// Add service
export class EnergyWalletContractService {
  private contractAddress = environment.contracts.energyWallet;
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private contract: EnergyWallet;

  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    this.signer = this.provider.getSigner();
    this.contract = EnergyWallet__factory.connect(this.contractAddress, this.signer);
  }

  public fetchProfileEnergyData(profileId: number): ProfileEnergyData {
    return {
      energizedBy$: this.totalEnergizedBy(profileId),
      receivedEnergyOf$: this.receivedEnergyOf(profileId),
      energizersOf$: this.totalEnergizersOf(profileId),
      totalEnergyOf$: this.totalEnergyOf(profileId),
      freeEnergyOf$: this.freeEnergyOf(profileId),
    };
  }

  public totalEnergizersOf(profileId: number): Observable<number> {
    return from(this.contract.totalEnergizersOf(profileId)).pipe(map((energy: ethers.BigNumber) => energy.toNumber()));
  }

  public totalEnergyOf(profileId: number): Observable<number> {
    return from(this.contract.totalEnergyOf(profileId)).pipe(map((energy: ethers.BigNumber) => energy.toNumber()));
  }

  public allocatedEnergyOf(profileId: number): Observable<number> {
    return from(this.contract.allocatedEnergyOf(profileId)).pipe(map((energy: ethers.BigNumber) => energy.toNumber()));
  }

  public freeEnergyOf(profileId: number): Observable<number> {
    return from(this.contract.freeEnergyOf(profileId)).pipe(map((energy: ethers.BigNumber) => energy.toNumber()));
  }

  public totalEnergizedBy(profileId: number): Observable<number> {
    return from(this.contract.totalEnergizedBy(profileId)).pipe(map((energy: ethers.BigNumber) => energy.toNumber()));
  }

  public receivedEnergyOf(profileId: number): Observable<number> {
    return from(this.contract.receivedEnergyOf(profileId)).pipe(map((energy: ethers.BigNumber) => energy.toNumber()));
  }

  public energizersOf(profileId: number, index: number): Observable<[number, number]> {
    return from(this.contract.energizersOf(profileId, index)).pipe(
      map((energizer: [BigNumber, BigNumber]) => [energizer[0].toNumber(), energizer[1].toNumber()])
    );
  }
}
