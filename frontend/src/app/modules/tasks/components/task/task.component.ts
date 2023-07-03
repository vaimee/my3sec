import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Status } from '@shared/enums';
import { Task } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { OrganizationService } from '@shared/services/organization.service';

import { Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

import { ShowMembersInput, ShowMembersOutput } from '../../interfaces';
import { LogHoursDialogComponent } from '../log-hours-dialog/log-hours-dialog.component';
import { ShowMembersComponent } from '../show-members/show-members.component';
import { LogHoursInput } from './../../interfaces/log-hours.interface';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
  task$!: Observable<Task>;
  profilesLoggedTime$!: Observable<number[]>;
  isManager$!: Observable<boolean>;
  isMember$!: Observable<boolean>;

  showReward = true;
  showCloseTask = false;
  organizationAddress: string;
  projectId: number;
  taskId: number;

  skills$!: Observable<Skill[]>;

  constructor(
    private router: Router,
    private my3secHub: My3secHubContractService,
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
    this.projectId = Number(this.route.snapshot.paramMap.get('id') as string);
    this.taskId = Number(this.route.snapshot.paramMap.get('taskId') as string);
  }

  ngOnInit(): void {
    this.setUp();
  }

  public setUp() {
    this.organizationService.setTarget(this.organizationAddress);
    this.isManager$ = this.organizationService.isCurrentUserManager();
    this.isMember$ = this.organizationService.isCurrentUserTaskMember(this.taskId);
    this.skills$ = of([]);
    this.task$ = this.organizationService.getTask(this.projectId, this.taskId);
    this.profilesLoggedTime$ = this.organizationService.getTaskLoggedTimeOfProfiles(this.taskId, this.task$);
  }

  public goTo(id: string) {
    this.router.navigate(['/profiles', id]);
  }

  //TODO:how can i check if an user withdraw experience already?
  public getReward() {
    this.loadingService.show();
    this.my3secHub.withdrawExperience(this.organizationAddress, this.taskId).subscribe({
      next: () => this.handleObservable('Experience received!'),
      error: err => this.handleObservable('failed to receive experience', err),
    });
  }

  public updateTask(status: Status, task: Task, skills: Skill[]) {
    const taskStruct: DataTypes.UpdateTaskStruct = {
      metadataURI: task.metadataURI,
      status: status,
      skills: skills.map(skill => skill.id),
    };
    const numericId = Number(task.id);
    this.loadingService.show();
    this.organizationService.updateTask(numericId, taskStruct).subscribe({
      next: () => this.handleObservable('Task updated!'),
      error: err => this.handleObservable('failed to update task', err),
    });
  }

  public getDaysToDeadline(endDate: Date): number {
    const startDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffInDays = Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));
    return diffInDays;
  }

  public get Status() {
    return Status;
  }

  public openLogHoursDialog(): void {
    const logHoursInput: LogHoursInput = { id: this.taskId, address: this.organizationAddress };

    const dialogRef = this.dialog.open(LogHoursDialogComponent, {
      width: '700px',
      data: logHoursInput,
    });

    dialogRef.afterClosed().subscribe(changed => {
      if (!changed) return;
      this.profilesLoggedTime$ = this.organizationService.getTaskLoggedTimeOfProfiles(this.taskId, this.task$);
    });
  }

  public openAddMemberDialog(): void {
    const showMembersData: ShowMembersInput = {
      address: this.organizationAddress,
      projectId: this.projectId,
      taskId: this.taskId,
    };

    const dialogRef = this.dialog.open(ShowMembersComponent, {
      width: '700px',
      data: showMembersData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((showMembersOutput: ShowMembersOutput) => {
      if (showMembersOutput.profileId) return this.router.navigate(['/profiles', showMembersOutput.profileId]);
      if (!showMembersOutput.changed) return;
      this.task$ = this.organizationService.getTask(this.projectId, this.taskId);
      this.profilesLoggedTime$ = this.organizationService.getTaskLoggedTimeOfProfiles(this.taskId, this.task$);
      return;
    });
  }

  public remove(profileId: string) {
    this.loadingService.show();
    return this.organizationService.removeTaskMember(this.taskId, Number(profileId)).subscribe({
      next: () => this.handleObservable('member removed'),
      error: err => this.handleObservable('failed to remove member', err),
    });
  }

  private handleObservable(message: string, err?: Error) {
    if (err) console.error(err);
    this.setUp();
    this.loadingService.hide();
    this.openSnack(message);
  }

  private openSnack(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }
}
