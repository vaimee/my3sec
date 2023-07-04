import { Observable, finalize, map, of, switchMap, tap } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { MetamaskService } from '@auth/services/metamask.service';

import { ProfileMetadata, Project } from '@shared/interfaces';
import { EnergyWalletContractService } from '@shared/services/energy-wallet-contract.service';
import { IpfsService } from '@shared/services/ipfs.service';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { OrganizationService } from '@shared/services/organization.service';

import { EndorseDialogComponent } from '@profiles/components/endorse-dialog/endorse-dialog.component';
import { EndorsersListComponent } from '@profiles/components/endorsers-list/endorsers-list.component';
import { EndorseDialogInterface } from '@profiles/interfaces/endorse-dialog-data.interface';
import { Profile } from '@profiles/interfaces/profile.interface';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/My3SecHub';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<Profile>;
  public projects$!: Observable<Project[]>;
  public userWalletAddress!: string;
  public id!: number;
  public useDefaultProfile = true;
  private loggedProfileId!: number;

  constructor(
    private ipfsService: IpfsService,
    private my3secHubContractService: My3secHubContractService,
    private energyWalletContract: EnergyWalletContractService,
    private metamaskService: MetamaskService,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    /* TODO: later refactor this to its own custom route */
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.loadProfileDetail();
  }

  loadProfileDetail() {
    this.route.data.subscribe(data => {
      this.useDefaultProfile = data['useDefaultProfile'];
      this.loadingService.show();
      this.profileData$ = this.loadDefaultProfile().pipe(
        map((profile: DataTypes.ProfileViewStructOutput) => {
          this.loggedProfileId = profile.id.toNumber();
          if (this.useDefaultProfile) return { id: profile.id.toNumber(), profile: profile };
          const id = parseInt(this.route.snapshot.paramMap.get('userId') as string, 0);
          if (id === this.loggedProfileId) this.router.navigate(['/profiles', 'me']);

          return { id: id, profile: profile };
        }),
        switchMap(data => {
          if (!this.useDefaultProfile) return this.my3secHubContractService.getProfile(data.id);
          return of(data.profile);
        }),
        switchMap((profile: DataTypes.ProfileViewStructOutput) => {
          this.id = profile.id.toNumber();
          const uri = profile.metadataURI;
          return this.ipfsService.retrieveJSON<ProfileMetadata>(uri);
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
        finalize(() => {
          this.loadingService.hide();
        })
      );
    });

    this.projects$ = this.profileData$.pipe(
      switchMap(profile => this.organizationService.getProjectsOfProfile(parseInt(profile.id)))
    );
  }

  loadDefaultProfile() {
    return this.my3secHubContractService.getDefaultProfile(this.metamaskService.userAddress);
  }

  loadProfile(id: number) {
    return this.my3secHubContractService.getProfile(id);
  }

  openSliderDialog(profile: Profile, maxEnergy: number): void {
    const endorseDialogInterface: EndorseDialogInterface = {
      firstName: profile.firstName,
      surname: profile.surname,
      endorserId: this.loggedProfileId,
      endorsingId: +profile.id,
      maxEnergy: maxEnergy,
    };

    const dialogRef = this.dialog.open(EndorseDialogComponent, {
      width: '400px',
      data: endorseDialogInterface,
    });

    dialogRef.afterClosed().subscribe(changed => {
      if (!changed) return;
      this.loadProfileDetail();
    });
  }

  openEndorsersOrEndorsingDialog(isEndorsing: boolean, endorsers: number | null): void {
    if (!endorsers || endorsers <= 0) return;
    const dialogRef = this.dialog.open(EndorsersListComponent, {
      width: '400px',
      data: { id: this.id, isEndorser: isEndorsing },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.router.navigate(['/profiles', result]);
    });
  }
}
