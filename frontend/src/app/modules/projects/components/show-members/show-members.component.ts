import { Observable } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Profile } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

import { ShowMembersInput, ShowMembersOutput } from '../../interfaces';
import { ProjectComponent } from '../project/project.component';

@Component({
  selector: 'app-show-members',
  templateUrl: './show-members.component.html',
  styleUrls: ['./show-members.component.css'],
})
export class ShowMembersComponent implements OnInit{
  organizationAddress: string;
  projectId: number;
  members$!: Observable<Profile[]>;
  isAddMember!: boolean;
  isManager!: boolean;
  changed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShowMembersInput,
    public dialogRef: MatDialogRef<ProjectComponent>,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService
  ) {
    this.organizationAddress = data.address;
    this.projectId = data.projectId;
    this.isAddMember = data.isAddMember;
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
    if (this.isAddMember) this.members$ = this.organizationService.getOrganizationMembersNotInProject(this.projectId);
    else this.members$ = this.organizationService.getProjectMembers(this.projectId);
  }

  public remove(profileId: string) {
    this.loadingService.show();
    return this.organizationService.removeProjectMember(this.projectId, Number(profileId)).subscribe({
      next: () => this.handleObservable('member removed'),
      error: err => this.handleObservable('failed to remove member', err),
    });
  }

  public add(profileId: string) {
    this.loadingService.show();
    return this.organizationService.addProjectMember(this.projectId, Number(profileId)).subscribe({
      next: () => this.handleObservable('member added'),
      error: err => this.handleObservable('failed to add member', err),
    });
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
