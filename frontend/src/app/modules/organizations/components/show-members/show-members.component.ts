import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Profile } from '@shared/interfaces';
import { OrganizationService } from '@shared/services/organization.service';

import { MemberType } from '@organizations/types';

import { OrganizationComponent } from '../organization/organization.component';

@Component({
  selector: 'app-show-members',
  templateUrl: './show-members.component.html',
  styleUrls: ['./show-members.component.css'],
})
export class ShowMembersComponent {
  members!: Profile[];
  memberType!: MemberType;
  isManager!: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { members: Profile[]; memberType: MemberType; isManager: boolean },
    public dialogRef: MatDialogRef<OrganizationComponent>,
    private organizationService: OrganizationService
  ) {
    this.members = data.members;
    this.memberType = data.memberType;
    this.isManager = data.isManager;
  }

  public getDialogTitle() {
    switch (this.memberType) {
      case 'member':
        return 'Member';
      case 'manager':
        return 'Manager';
      case 'pendingMember':
        return 'Pending Member';
      default:
        return 'Member';
    }
  }

  public promoteToManager(memberAddress: string) {
    if (this.memberType === 'member') return this.organizationService.promoteToManager(memberAddress);
    throw Error('Is only possible to promote members');
  }

  public approvePendingMember(profileId: string) {
    if (this.memberType === 'pendingMember') return this.organizationService.approvePendingMember(Number(profileId));
    throw Error('Is only possible to approve pending members');
  }

  public remove(profileId: string) {
    if (this.memberType === 'member') return this.organizationService.removeMember(Number(profileId));
    if (this.memberType === 'pendingMember') return this.organizationService.rejectPendingMember(Number(profileId));
    throw Error('removing a manager is not possible ');
  }

  goTo(profileId: string) {
    this.dialogRef.close(Number(profileId));
  }
}
