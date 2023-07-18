import { Observable, of } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Organization } from '@shared/interfaces';
import { LoadingService } from '@shared/services/loading.service';

@Component({
  selector: 'app-organization-list-summary',
  templateUrl: './organization-list-summary.component.html',
  styleUrls: ['./organization-list-summary.component.css'],
})
export class OrganizationListSummaryComponent implements OnInit {
  @Input() organizationsInput$!: Observable<Organization[]>;
  organizations!: Observable<Organization[]>;

  constructor(private router: Router, private loadingService: LoadingService) {}
  ngOnInit(): void {
    this.organizations = this.organizationsInput$ !== undefined ? this.organizationsInput$ : of([]);
    this.loadingService.waitForObservables([this.organizations]);
  }

  getOrganizationMembers(organization: Organization): number {
    return organization.members.length + organization.managers.length;
  }

  goTo(address: string): void {
    this.router.navigate([`/organizations/${address}`]);
  }
}
