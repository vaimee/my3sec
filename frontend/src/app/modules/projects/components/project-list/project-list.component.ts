import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Project } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  @Input() projects$!: Observable<Project[]>;
  @Input() showOrganization = false;
  organizationAddress: string;

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }
  ngOnInit(): void {
    if (this.projects$ === undefined) {
      this.projects$ = this.organizationService.getProjects(this.organizationAddress);
    }
    this.loadingService.waitForObservables([this.projects$]);
  }

  public goTo(project: Project) {
    this.router.navigate(['organizations', project.organization, 'projects', project.id]);
  }
}
