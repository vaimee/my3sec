import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OrganizationService } from '@shared/services/organization.service';

import { Organization } from '../../interfaces/organization.interface';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css'],
})
export class OrganizationListComponent implements OnInit {
  organizations!: Observable<Organization[]>;

  constructor(private router: Router, private organizationService: OrganizationService) {}
  ngOnInit(): void {
    this.organizationService.getOrganizations().subscribe(data => console.log(data));
    this.organizations = of([
      {
        id: '1',
        address: '0x7DA72c46E862BC5D08f74d7Db2fb85466ACE2997',
        name: 'VAIMEE',
        description:
          'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        icon: 'https://picsum.photos/200/',
        projectCount: 5,
        memberCount: 10,
      },
      {
        id: '2',
        address: '0x09BEd5176c33a876fe1FAfc12ea9979B12274bB2',
        name: 'Apple',
        description:
          'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        icon: 'https://picsum.photos/200',
        projectCount: 200,
        memberCount: 10000,
      },
      {
        id: '3',
        address: '0x09BEd5176c33a876fe1FAfc12ea9979B12274bB2',
        name: 'Greenpeace',
        description:
          'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        icon: 'https://picsum.photos/200',
        projectCount: 20,
        memberCount: 1000,
      },
    ]);
  }

  goTo(address: string): void {
    this.router.navigate([`/organizations/${address}`]);
  }
}
