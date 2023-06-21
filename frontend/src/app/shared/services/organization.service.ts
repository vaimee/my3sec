import { ethers } from 'ethers';
import { Observable, concatMap, forkJoin, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Profile } from '@shared/interfaces';
import { Organization, OrganizationMetadata } from '@shared/interfaces/organization.interface';

import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

import { Project, ProjectMetadata, Task, TaskMetadata } from '../interfaces/project.interface';
import { IpfsService } from './ipfs.service';
import { My3secHubContractService } from './my3sec-hub-contract.service';
import { OrganizationContractService } from './organization-contract.service';
import { ProfileService } from './profile.service';
import { SkillService } from './skill.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(
    private contractService: OrganizationContractService,
    private ipfsService: IpfsService,
    private my3secHub: My3secHubContractService,
    private profileService: ProfileService,
    private skillService: SkillService
  ) {}

  public getOrganizations(): Observable<Organization[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      concatMap(data => data),
      mergeMap(address => this.getOrganizationByAddress(address)),
      toArray()
    );
  }

  public getOrganizationByAddress(address: string): Observable<Organization> {
    this.contractService.setTarget(address);
    return this.getOrganization().pipe(
      switchMap((organization: OrganizationMetadata) => this.getOrganizationFromMetadata(organization, address))
    );
  }

  public getOrganization(): Observable<OrganizationMetadata> {
    return this.contractService
      .getMetadataURI()
      .pipe(switchMap((uri: string) => this.ipfsService.retrieveJSON<OrganizationMetadata>(uri)));
  }

  public getProjects(): Observable<Project[]> {
    return this.contractService.getProjects().pipe(
      concatMap(projects => projects),
      mergeMap(project => {
        console.log(project.id.toNumber());
        return this.ipfsService.retrieveJSON<ProjectMetadata>(project.metadataURI).pipe(
          map(data => {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            return {
              ...data,
              id: project.id.toNumber(),
              status: project.status,
              organization: this.contractService.address,
              tasks: this.getTasks(project.id.toNumber()),
              hours: 0, // TODO: calculate hours
              startDate,
              endDate,
              currentMonth: this.calculateCurrentMonth(startDate),
              durationInMonths: this.calculateDurationInMonths(startDate, endDate),
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
            const skills = task.skills.map(skill => this.skillService.getSkill(skill.toNumber()));
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
              skills: forkJoin(skills),
              metadataURI: task.metadataURI,
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
  public updateTask(taskId: number, task: DataTypes.UpdateTaskStruct) {
    const hexValue = ethers.utils.hexValue(taskId);
    return from(this.contractService.updateTask(ethers.BigNumber.from(hexValue), task));
  }

  private calculateDurationInMonths(start: Date, end: Date): number {
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    return (endYear - startYear) * 12 + (endMonth - startMonth + 1);
  }

  private calculateCurrentMonth(start: Date): number {
    const current = new Date();
    return current.getMonth() - start.getMonth() + 12 * (current.getFullYear() - start.getFullYear());
  }

  private getOrganizationFromMetadata(organization: OrganizationMetadata, address: string): Observable<Organization> {
    const projectCount$ = this.contractService.getProjectCount();
    const memberCount$ = this.contractService.getMemberCount();
    return forkJoin({
      organization: of(organization),
      projectCount: projectCount$,
      memberCount: memberCount$,
    }).pipe(
      map(({ organization, projectCount, memberCount }) => ({
        ...organization,
        address,
        projectCount,
        memberCount,
      }))
    );
  }
}
