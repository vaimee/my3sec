import { Observable, filter, forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Status } from '@shared/enums';
import { Profile } from '@shared/interfaces';
import { Project } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { NavbarService } from '@shared/services/navbar.service';
import { OrganizationService } from '@shared/services/organization.service';

import { ShowMembersInput, ShowMembersOutput } from '@projects/interfaces';

import { ShowMembersComponent } from '../show-members/show-members.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit {
  project$!: Observable<Project>;
  isManager$!: Observable<boolean>;
  organizationAddress: string;
  projectId: number;

  constructor(
    private organizationService: OrganizationService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private navBarService: NavbarService
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
    this.projectId = Number(this.route.snapshot.paramMap.get('id') as string);
  }

  ngOnInit(): void {
    this.setUp();
  }

  public setUp() {
    this.project$ = this.organizationService.getProject(this.projectId, this.organizationAddress);
    this.pageNotFoundCheck(this.project$);
    this.isManager$ = this.organizationService.isCurrentUserManager(this.organizationAddress);

    forkJoin([this.project$, this.isManager$])
      .pipe(filter(([project, isManager]) => project.status === Status.IN_PROGRESS && isManager))
      .subscribe(() => {
        this.navBarService.setMenuItems([
          {
            label: 'New Task',
            icon: 'task',
          },
        ]);
        this.navBarService.getMenuClickedEvent().subscribe(item => {
          if (item.label === 'New Task') {
            this.goToCreateTask();
          }
        });
      });

    this.loadingService.waitForObservables([this.project$, this.isManager$]);
  }

  public goToCreateTask() {
    this.router.navigate(['tasks', 'new'], { relativeTo: this.route });
  }

  public updateProject(status: Status) {
    this.loadingService.show();
    this.organizationService.updateProject(this.projectId, status, this.organizationAddress).subscribe({
      next: () => this.handleObservable('project updated'),
      error: err => this.handleObservable('failed to update project', err),
    });
  }

  public get Status() {
    return Status;
  }

  public showAddMember(isManager: boolean, status: Status) {
    if (!isManager) return false;
    return status === Status.IN_PROGRESS || status === Status.NOT_STARTED;
  }

  public openMemberDialog(isManager: boolean, isAddMembers: boolean, membersCount?: Profile[]): void {
    if (!isAddMembers && membersCount?.length === 0) return;

    const showMembersData: ShowMembersInput = {
      address: this.organizationAddress,
      isManager: isManager,
      projectId: this.projectId,
      isAddMember: isAddMembers,
    };

    const dialogRef = this.dialog.open(ShowMembersComponent, {
      width: '700px',
      data: showMembersData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((showMembersOutput: ShowMembersOutput) => {
      if (showMembersOutput.profileId) return this.router.navigate(['/profiles', showMembersOutput.profileId]);
      if (showMembersOutput.changed) this.setUp();
      return;
    });
  }

  private pageNotFoundCheck<T>(observable$: Observable<T>) {
    observable$.subscribe({
      error: () => {
        this.router.navigate(['page-not-found']);
      },
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
