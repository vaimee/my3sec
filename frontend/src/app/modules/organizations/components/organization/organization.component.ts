import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Organization, Project } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

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
  isManager$!: Observable<boolean>;

  constructor(
    private organizationService: OrganizationService,
    private loadingService: LoadingService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }
  ngOnInit(): void {
    this.organization$ = this.organizationService.getOrganizationByAddress(this.organizationAddress);
    this.projects$ = this.organizationService.getProjects();
    this.isMember$ = this.organizationService.isCurrentUserMember();
    this.isManager$ = this.organizationService.isCurrentUserManager();
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

  public goToCreateProject() {
    this.router.navigate(['projects', 'new'], { relativeTo: this.route });
  }
}
