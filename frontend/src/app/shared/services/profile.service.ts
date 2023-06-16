import { Observable, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { Profile, ProfileMetadata } from '@shared/interfaces';

import { EnergyWalletContractService } from './energy-wallet-contract.service';
import { IpfsService } from './ipfs.service';
import { My3secHubContractService } from './my3sec-hub-contract.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private my3secHub: My3secHubContractService,
    private energyWalletContract: EnergyWalletContractService,
    private ipfsService: IpfsService,
    private metamaskService: MetamaskService
  ) {}

  public getEnergyEndorsedTo(endorsedId: number, endorsingId: number): Observable<number> {
    return this.energyWalletContract.totalEnergizersOf(endorsedId).pipe(
      mergeMap((energizers: number) => {
        if (energizers <= 0) return of(0);
        const requests = [];
        for (let i = 0; i < energizers; i++) {
          requests.push(this.energyWalletContract.energizersOf(endorsedId, i));
        }
        return forkJoin(requests).pipe(
          map((results: [number, number][]) => this.getEnergyEndorsedToFromArray(endorsingId, results))
        );
      })
    );
  }

  private getEnergyEndorsedToFromArray(endorsingId: number, results: [number, number][]) {
    const matchingId = results.filter(item => item[0] === endorsingId).map(item => item[1]);
    if (matchingId.length > 0) return matchingId[0];
    return 0;
  }

  public getDefaultProfile(account: string): Observable<Profile> {
    return this.my3secHub.getDefaultProfile(account).pipe(
      switchMap(({ id, metadataURI }) => {
        return this.ipfsService.retrieveJSON<ProfileMetadata>(metadataURI).pipe(
          map(data => {
            const walletAddress = this.metamaskService.userAddress;
            return { id: id.toString(), walletAddress, ...data };
          })
        );
      })
    );
  }
}
