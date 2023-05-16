import { My3secHubContractService } from 'app/shared/services/my3sec-hub-contract.service';
import { IpfsService } from 'app/shared/services/ipfs.service';
import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { MetamaskService } from 'app/authentication/services/metamask.service';
import { ProfileData } from 'app/shared/interfaces';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<ProfileData>;
  public userWalletAddress!: string;
  constructor(
    private ipfsService: IpfsService,
    private my3secHubContractService: My3secHubContractService,
    private metamaskService: MetamaskService
  ) {}

  ngOnInit(): void {
    this.profileData$ = this.my3secHubContractService
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(
        switchMap((profileUrl) => this.ipfsService.retrieveJSON<ProfileData>(profileUrl[0]) )
      ); 
    this.userWalletAddress = this.metamaskService.userAddress;
  }
}
