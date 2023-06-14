import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/My3SecHub';
import { Observable, finalize, map, switchMap } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MetamaskService } from './../../../../auth/services/metamask.service';
import { Profile } from './../../../../modules/profiles/interfaces/profile.interface';
import { ProfileData } from './../../../../shared/interfaces';
import { EnergyWalletContract } from './../../../../shared/services/energy-wallet-contract.service';
import { IpfsService } from './../../../../shared/services/ipfs.service';
import { My3secHubContractService } from './../../../../shared/services/my3sec-hub-contract.service';
import { LoadingService } from './../../../../shared/services/loading.service';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<Profile>;
  public userWalletAddress!: string;
  public id!: number;
  public useDefaultProfile = true;

  constructor(
    private ipfsService: IpfsService,
    private my3secHubContractService: My3secHubContractService,
    private energyWalletContract: EnergyWalletContract,
    private metamaskService: MetamaskService,
    private loadingService: LoadingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.useDefaultProfile = data['useDefaultProfile'];
      this.loadingService.show();
      this.profileData$ = (this.useDefaultProfile ? this.loadDefaultProfile() : this.loadProfile()).pipe(
        switchMap((profile: DataTypes.ProfileViewStructOutput) => {
          this.id = profile.id.toNumber();
          const uri = profile.metadataURI;
          return this.ipfsService.retrieveJSON<ProfileData>(uri);
        }),
        map(profile => {
          const profileData = {
            ...profile,
            id: this.id.toString(),
            walletAddress: this.metamaskService.userAddress,
            energy: this.energyWalletContract.fetchProfileEnergyData(this.id),
            certificates: [],
            skills: [],
            projects: [],
          };
          return profileData;
        }),
        finalize(()=>{this.loadingService.hide()})
      );
    });
  }

  loadDefaultProfile() {
    return this.my3secHubContractService.getDefaultProfile(this.metamaskService.userAddress);
  }

  loadProfile() {
    this.id = parseInt(this.route.snapshot.paramMap.get('userId') as string, 0);
    return this.my3secHubContractService.getProfile(this.id);
  }
}
