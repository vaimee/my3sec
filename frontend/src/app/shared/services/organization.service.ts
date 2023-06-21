import { ethers } from 'ethers';
import { Observable, concatMap, forkJoin, from, map, mergeMap, switchMap, toArray } from 'rxjs';

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
    return this.my3secHub.getOrganizationsIds().pipe(
      concatMap(data => data),
      mergeMap(id => this.getOrganizationByAddress(id)),
      toArray()
    );
  }

  public getFullOrganization(): Observable<Organization> {
    return this.getOrganization().pipe(
      switchMap((organization: OrganizationMetadata) => this.getOrganizationFromMetadata(organization))
    );
  }

  public getOrganizationByAddress(address: string): Observable<Organization> {
    return this.my3secHub.getOrganizationMetadataUri(address).pipe(
      switchMap((uri: string) => this.ipfsService.retrieveJSON<OrganizationMetadata>(uri)),
      switchMap((organization: OrganizationMetadata) => this.getOrganizationFromMetadata(organization))
    );
  }

  public getOrganization(): Observable<OrganizationMetadata> {
    return this.contractService
      .getMetadataURI()
      .pipe(switchMap((uri: string) => this.ipfsService.retrieveJSON<OrganizationMetadata>(uri)));
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
    return start.getMonth() - end.getMonth() + 12 * (start.getFullYear() - end.getFullYear());
  }

  private calculateCurrentMonth(start: Date): number {
    const current = new Date();
    return current.getMonth() - start.getMonth() + 12 * (current.getFullYear() - start.getFullYear());
  }

  private getOrganizationFromMetadata(organization: OrganizationMetadata): Observable<Organization> {
    return forkJoin({
      ...organization,
      projectCount: this.contractService.getProjectCount(),
      memberCount: this.contractService.getMemberCount(),
    });
  }
}
