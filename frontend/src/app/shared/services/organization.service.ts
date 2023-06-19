import { Observable, from, map, of, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { Organization } from '@shared/interfaces/organization.interface';

import { Project } from '@projects/interfaces/project.interface';

import { IpfsService } from './ipfs.service';
import { OrganizationContractService } from './organization-contract.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private contractService: OrganizationContractService, private ipfsService: IpfsService) {}

  public getOrganization(): Observable<Organization> {
    return this.contractService.getMetadataURI().pipe(
      switchMap((uri: string) => this.ipfsService.retrieveJSON<Omit<Organization, 'id'>>(uri)),
      map(data => ({ ...data, id: this.contractService.address }))
    );
  }

  public getProjects(): Observable<Project[]> {
    return this.contractService.getProjects().pipe(
      switchMap(projects => from(projects)),
      switchMap(project => {
        return this.ipfsService
          .retrieveJSON<Omit<Project, 'status' | 'organization' | 'tasks' | 'currentMonth' | 'durationInMonths'>>(
            project.metadataURI
          )
          .pipe(
            map(data => ({
              ...data,
              status: project.status.toString(),
              organization: this.contractService.address,
              tasks: [], // TODO: retrieve tasks
              currentMonth: 0, // TODO: retrieve current month
            }))
          );
      })
    );
  }
  public setTarget(targetAddress: string): void {
    this.contractService.setTarget(targetAddress);
  }
}
