import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Organization, ProfileMetadata } from '@shared/interfaces';
import { OrganizationService } from '@shared/services/organization.service';


@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements OnInit {
  organizationAddress: string;
  organization$!: Observable<Organization>;
  managers$!: Observable<ProfileMetadata[]>;
  members$!: Observable<ProfileMetadata[]>;

  constructor(private organizationService: OrganizationService, private route: ActivatedRoute) {
    this.organizationAddress = this.route.snapshot.paramMap.get('address') as string;
  }
  ngOnInit(): void {
    this.organization$ = this.organizationService.getOrganizationByAddress(this.organizationAddress)
    

    this.managers$ = of([
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
    ]);
    this.members$ = of([
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
    ]);
  }
}
