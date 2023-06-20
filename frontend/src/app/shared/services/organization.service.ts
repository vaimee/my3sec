import { Observable, concatMap, forkJoin, from, map, mergeMap, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Profile } from '@shared/interfaces';
import { Organization } from '@shared/interfaces/organization.interface';

import { Organization as FullOrganization } from '@organizations/interfaces';

import { Project, ProjectMetadata, Task, TaskMetadata } from '../interfaces/project.interface';
import { IpfsService } from './ipfs.service';
import { My3secHubContractService } from './my3sec-hub-contract.service';
import { OrganizationContractService } from './organization-contract.service';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(
    private contractService: OrganizationContractService,
    private ipfsService: IpfsService,
    private my3secHub: My3secHubContractService,
    private profileService: ProfileService
  ) {}

  public getOrganizations(): Observable<Organization[]> {
    return this.my3secHub.getOrganizationsIds().pipe(
      concatMap(data => data),
      mergeMap(id => this.getOrganizationById(id)),
      toArray()
    );
  }

  public getFullOrganization(): Observable<FullOrganization> {
    return this.getOrganization().pipe(
      switchMap((organization: Organization) => {
        return forkJoin({
          ...organization,
          projectCount: this.contractService.getProjectCount(),
          memberCount: this.contractService.getMemberCount(),
          address: this.contractService.address,
        });
      })
    );
  }
  public getOrganizationById(id: string): Observable<Organization> {
    return this.my3secHub.getOrganizationMetadataUri(id).pipe(
      switchMap((uri: string) => this.ipfsService.retrieveJSON<Omit<Organization, 'id'>>(uri)),
      map(data => {
        return { ...data, id: id };
      })
    );
  }
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
        return this.ipfsService.retrieveJSON<ProjectMetadata>(project.metadataURI).pipe(
          map(data => {
            const start = new Date(data.start);
            const end = new Date(data.end);
            return {
              ...data,
              id: project.id.toNumber(),
              status: project.status,
              organization: this.contractService.address,
              tasks: this.getTasks(project.id.toNumber()),
              hours: 0, // TODO: calculate hours
              start,
              end,
              currentMonth: this.calculateCurrentMonth(start),
              durationInMonths: this.calculateDurationInMonths(start, end),
            };
          })
        );
      }),
      toArray()
    );
  }

  public getTasks(projectId: number): Observable<Task[]> {
    return this.contractService.getTasks(projectId).pipe(
      switchMap(tasks => from(tasks)),
      switchMap(task => {
        return this.ipfsService.retrieveJSON<TaskMetadata>(task.metadataURI).pipe(
          map(data => {
            const start = new Date(data.start);
            const end = new Date(data.end);
            return {
              ...data,
              id: task.id.toNumber(),
              status: task.status,
              organization: this.contractService.address,
              hours: 0, // TODO: calculate hours
              start,
              end,
              currentMonth: this.calculateCurrentMonth(start),
              durationInMonths: this.calculateDurationInMonths(start, end),
            };
          })
        );
      }),
      toArray()
    );
  }

  public setTarget(targetAddress: string): void {
    this.contractService.setTarget(targetAddress);
  }

  public getMembers(): Observable<Profile> {
    return this.contractService.getMembers().pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id))
    );
  }

  private calculateDurationInMonths(start: Date, end: Date): number {
    return start.getMonth() - end.getMonth() + 12 * (start.getFullYear() - end.getFullYear());
  }

  private calculateCurrentMonth(start: Date): number {
    const current = new Date();
    return current.getMonth() - start.getMonth() + 12 * (current.getFullYear() - start.getFullYear());
  }
}
