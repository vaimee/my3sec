import { Observable, concatMap, forkJoin, map, mergeMap, of, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { ProfileSkill, Skill } from '@profiles/interfaces';

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

  public getAllSkills(): Observable<Skill[]> {
    return this.skillRegistry.getSkillCount().pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.skillRegistry.getSkill(i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      switchMap(({ id, metadataURI }) => this.ipfs.retrieveSkill(id.toNumber(), metadataURI)),
      toArray()
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
        this.getSkill(skill.toNumber()).pipe(map(skillData => ({ ...skillData, progress: progress.toNumber() })))
      ),
      toArray()
    );
  }

  public getSkill(id: number): Observable<Skill> {
    return this.skillRegistry.getSkill(id).pipe(switchMap(data => this.ipfs.retrieveSkill(id, data.metadataURI)));
  }
}
