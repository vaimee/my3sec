import { environment } from 'environments/environment';
import { ethers, providers } from 'ethers';
import { Observable, from, map } from 'rxjs';

import { Injectable } from '@angular/core';

import { SkillRegistry, SkillRegistry__factory } from '@vaimee/my3sec-contracts/dist';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/governance/SkillRegistry';

@Injectable({
  providedIn: 'root',
})
export class SkillRegistryContractService {
  private contractAddress = environment.contracts.skillRegistry;

  private contract: SkillRegistry;

  constructor() {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    const signer = provider.getSigner();
    this.contract = SkillRegistry__factory.connect(this.contractAddress, signer);
  }

  public getSkill(id: number): Observable<DataTypes.SkillViewStructOutput> {
    return from(this.contract.getSkill(id));
  }

  public getSkillCount(): Observable<number> {
    return from(this.contract.getSkillCount()).pipe(map(value => value.toNumber()));
  }
}
