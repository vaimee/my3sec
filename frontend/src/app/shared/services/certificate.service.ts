import { ethers } from 'ethers';
import { Observable, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { CertificateMetadata } from '@shared/interfaces';

import { IpfsService } from './ipfs.service';
import { My3secHubContractService } from './my3sec-hub-contract.service';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  constructor(private my3secHub: My3secHubContractService, private ipfsService: IpfsService) {}

  public issueCertificate(
    organizationAddress: string,
    profileId: number,
    certificateMetadata: CertificateMetadata
  ): Observable<ethers.ContractReceipt> {
    return this.ipfsService
      .storeJSON(certificateMetadata)
      .pipe(switchMap(metadataUri => this.my3secHub.issueCertificate(organizationAddress, profileId, metadataUri)));
  }
}
