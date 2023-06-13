import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { IpfsService } from 'app/shared/services/ipfs.service';
import { Component, OnInit } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { MetamaskService } from 'app/authentication/services/metamask.service';
import { ProfileData } from 'app/shared/interfaces';
import { ImageConversionService } from 'app/shared/services/image-conversion.service';
import { ActivatedRoute } from '@angular/router';
import { Profile } from 'app/user-profile/interfaces/profile.interface';
import { EnergyWalletContract } from 'app/shared/services/energy-wallet-contract.service';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/My3SecHub';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<Profile>;
  public userWalletAddress!: string;
  public id!: number;
  public decodedImage!: Blob;
  public useDefaultProfile = true;

  constructor(
    private ipfsService: IpfsService,
    private my3secHubContractService: My3secHubContractService,
    private energyWallerContract: EnergyWalletContract,
    private metamaskService: MetamaskService,
    private imageConversion: ImageConversionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.useDefaultProfile = data['useDefaultProfile'];

      this.profileData$ = (
        this.useDefaultProfile ? this.loadDefaultProfile() : this.loadProfile()
      ).pipe(
        switchMap((profile: DataTypes.ProfileViewStructOutput) => {
          this.id = profile.id.toNumber();
          const uri = profile.metadataURI;
          return this.ipfsService.retrieveJSON<ProfileData>(uri);
        }),
        switchMap(async (profile) => {
          await this.decodeProfilePicture(profile.profileImage);
          return profile;
        }),
        map((profile) => {
          const profileData = {
            ...profile,
            id: this.id.toString(),
            walletAddress: this.metamaskService.userAddress,
            endorsers$: from([]),
            energy$: this.energyWallerContract.totalEnergyOf(this.id),
            certificates: [],
            skills: [],
            projects: [],
          };
          return profileData;
        })
      );
    });
  }

  loadDefaultProfile() {
    return this.my3secHubContractService.getDefaultProfile(
      this.metamaskService.userAddress
    );
  }

  loadProfile() {
    this.id = parseInt(this.route.snapshot.paramMap.get('userId') as string, 0);
    return this.my3secHubContractService.getProfile(this.id);
  }

  async decodeProfilePicture(encodedPicture: string): Promise<void> {
    try {
      this.decodedImage = await this.imageConversion.decodeBase64Image(
        encodedPicture
      );
    } catch (error) {
      console.error('Failed to decode profile picture:', error);
    }
  }
}
