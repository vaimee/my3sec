import { LoadingService } from './loading.service';
import { Injectable } from '@angular/core';
import { ContractTransaction, ethers, providers } from 'ethers';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, finalize, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class My3secHubContractService {
  private contractAddress = environment.contracts.my3secHub;
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private contract!: ethers.Contract;

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    this.provider = new ethers.providers.Web3Provider(
      window.ethereum as providers.ExternalProvider,
      'any'
    );

    this.signer = this.provider.getSigner();
    this.http
      .get<ethers.ContractInterface>(environment.abiPaths.my3secHub)
      .subscribe((abi) => {
        this.contract = new ethers.Contract(
          this.contractAddress,
          abi,
          this.signer
        );
      });
  }
  public getDefaultProfile(account: string): Observable<string[]> {
    this.loadingService.show();
    if (this.contract === undefined)
      return this.initializeContract().pipe(
        switchMap(() => from(this.contract['getDefaultProfile'](account))),
        map((value) => value as string[]),
        finalize(() => this.loadingService.hide())
      );

    return from(this.contract['getDefaultProfile'](account)).pipe(
      map((value) => value as string[]),
      finalize(() => this.loadingService.hide())
    );
  }

  public getProfile(profileId: number): Observable<unknown> {
    return from(this.contract['getProfile'](profileId));
  }

  public createProfile(uri: string): Observable<number> {
    this.loadingService.show();
    const args = { uri };

    return from(this.contract['createProfile'](args)).pipe(
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
    return from(this.contract['setDefaultProfile'](profileId));
  }

  public giveEnergyTo(profileId: number, amount: number): Observable<unknown> {
    return from(this.contract['giveEnergyTo'](profileId, amount));
  }

  public removeEnergyFrom(
    profileId: number,
    amount: number
  ): Observable<unknown> {
    return from(this.contract['removeEnergyFrom'](profileId, amount));
  }

  private initializeContract() {
    return this.http
      .get<ethers.ContractInterface>(environment.abiPaths.my3secHub)
      .pipe(
        map((abi) => {
          this.contract = new ethers.Contract(
            this.contractAddress,
            abi,
            this.signer
          );
        })
      );
  }
}
