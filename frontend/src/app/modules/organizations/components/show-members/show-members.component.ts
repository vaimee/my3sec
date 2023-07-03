import { Observable } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Profile } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

import { ShowMembersInput } from '@organizations/interfaces';
import { MemberType } from '@organizations/types';

import { OrganizationComponent } from '../organization/organization.component';
import { ShowMembersOutput } from './../../interfaces/show-members.interface';

@Component({
  selector: 'app-show-members',
  templateUrl: './show-members.component.html',
  styleUrls: ['./show-members.component.css'],
})
export class ShowMembersComponent implements OnInit {
  organizationAddress: string;
  members$!: Observable<Profile[]>;
  memberType!: MemberType;
  isManager!: boolean;
  title!: string;
  changed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShowMembersInput,
    public dialogRef: MatDialogRef<OrganizationComponent>,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService
  ) {
    this.organizationAddress = data.address;
    this.memberType = data.memberType;
    this.isManager = data.isManager;
  }
  ngOnInit(): void {
    this.dialogSetUp();
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  private dialogSetUp() {
    this.organizationService.setTarget(this.organizationAddress);
    switch (this.memberType) {
      case 'member':
        this.members$ = this.organizationService.getMembers();
        this.title = 'Member';
        return;
      case 'manager':
        this.members$ = this.organizationService.getManagers();
        this.title = 'Manager';
        return;
      case 'pendingMember':
        this.members$ = this.organizationService.getPendingMembers();
        this.title = 'Pending Member';
        return;
      default:
        return;
    }
  }

  public promoteToManager(memberAddress: string) {
    this.loadingService.show();
    if (this.memberType === 'member')
      return this.organizationService.promoteToManager(memberAddress).subscribe({
        next: () => this.handleObservable('member promoted'),
        error: err => this.handleObservable('failed to promote member', err),
      });
    this.loadingService.hide();
    throw Error('Is only possible to promote members');
  }

  public approvePendingMember(profileId: string) {
    this.loadingService.show();
    if (this.memberType === 'pendingMember')
      return this.organizationService.approvePendingMember(Number(profileId)).subscribe({
        next: () => this.handleObservable('member approved'),
        error: err => this.handleObservable('failed to approve member', err),
      });
    this.loadingService.hide();
    throw Error('Is only possible to approve pending members');
  }

  public remove(profileId: string) {
    this.loadingService.show();
    if (this.memberType === 'pendingMember')
      return this.organizationService.rejectPendingMember(Number(profileId)).subscribe({
        next: () => this.handleObservable('pending member removed'),
        error: err => this.handleObservable('failed to remove pending member', err),
      });
    this.loadingService.hide();
    throw Error('removing a manager is not possible ');
  }

  public close() {
    const output: ShowMembersOutput = { changed: this.changed };
    this.dialogRef.close(output);
  }

  public goTo(profileId: string) {
    const output: ShowMembersOutput = { profileId: profileId, changed: this.changed };
    this.dialogRef.close(output);
  }

  private handleObservable(message: string, err?: Error) {
    if (err) console.error(err);
    this.dialogSetUp();
    this.loadingService.hide();
    this.openSnack(message);
    this.changed = true;
  }

  private openSnack(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }
}
