import { environment } from 'environments/environment';
import { ethers, providers } from 'ethers';
import { Observable, from, map } from 'rxjs';

import { Injectable } from '@angular/core';

import { SkillWallet, SkillWallet__factory } from '@vaimee/my3sec-contracts/dist';

@Injectable({
  providedIn: 'root',
})
export class SkillWalletContractService {
  private contractAddress = environment.contracts.skillWallet;

  private contract: SkillWallet;

  constructor() {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    const signer = provider.getSigner();
    this.contract = SkillWallet__factory.connect(this.contractAddress, signer);
  }

  public getSkillCount(profileId: number): Observable<number> {
    return from(this.contract.getSkillCount(profileId)).pipe(map(value => value.toNumber()));
  }

  public getSkill(profileId: number, skillId: number) {
    return from(this.contract.getSkill(profileId, skillId));
  }
}
