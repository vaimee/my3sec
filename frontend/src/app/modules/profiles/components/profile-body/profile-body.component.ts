import { Observable, catchError, concat, distinct, map, of, switchMap } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { MetamaskService } from '@auth/services/metamask.service';

import { Organization, Profile as ProfileInterface, ProfileMetadata, Project } from '@shared/interfaces';
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

import { UpdateProfileComponent } from '../update-profile/update-profile.component';

@Component({
  selector: 'app-profile-body',
  templateUrl: './profile-body.component.html',
  styleUrls: ['./profile-body.component.css'],
})
export class ProfileBodyComponent implements OnInit {
  public profileData$!: Observable<Profile>;
  public projects$!: Observable<Project[]>;
  public organizations$: Observable<Organization[]> = of([]);

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
      this.profileData$ = this.loadDefaultProfile().pipe(
        map((profile: DataTypes.ProfileViewStructOutput) => {
          this.loggedProfileId = profile.id.toNumber();
          if (this.useDefaultProfile) return { id: profile.id.toNumber(), profile: profile };
          const id = parseInt(this.route.snapshot.paramMap.get('userId') as string, 0);
          if (id === this.loggedProfileId) this.router.navigate(['/profiles', 'me']);

          return { id: id, profile: profile };
        }),
        switchMap(data => {
          if (!this.useDefaultProfile)
            return this.my3secHubContractService.getProfile(data.id).pipe(
              catchError(err => {
                this.router.navigate(['/page-not-found']);
                throw Error('error when getting the profile', err);
              })
            );
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
        })
      );
    });
    this.projects$ = this.profileData$.pipe(
      switchMap(profile => this.organizationService.getProjectsOfProfile(parseInt(profile.id)))
    );

    this.organizations$ = this.profileData$.pipe(
      switchMap(profile =>
        concat(
          this.organizationService.getOrganizationsOfProfile(parseInt(profile.id)),
          this.organizationService.getOrganizationsManagerOfProfile(parseInt(profile.id))
        )
      ),
      distinct()
    );

    this.loadingService.waitForObservables([this.profileData$, this.organizations$, this.projects$]);
  }

  loadDefaultProfile() {
    return this.my3secHubContractService.getDefaultProfile(this.metamaskService.userAddress);
  }

  openSliderDialog(profile: Profile): void {
    const endorseDialogInterface: EndorseDialogInterface = {
      firstName: profile.firstName,
      surname: profile.surname,
      endorserId: this.loggedProfileId,
      endorsingId: +profile.id,
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

  public openUpdateProfile(profile: Profile): void {
    const openUpdateProfileInterface: ProfileInterface = {
      ...profile,
    };

    const dialogRef = this.dialog.open(UpdateProfileComponent, {
      width: '640px',
      data: openUpdateProfileInterface,
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
