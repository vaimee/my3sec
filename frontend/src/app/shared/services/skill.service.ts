import { Observable, concatMap, forkJoin, mergeMap, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Skill } from '@profiles/interfaces';

import { IpfsService } from './ipfs.service';
import { SkillRegistryContractService } from './skill-registry-contract.service';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(
    private skillRegistry: SkillRegistryContractService,
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

  public getSkill(id: number): Observable<Skill> {
    return this.skillRegistry.getSkill(id).pipe(switchMap(data => this.ipfs.retrieveSkill(id, data.metadataURI)));
  }
}
