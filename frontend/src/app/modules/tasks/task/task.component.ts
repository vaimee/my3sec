import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Status } from '@shared/enums';
import { Task } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { OrganizationService } from '@shared/services/organization.service';

import { Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
  task$!: Observable<Task>;
  showReward = true;
  showCloseTask = false;
  organizationAddress: string;
  projectId: number;
  taskId: number;

  constructor(
    private router: Router,
    private my3secHub: My3secHubContractService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
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
    this.task$ = this.organizationService.getTask(this.projectId, this.taskId);
  }

  public goTo(id: string) {
    this.router.navigate(['/profiles', id]);
  }

  public getReward(id: number) {
    //TODO: get org address
    this.loadingService.show();
    this.my3secHub.withdrawExperienceBlocking('', `${id}`).subscribe(() => {
      this.loadingService.hide();
    });
  }
  private profileTimes: { [memberId: string]: Observable<number> } = {};

  public getProfileTime(memberId: string) {
    if (this.profileTimes[memberId]) {
      return this.profileTimes[memberId];
    } else {
      return this.organizationService.getTaskLoggedTimeOfProfile(this.taskId, +memberId);
    }
  }

  public updateTask(closeTask: boolean, task: Task, skills: Skill[]) {
    const taskStruct: DataTypes.UpdateTaskStruct = {
      metadataURI: task.metadataURI,
      status: closeTask ? Status.COMPLETED : Status.CANCELED,
      skills: skills.map(skill => skill.id),
    };
    const numericId = Number(task.id);
    this.loadingService.show();
    this.organizationService.updateTask(numericId, taskStruct).subscribe(() => {
      this.loadingService.hide();
    });
  }
}
