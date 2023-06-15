import { Observable, map, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { Profile, ProfileMetadata } from '@shared/interfaces';

import { IpfsService } from './ipfs.service';
import { My3secHubContractService } from './my3sec-hub-contract.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private my3secHub: My3secHubContractService,
    private ipfsService: IpfsService,
    private metamaskService: MetamaskService
  ) {}

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
