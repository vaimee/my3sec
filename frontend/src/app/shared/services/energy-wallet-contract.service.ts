import { LoadingService } from './loading.service';
import { Injectable } from '@angular/core';
import { BigNumber, ethers, providers } from 'ethers';
import { environment } from 'environments/environment';
import { Observable, finalize, from, map } from 'rxjs';
import {
  EnergyWallet,
  EnergyWallet__factory,
} from '@vaimee/my3sec-contracts/dist';
import { ProfileEnergyData } from 'app/user-profile/interfaces';

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

  public fetchProfileEnergyData(profileId: number): ProfileEnergyData {
    return {
      energizedBy$: this.totalEnergizedBy(profileId),
      receivedEnergyOf$: this.receivedEnergyOf(profileId),
      allocatedEnergyOf$: this.allocatedEnergyOf(profileId),
      energizersOf$: this.totalEnergizersOf(profileId),
      totalEnergyOf$: this.totalEnergyOf(profileId),
    };
  }

  public totalEnergizersOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.totalEnergizersOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public totalEnergyOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.totalEnergyOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public allocatedEnergyOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.allocatedEnergyOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public freeEnergyOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.freeEnergyOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public totalEnergizedBy(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.totalEnergizedBy(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public receivedEnergyOf(profileId: number): Observable<number> {
    this.loadingService.show();
    return from(this.contract.receivedEnergyOf(profileId)).pipe(
      map((energy: ethers.BigNumber) => energy.toNumber()),
      finalize(() => this.loadingService.hide())
    );
  }

  public energizersOf(
    profileId: number,
    index: number
  ): Observable<[BigNumber, BigNumber]> {
    this.loadingService.show();
    return from(this.contract.energizersOf(profileId, index)).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}
