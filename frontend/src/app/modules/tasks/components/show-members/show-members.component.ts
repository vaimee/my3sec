import { Observable } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Profile } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

import { ShowMembersInput, ShowMembersOutput } from '../../interfaces';
import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-show-members',
  templateUrl: './show-members.component.html',
  styleUrls: ['./show-members.component.css'],
})
export class ShowMembersComponent implements OnInit {
  organizationAddress: string;
  projectId: number;
  taskId: number;
  members$!: Observable<Profile[]>;
  changed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShowMembersInput,
    public dialogRef: MatDialogRef<TaskComponent>,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService
  ) {
    this.organizationAddress = data.address;
    this.projectId = data.projectId;
    this.taskId = data.taskId;
  }

  ngOnInit(): void {
    this.dialogSetUp();
    this.dialogRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  private dialogSetUp() {
    this.members$ = this.organizationService.getProjectMembersNotInTask(
      this.projectId,
      this.taskId,
      this.organizationAddress
    );
  }

  public add(profileId: string) {
    this.loadingService.show();
    return this.organizationService.addTaskMember(this.taskId, Number(profileId), this.organizationAddress).subscribe({
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
