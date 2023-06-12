import { LoadingService } from './loading.service';
import { Injectable } from '@angular/core';
import { ContractTransaction, ethers, providers } from 'ethers';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, finalize, from, map, switchMap } from 'rxjs';
import {My3SecHub, My3SecHub__factory} from '@vaimee/my3sec-contracts/dist';

@Injectable({
  providedIn: 'root',
})
export class My3secHubContractService {
  private contractAddress = environment.contracts.my3secHub;
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private contract: My3SecHub;

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    this.provider = new ethers.providers.Web3Provider(
      window.ethereum as providers.ExternalProvider,
      'any'
    );

    this.signer = this.provider.getSigner();
    
    this.contract = My3SecHub__factory.connect(this.contractAddress, this.signer);
  }
  public getDefaultProfile(account: string): Observable<string[]> {
    this.loadingService.show();

    return from(this.contract.getDefaultProfile(account)).pipe(
      map((value) => value as string[]),
      finalize(() => this.loadingService.hide())
    );
  }

  public getProfile(profileId: number): Observable<unknown> {
    return from(this.contract.getProfile(profileId));
  }

  public createProfile(metadataURI: string): Observable<number> {
    this.loadingService.show();
    const args = { metadataURI };
    
    return from(this.contract.createProfile(args)).pipe(
      switchMap((tx) =>
        (tx as ContractTransaction)
          .wait()
          .then((receipt: ethers.ContractReceipt) => {
            const event = receipt.events?.[0];
            if (!event) {
              throw new Error('Event not found in transaction receipt');
            }
            return event.args?.['profileId'].toNumber();
          })
      ),
      finalize(() => this.loadingService.hide())
    );
  }

  public setDefaultProfile(profileId: number): Observable<unknown> {
    return from(this.contract.setDefaultProfile(profileId));
  }

  public giveEnergyTo(profileId: number, amount: number): Observable<unknown> {
    return from(this.contract.giveEnergyTo(profileId, amount));
  }

  public removeEnergyFrom(
    profileId: number,
    amount: number
  ): Observable<unknown> {
    return from(this.contract.removeEnergyFrom(profileId, amount));
  }

}
