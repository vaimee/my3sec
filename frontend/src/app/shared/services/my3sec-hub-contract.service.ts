import { Injectable } from '@angular/core';
import { ethers, providers } from 'ethers';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class My3secHubContractService {
  private contractAddress = environment.contracts.my3secHub;
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Signer;
  private contract!: ethers.Contract;
  constructor(private http: HttpClient) {
    this.provider = new ethers.providers.Web3Provider(
      window.ethereum as providers.ExternalProvider,
      'any'
    );

    this.signer = this.provider.getSigner();
    this.http
      .get<ethers.ContractInterface>(environment.abiPaths.my3secHub)
      .subscribe((abi) => {
        console.log(abi);
        this.contract = new ethers.Contract(
          this.contractAddress,
          abi,
          this.signer
        );
      });
  }

  async createProfile(uri: string): Promise<number> {
    await this.provider.send('eth_requestAccounts', []);
    const args = {
      uri,
    };
    const tx = await this.contract['createProfile'](args);
    const receipt = await tx.wait();
    return receipt.events[0].args[0].toNumber();
  }

  async getDefaultProfile(account: string): Promise<{ uri: string }> {
    const profile = await this.contract['getDefaultProfile'](account);
    return {
      uri: profile.uri,
    };
  }

  async getProfile(profileId: number): Promise<{ uri: string }> {
    const profile = await this.contract['getProfile'](profileId);
    return {
      uri: profile.uri,
    };
  }

  async giveEnergyTo(profileId: number, amount: number): Promise<void> {
    const tx = await this.contract['giveEnergyTo'](profileId, amount);
    await tx.wait();
  }

  async removeEnergyFrom(profileId: number, amount: number): Promise<void> {
    const tx = await this.contract['removeEnergyFrom'](profileId, amount);
    await tx.wait();
  }
}
