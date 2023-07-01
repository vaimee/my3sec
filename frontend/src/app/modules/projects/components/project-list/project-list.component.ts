import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Project } from '@shared/interfaces/project.interface';
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

  constructor(private organizationService: OrganizationService, private route: ActivatedRoute, private router: Router) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }
  ngOnInit(): void {
    if (this.projects$ === undefined) {
      this.organizationService.setTarget(this.organizationAddress);
      this.projects$ = this.organizationService.getProjects();
    }
  }

  public goTo(projectId: number) {
    this.router.navigate(['organizations', this.organizationAddress, 'projects', projectId]);
  }
}
