import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';

import { ProfileData } from '@shared/interfaces';

import { Organization } from '../../interfaces';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements OnInit {
  organization$!: Observable<Organization>;
  managers$!: Observable<ProfileData[]>;
  members$!: Observable<ProfileData[]>;
  ngOnInit(): void {
    this.organization$ = of({
      address: '0x7DA72c46E862BC5D08f74d7Db2fb85466ACE2997',
      name: 'VAIMEE',
      description:
        'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'https://picsum.photos/200/',
      projectsCount: 5,
      membersCount: 10,
    });

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
