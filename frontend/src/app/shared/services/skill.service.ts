import { Observable, concatMap, forkJoin, mergeMap, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/governance/SkillRegistry';

import { IpfsService } from './ipfs.service';
import { SkillRegistryContractService } from './skill-registry-contract.service';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private skillRegistry: SkillRegistryContractService, private ipfs: IpfsService) {}

  public getSkills(): Observable<Skill[]> {
    return this.skillRegistry.getSkillCount().pipe(
      switchMap(total => {
        console.log(total);
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

  public getSkill(id: number): Observable<Skill> {
    console.log('getSkill', id);
    return this.skillRegistry.getSkill(id).pipe(
      mergeMap(({ id, metadataURI }) => {
        console.log('here');
        return this.ipfs.retrieveSkill(id.toNumber(), metadataURI.replace('ipfs://', ''));
      })
    );
  }
}
