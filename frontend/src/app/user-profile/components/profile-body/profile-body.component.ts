import { My3SecEnergyManagerContractService } from './../../../shared/services/my3-sec-energy-manager-contract.service';
import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { IpfsService } from 'app/shared/services/ipfs.service';
import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { MetamaskService } from 'app/authentication/services/metamask.service';
import { ProfileData } from 'app/shared/interfaces';
import { Profile } from 'app/user-profile/models';
import { ImageConversionService } from 'app/shared/services/image-conversion.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<ProfileData>;
  public userWalletAddress!: string;
  public profile!: Profile;
  public id!: number;
  public energy!: any;
  public decodedImage!: Blob;
  public useDefaultProfile: boolean = true;

  constructor(
    private ipfsService: IpfsService,
    private my3secHubContractService: My3secHubContractService,
    private my3SecEnergyManagerContractService: My3SecEnergyManagerContractService,
    private metamaskService: MetamaskService,
    private imageConversion: ImageConversionService,
    private route: ActivatedRoute
  ) {}
  

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.useDefaultProfile = data['useDefaultProfile'];
      this.useDefaultProfile ? this.loadDefaultProfile() : this.loadProfile();
    });
  }

  loadDefaultProfile() {
    this.profileData$ = this.my3secHubContractService
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(
        switchMap((profileUrl) => {
          this.id = profileUrl.id;
          this.energy = this.my3SecEnergyManagerContractService.totalEnergyOf(
            profileUrl.id
          );
          return profileUrl.metadataURI;
        }),
        switchMap((profileUrl) =>
          this.ipfsService.retrieveJSON<ProfileData>(profileUrl[0])
        )
      );

    this.profileData$.subscribe((data) => {
      this.profile = new Profile(
        `${data.firstName} ${data.surname}`,
        this.id,
        this.metamaskService.userAddress
      );
    });
  }

  loadProfile() {
    this.id = this.route.snapshot.paramMap.get('userId') as unknown as number; //work around -- test later

    this.profileData$ = this.my3secHubContractService
      .getProfile(this.id)
      .pipe(
        switchMap((profileUrl) => {
          this.id = profileUrl.id;
          this.energy = this.my3SecEnergyManagerContractService.totalEnergyOf(
            profileUrl.id
          );
          console.log(this.energy);
          return profileUrl.metadataURI;
        }),
        switchMap((profileUrl) =>
          this.ipfsService.retrieveJSON<ProfileData>(profileUrl[0])
        )
      );

    this.profileData$.subscribe((data) => {
      this.profile = new Profile(
        `${data.firstName} ${data.surname}`,
        this.id,
        this.metamaskService.userAddress
      );
    });
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
