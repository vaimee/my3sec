import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Organization, ProfileMetadata, Project } from '@shared/interfaces';
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
  managers$!: Observable<ProfileMetadata[]>;
  members$!: Observable<ProfileMetadata[]>;
  description = 'VAIMEE provides B2B solutions for the development of interoperable and data portability services thanks to open-source solutions based on Semantic Web technologies and Linked Data standards.'
  constructor(private organizationService: OrganizationService, private route: ActivatedRoute) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }
  ngOnInit(): void {
    this.organization$ = this.organizationService.getOrganizationByAddress(this.organizationAddress);


    
    this.projects$ = this.organizationService.getProjects();
    this.managers$ = of([
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: '../../../assets/images/ale.jpeg',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: '../../../assets/images/cris.jpg',
        regulationCheckbox: true,
      },
    ]);
    this.members$ = of([
      {
        id: '4',
        firstName: 'Lorenzo',
        surname: 'Gigli',
        organization: 'ABC Company',
        role: 'Developer',
        profileImage: '../../../assets/images/gigli.jpg',
        walletAddress: '0x1234567890abcdef',
        regulationCheckbox: true,
      },
      {
        id: '5',
        firstName: 'Ivan',
        surname: 'Zyrianoff',
        organization: 'ABC Company',
        role: 'Developer',
        profileImage: '../../../assets/images/ivan.jpg',
        walletAddress: '0x1234567890abcdef',
        regulationCheckbox: true,
      },
      {
        id: '5',
        firstName: 'Ivan',
        surname: 'Zyrianoff',
        organization: 'ABC Company',
        role: 'Developer',
        profileImage: '../../../assets/images/greg.jpg',
        walletAddress: '0x1234567890abcdef',
        regulationCheckbox: true,
      },
    ]);
  }
}
