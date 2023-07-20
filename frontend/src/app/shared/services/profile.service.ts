import { ethers } from 'ethers';
import {
  Observable,
  catchError,
  concatMap,
  count,
  filter,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
  toArray,
} from 'rxjs';

import { Injectable } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { Profile, ProfileMetadata } from '@shared/interfaces';

import { EndorserItem } from '@profiles/interfaces';

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

  public getEndorsers(profileId: number): Observable<EndorserItem[]> {
    return this.energyWalletContract.totalEnergizedBy(profileId).pipe(
      mergeMap((energizers: number) => {
        const requests: Observable<[number, number]>[] = [];
        for (let i = 0; i < energizers; i++) {
          requests.push(this.energyWalletContract.energizedBy(profileId, i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      filter(data => data[1] > 0),
      mergeMap(data =>
        this.getProfile(data[0]).pipe(
          map(profile => ({
            firstName: profile.firstName,
            surname: profile.surname,
            id: data[0],
            energy: data[1],
            profileImage: profile.profileImage,
          }))
        )
      ),
      toArray()
    );
  }

  public getEndorsing(profileId: number): Observable<EndorserItem[]> {
    return this.energyWalletContract.totalEnergizersOf(profileId).pipe(
      mergeMap((energizers: number) => {
        const requests: Observable<[number, number]>[] = [];
        for (let i = 0; i < energizers; i++) {
          requests.push(this.energyWalletContract.energizersOf(profileId, i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      filter(data => data[1] > 0),
      mergeMap(data =>
        this.getProfile(data[0]).pipe(
          map(profile => ({
            firstName: profile.firstName,
            surname: profile.surname,
            id: data[0],
            energy: data[1],
            profileImage: profile.profileImage,
          }))
        )
      ),
      toArray()
    );
  }

  public getEnergyEndorsedTo(endorserId: number, endorsedId: number): Observable<number> {
    return this.energyWalletContract.totalEnergizersOf(endorsedId).pipe(
      mergeMap((energizers: number) => {
        if (energizers <= 0) return of(0);
        const requests: Observable<[number, number]>[] = [];
        for (let i = 0; i < energizers; i++) {
          requests.push(this.energyWalletContract.energizersOf(endorsedId, i));
        }
        return forkJoin(requests).pipe(
          map((results: [number, number][]) => this.getEnergyEndorsedToFromArray(endorserId, results))
        );
      })
    );
  }

  public doesUserProfileExist(): Observable<boolean> {
    return this.my3secHub.getDefaultProfile(this.metamaskService.userAddress).pipe(
      map(value => {
        if (value === undefined) return false;
        return true;
      }),
      catchError(error => {
        console.log('error when reading profile - redirect to signup', error);
        return of(false);
      })
    );
  }

  public createProfile(profileMetadata: ProfileMetadata): Observable<number> {
    return this.ipfsService.storeJSON(profileMetadata).pipe(switchMap(uri => this.my3secHub.createProfile(uri)));
  }

  public updateProfile(profileId: number, profileMetadata: ProfileMetadata): Observable<ethers.ContractReceipt> {
    return this.ipfsService
      .storeJSON(profileMetadata)
      .pipe(switchMap(uri => this.my3secHub.updateProfile(profileId, uri)));
  }

  private getEnergyEndorsedToFromArray(endorserId: number, results: [number, number][]) {
    const matchingId = results.filter(item => item[0] === endorserId).map(item => item[1]);
    if (matchingId.length > 0) return matchingId[0];
    return 0;
  }

  public getProfileCount(maxItems = 100): Observable<number> {
    const profileIds = [];
    for (let i = 1; i <= maxItems; i++) profileIds.push(of(i));
    return forkJoin(profileIds).pipe(
      concatMap(num => num),
      mergeMap(id => {
        return this.getProfile(id).pipe(catchError(() => of(false)));
      }),
      filter((data: Profile | boolean) => {
        return data !== false;
      }),
      count()
    );
  }

  public getProfile(profileId: number): Observable<Profile> {
    return this.my3secHub.getProfile(profileId).pipe(
      switchMap(({ id, metadataURI }) => {
        return this.my3secHub
          .getProfileAccount(id.toNumber())
          .pipe(
            switchMap(walletAddress =>
              this.ipfsService
                .retrieveJSON<ProfileMetadata>(metadataURI)
                .pipe(map(data => ({ id: id.toString(), walletAddress, ...data })))
            )
          );
      })
    );
  }

  public getProfiles(): Observable<Profile[]> {
    return this.getProfileCount().pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 1; i <= total; i++) {
          requests.push(this.getProfile(i));
        }
        return forkJoin(requests);
      })
    );
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

  public getUserId(): Observable<number> {
    return this.my3secHub.getDefaultProfile(this.metamaskService.userAddress).pipe(map(({ id }) => id.toNumber()));
  }
}
