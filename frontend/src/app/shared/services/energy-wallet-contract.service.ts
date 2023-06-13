import { BigNumber } from 'ethers';
import { LoadingService } from './loading.service';
import { Injectable } from '@angular/core';
import { ethers, providers } from 'ethers';
import { environment } from 'environments/environment';
import { Observable, finalize, from, map, switchMap } from 'rxjs';
import {
  EnergyWallet,
  EnergyWallet__factory,
} from '@vaimee/my3sec-contracts/dist';

@Injectable({
  providedIn: 'root',
})
export class EnergyWalletContract {
  private contractAddress = environment.contracts.energyWallet;
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private contract: EnergyWallet;

  constructor(private loadingService: LoadingService) {
    this.provider = new ethers.providers.Web3Provider(
      window.ethereum as providers.ExternalProvider,
      'any'
    );
    this.signer = this.provider.getSigner();
    this.contract = EnergyWallet__factory.connect(
      this.contractAddress,
      this.signer
    );
  }
  public totalEnergyOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.totalEnergyOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public totalEnergizersOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.totalEnergizersOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }
}
