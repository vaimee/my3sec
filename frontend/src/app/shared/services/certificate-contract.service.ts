import { environment } from 'environments/environment';
import { ethers, providers } from 'ethers';
import { Observable, from } from 'rxjs';

import { Injectable } from '@angular/core';

import { CertificateNFT, CertificateNFT__factory } from '@vaimee/my3sec-contracts/dist';

@Injectable({
  providedIn: 'root',
})
export class CertificateContractService {
  private contractAddress = environment.contracts.certificateNFT;
  private contract: CertificateNFT;

  constructor() {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    const signer = provider.getSigner();
    this.contract = CertificateNFT__factory.connect(this.contractAddress, signer);
  }

  public getCertificateMetadataURI(certificateId: number): Observable<string> {
    return from(this.contract.tokenURI(certificateId));
  }
}
