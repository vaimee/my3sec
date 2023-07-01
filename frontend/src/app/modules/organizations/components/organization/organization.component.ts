import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Organization, Profile, Project } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';
import { ProfileService } from '@shared/services/profile.service';

import { MemberType } from '@organizations/types';

import { ShowMembersComponent } from '../show-members/show-members.component';
import { ShowMembersInput, ShowMembersOutput } from './../../interfaces/show-members.interface';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements OnInit {
  organizationAddress: string;
  organization$!: Observable<Organization>;
  projects$!: Observable<Project[]>;
  isMember$!: Observable<boolean>;
  isPendingMember$!: Observable<boolean>;
  isManager$!: Observable<boolean>;
  userId$!: Observable<number>;

  constructor(
    private organizationService: OrganizationService,
    private profileService: ProfileService,
    private loadingService: LoadingService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }

  ngOnInit(): void {
    this.organization$ = this.organizationService.getOrganizationByAddress(this.organizationAddress);
    this.projects$ = this.organizationService.getProjects();
    this.isMember$ = this.organizationService.isCurrentUserMember();
    this.isPendingMember$ = this.organizationService.isCurrentUserPendingMember();
    this.isManager$ = this.organizationService.isCurrentUserManager();
    this.userId$ = this.profileService.getUserId();
  }

  public joinOrganization() {
    this.loadingService.show();
    this.organizationService.join(this.organizationAddress).subscribe({
      next: () => {
        this.loadingService.hide();
        this.snackBar.open('Added to the pending members list', 'Dismiss', {
          duration: 3000,
        });
      },
      error: err => {
        this.loadingService.hide();
        console.error(err);
        this.snackBar.open('Failed to add to the organization', 'Dismiss', {
          duration: 3000,
        });
      },
    });
  }

  //What is the right way to deal with observables as input?
  public showAddMemberIcon(
    isMember: boolean | null,
    isManager: boolean | null,
    pendingMembers: Profile[],
    userId: number | null
  ): boolean {
    if (isManager || isMember) return false;
    for (const member of pendingMembers) if (Number(member.id) === userId) return false;

    return true;
  }

  public openMemberDialog(memberType: MemberType, members: Profile[], isManager: boolean | null): void {
    if (members.length === 0) return;
    if (isManager === null) isManager = false;

    const showMembersData: ShowMembersInput = {
      address: this.organizationAddress,
      memberType: memberType,
      isManager: isManager,
    };

    const dialogRef = this.dialog.open(ShowMembersComponent, {
      width: '700px',
      data: showMembersData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((showMembersOutput: ShowMembersOutput) => {
      if (showMembersOutput.profileId) return this.router.navigate(['/profiles', showMembersOutput.profileId]);
      if (showMembersOutput.changed)
        this.organization$ = this.organizationService.getOrganizationByAddress(this.organizationAddress);
      return;
    });
  }

  public goToCreateProject() {
    this.router.navigate(['projects', 'new'], { relativeTo: this.route });
  }
}
