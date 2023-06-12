import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { IpfsService } from 'app/shared/services/ipfs.service';
import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { MetamaskService } from 'app/authentication/services/metamask.service';
import { ProfileData } from 'app/shared/interfaces';
import { ImageConversionService } from 'app/shared/services/image-conversion.service';
import { ActivatedRoute } from '@angular/router';
import { Profile } from 'app/user-profile/interfaces/profile.interface';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<ProfileData>;
  public userWalletAddress!: string;
  public profile!: Profile;
  public id!: string;
  public energy!: number;
  public decodedImage!: Blob;
  public useDefaultProfile = true;

  constructor(
    private ipfsService: IpfsService,
    private my3secHubContractService: My3secHubContractService,
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
          this.id = profileUrl.id.toString();
          return profileUrl.metadataURI;
        }),
        switchMap((profileUrl) =>
          this.ipfsService.retrieveJSON<ProfileData>(profileUrl[0])
        )
      );

    this.profileData$.subscribe((data) => {
      this.profile = {
        ...data,
        id: parseInt(this.id),
        walletAddress: this.metamaskService.userAddress,
        endorsers: [],
        energy: 0,
        certificates: [],
        skills: [],
        projects: [],
      }});
  }

  loadProfile() {
    this.id = this.route.snapshot.paramMap.get('userId') || ''; // TODO: redirect to my profile if no id is provided
    this.profileData$ = this.my3secHubContractService
      .getProfile(parseInt(this.id))
      .pipe(
        switchMap((profileUrl) => {
          this.id = profileUrl.id.toString();
          return profileUrl.metadataURI;
        }),
        switchMap((profileUrl) =>
          this.ipfsService.retrieveJSON<ProfileData>(profileUrl[0])
        )
      );

    this.profileData$.subscribe((data) => {
      this.profile = {
        ...data,
        id: parseInt(this.id),
        walletAddress: this.metamaskService.userAddress,
        endorsers: [],
        energy: 0,
        certificates: [],
        skills: [],
        projects: [],
      };
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
