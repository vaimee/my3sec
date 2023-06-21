import { Observable, concatMap, filter, forkJoin, map, mergeMap, of, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { Profile, ProfileMetadata } from '@shared/interfaces';
import { SkillService } from '@shared/services/skill.service';

import { EndorserItem, ProfileSkill } from '@profiles/interfaces';

import { EnergyWalletContractService } from './energy-wallet-contract.service';
import { IpfsService } from './ipfs.service';
import { My3secHubContractService } from './my3sec-hub-contract.service';
import { SkillWalletContractService } from './skill-wallet-contract.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private my3secHub: My3secHubContractService,
    private energyWalletContract: EnergyWalletContractService,
    private ipfsService: IpfsService,
    private metamaskService: MetamaskService,
    private skillWallet: SkillWalletContractService,
    private skillService: SkillService
  ) {}

  public getEndorsers(profileId: number): Observable<EndorserItem[]> {
    return this.energyWalletContract.totalEnergizedBy(profileId).pipe(
      mergeMap((energizers: number) => {
        const requests = [];
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
        const requests = [];
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
        const requests = [];
        for (let i = 0; i < energizers; i++) {
          requests.push(this.energyWalletContract.energizersOf(endorsedId, i));
        }
        return forkJoin(requests).pipe(
          map((results: [number, number][]) => this.getEnergyEndorsedToFromArray(endorserId, results))
        );
      })
    );
  }

  private getEnergyEndorsedToFromArray(endorserId: number, results: [number, number][]) {
    const matchingId = results.filter(item => item[0] === endorserId).map(item => item[1]);
    if (matchingId.length > 0) return matchingId[0];
    return 0;
  }

  public getProfile(profileId: number): Observable<Profile> {
    return this.my3secHub.getProfile(profileId).pipe(
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

  public getSkills(profileId: number): Observable<ProfileSkill[]> {
    return this.skillWallet.getSkillCount(profileId).pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.skillWallet.getSkill(profileId, i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      switchMap(([skill, progress]) =>
        this.skillService
          .getSkill(skill.toNumber())
          .pipe(map(skillData => ({ ...skillData, progress: progress.toNumber() })))
      ),
      toArray()
    );
  }
}
