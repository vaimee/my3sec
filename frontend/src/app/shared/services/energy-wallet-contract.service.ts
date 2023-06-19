import { environment } from 'environments/environment';
import { BigNumber, ethers, providers } from 'ethers';
import { Observable, concatMap, count, filter, forkJoin, from, map, mergeMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { ProfileEnergyData } from '@profiles/interfaces';
import { EnergyWallet, EnergyWallet__factory } from '@vaimee/my3sec-contracts/dist';

@Injectable({
  providedIn: 'root',
})
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
      totalEndorsing$: this.countEndorsing(profileId),
      receivedEnergyOf$: this.receivedEnergyOf(profileId),
      totalEndorsers$: this.countEndorsers(profileId),
      totalEnergyOf$: this.totalEnergyOf(profileId),
      freeEnergyOf$: this.freeEnergyOf(profileId),
    };
  }

  private countEnergizers(profileId: number, isEndorsing: boolean): Observable<number> {
    const totalFn = isEndorsing
      ? this.totalEnergizedBy.bind(this, profileId)
      : this.totalEnergizersOf.bind(this, profileId);
    const energizerFn = isEndorsing ? this.energizedBy.bind(this, profileId) : this.energizersOf.bind(this, profileId);

    return totalFn().pipe(
      mergeMap((energizers: number) => {
        const requests = [];
        for (let i = 0; i < energizers; i++) {
          requests.push(energizerFn(i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      filter(data => data[1] > 0),
      count()
    );
  }

  public countEndorsing(profileId: number): Observable<number> {
    return this.countEnergizers(profileId, true)
  }

  public countEndorsers(profileId: number): Observable<number> {
    return this.countEnergizers(profileId, false)
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

  public energizedBy(profileId: number, index: number): Observable<[number, number]> {
    return from(this.contract.energizedBy(profileId, index)).pipe(
      map((energizer: [BigNumber, BigNumber]) => [energizer[0].toNumber(), energizer[1].toNumber()])
    );
  }
}
