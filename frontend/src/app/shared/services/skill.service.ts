import { ethers } from 'ethers';
import { Observable, concatMap, forkJoin, map, mergeMap, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { ProfileSkill, Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/governance/SkillRegistry';

import { IpfsService } from './ipfs.service';
import { SkillRegistryContractService } from './skill-registry-contract.service';
import { SkillWalletContractService } from './skill-wallet-contract.service';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(
    private skillRegistry: SkillRegistryContractService,
    private skillWallet: SkillWalletContractService,
    private ipfs: IpfsService
  ) {}

  public getSkills(): Observable<Skill[]> {
    return this.skillRegistry.getSkillCount().pipe(
      switchMap(total => {
        const requests: Observable<DataTypes.SkillViewStructOutput>[] = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.skillRegistry.getSkill(i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      mergeMap(({ id, metadataURI }) => this.ipfs.retrieveSkill(id.toNumber(), metadataURI.replace('ipfs://', ''))),
      toArray()
    );
  }

  public getProfileSkills(profileId: number): Observable<ProfileSkill[]> {
    return this.skillWallet.getSkillCount(profileId).pipe(
      mergeMap(total => {
        const requests: Observable<[ethers.BigNumber, ethers.BigNumber]>[] = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.skillWallet.getSkill(profileId, i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      switchMap(([skill, progress]) =>
        this.getSkill(skill.toNumber()).pipe(map(skillData => ({ ...skillData, progress: progress.toNumber() })))
      ),
      toArray()
    );
  }

  public getSkill(id: number): Observable<Skill> {
    console.log('getSkill', id);
    return this.skillRegistry.getSkill(id).pipe(
      switchMap(({ id, metadataURI }) => {
        console.log('here');
        return this.ipfs.retrieveSkill(id.toNumber(), metadataURI.replace('ipfs://', ''));
      })
    );
  }
}
