import { Observable } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Organization } from '@shared/interfaces';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css'],
})
export class OrganizationListComponent implements OnInit {
  @Input() organizationsInput$!: Observable<Organization[]>;
  organizations!: Observable<Organization[]>;

  constructor(private router: Router, private organizationService: OrganizationService) {}
  ngOnInit(): void {
    this.organizations =
      this.organizationsInput$ !== undefined ? this.organizationsInput$ : this.organizationService.getOrganizations();
  }

  getOrganizationMembers(organization: Organization): number {
    return organization.members.length + organization.managers.length;
  }

  goTo(address: string): void {
    this.router.navigate([`/organizations/${address}`]);
  }
}
