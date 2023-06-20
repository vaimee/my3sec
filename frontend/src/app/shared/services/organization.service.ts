import { Observable, concatAll, from, map, of, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Organization } from '@shared/interfaces/organization.interface';

import { Status } from '../enums';
import { Project, ProjectMetadata, Task, TaskMetadata } from '../interfaces/project.interface';
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

  private calculateDurationInMonths(start: Date, end: Date): number {
    return start.getMonth() - end.getMonth() + 12 * (start.getFullYear() - end.getFullYear());
  }

  private calculateCurrentMonth(start: Date): number {
    const current = new Date();
    return current.getMonth() - start.getMonth() + 12 * (current.getFullYear() - start.getFullYear());
  }
}
