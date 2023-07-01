import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProfileMetadata } from '@shared/interfaces';
import { Project } from '@shared/interfaces/project.interface';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit{
  project$!: Observable<Project>;
  members$!: Observable<ProfileMetadata[]>;
  organizationAddress: string;
  projectId: number;

  constructor(private organizationService: OrganizationService, private route: ActivatedRoute, private router: Router) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
    this.projectId = Number(this.route.snapshot.paramMap.get('id') as string);
  }
  ngOnInit(): void {
    this.organizationService.setTarget(this.organizationAddress);
    this.project$ = this.organizationService.getProject(this.projectId);
  }
}
