import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Status } from '@shared/enums';
import { ProfileMetadata } from '@shared/interfaces';
import { Project } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit {
  project$!: Observable<Project>;
  members$!: Observable<ProfileMetadata[]>;
  isManager$!: Observable<boolean>;
  organizationAddress: string;
  projectId: number;

  constructor(
    private organizationService: OrganizationService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
    this.projectId = Number(this.route.snapshot.paramMap.get('id') as string);
  }
  ngOnInit(): void {
    this.organizationService.setTarget(this.organizationAddress);
    this.project$ = this.organizationService.getProject(this.projectId);
    this.isManager$ = this.organizationService.isCurrentUserManager();
  }

  public setUp() {
    this.organizationService.setTarget(this.organizationAddress);
    this.project$ = this.organizationService.getProject(this.projectId);
    this.isManager$ = this.organizationService.isCurrentUserManager();
  }

  public goToCreateTask() {
    this.router.navigate(['tasks', 'new'], { relativeTo: this.route });
  }

  public updateProject(status: Status) {
    this.loadingService.show();
    this.organizationService.updateProject(this.projectId, status).subscribe({
      next: () => this.handleObservable('project updated'),
      error: err => this.handleObservable('failed to update project', err),
    });
  }

  public get Status() {
    return Status;
  }

  public showStart(projectStatus: Status) {
    return projectStatus === Status.NOT_STARTED;
  }
  public showComplete(projectStatus: Status) {
    return projectStatus === Status.IN_PROGRESS;
  }
  public showCancel(projectStatus: Status) {
    return projectStatus === Status.IN_PROGRESS || projectStatus === Status.NOT_STARTED;
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
