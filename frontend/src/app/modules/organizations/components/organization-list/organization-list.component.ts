import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Organization } from '@shared/interfaces';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css'],
})
export class OrganizationListComponent implements OnInit {
  organizations!: Observable<Organization[]>;

  constructor(private router: Router, private organizationService: OrganizationService) {}
  ngOnInit(): void {
    this.organizations = this.organizationService.getOrganizations();
  }

  goTo(address: string): void {
    this.router.navigate([`/organizations/${address}`]);
  }
}
