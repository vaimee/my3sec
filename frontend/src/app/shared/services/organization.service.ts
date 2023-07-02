import { ethers } from 'ethers';
import { Observable, concatMap, filter, forkJoin, from, map, mergeMap, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { Status } from '@shared/enums';
import {
  Organization,
  OrganizationMetadata,
  Profile,
  Project,
  ProjectMetadata,
  Task,
  TaskMetadata,
} from '@shared/interfaces';

import { Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

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
    private skillService: SkillService,
    private metamaskService: MetamaskService
  ) {}

  public join(organizationAddress: string): Observable<ethers.ContractReceipt> {
    return this.my3secHub.joinOrganization(organizationAddress);
  }

  public createOrganization(organizationMetadata: OrganizationMetadata): Observable<string> {
    return this.ipfsService
      .storeJSON(organizationMetadata)
      .pipe(switchMap(metadataUri => this.my3secHub.createOrganization(metadataUri)));
  }

  public createProject(project: ProjectMetadata, members: Profile[]): Observable<number> {
    let projectId: number;
    return this.ipfsService.storeJSON(project).pipe(
      switchMap(metadataURI => this.contractService.createProject({ metadataURI })),
      switchMap(tx => from(tx.wait())),
      switchMap(receipt => {
        const projectEvent = receipt.events?.filter(event => event.event === 'ProjectCreated')[0];
        projectId = projectEvent ? Number(projectEvent) : 0;
        const requests = [];
        for (const member of members) {
          //TODO: get project Id (this event name current does not exist)
          requests.push(this.contractService.addProjectMember(projectId, +member.id));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      switchMap(this.wait),
      map(() => projectId)
    );
  }

  public createTask(
    projectId: number,
    taskMetadata: TaskMetadata,
    skills: Skill[],
    members: Profile[]
  ): Observable<number> {
    let taskId: number;
    return this.ipfsService.storeJSON(taskMetadata).pipe(
      map(metadataUri => {
        const createTaskStruct: DataTypes.CreateTaskStruct = {
          metadataURI: metadataUri,
          skills: skills.map(skill => skill.id),
        };
        return createTaskStruct;
      }),
      switchMap(createTaskStruct => this.contractService.createTask(projectId, createTaskStruct)),
      switchMap(tx => from(tx.wait())),
      switchMap(receipt => {
        const taskEvent = receipt.events?.filter(event => event.event === 'TaskCreated')[0];
        taskId = taskEvent ? Number(taskEvent) : 0;
        const requests = [];
        for (const member of members) {
          requests.push(this.contractService.addTaskMember(taskId, +member.id));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      switchMap(this.wait),
      map(() => taskId)
    );
  }

  public getOrganizations(): Observable<Organization[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      concatMap(data => data),
      mergeMap(address => this.getOrganizationByAddress(address)),
      toArray()
    );
  }

  public getProjectsOfProfile(profileId: number): Observable<Project[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      switchMap(ids => {
        const orgProjects = [];
        for (const id of ids) {
          this.setTarget(id);
          orgProjects.push(this.getProjectsByMember(profileId));
        }
        return forkJoin(orgProjects);
      }),
      concatMap(data => data)
    );
  }

  public getTasksOfProfile(profileId: number): Observable<Task[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      switchMap(ids => {
        const orgProjects = [];
        for (const id of ids) {
          this.setTarget(id);
          orgProjects.push(this.getTasksByMember(profileId));
        }
        return forkJoin(orgProjects);
      }),
      concatMap(data => data)
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

  public getProject(projectId: number): Observable<Project> {
    return this.contractService.getProject(projectId).pipe(
      mergeMap(project => {
        return this.ipfsService
          .retrieveJSON<ProjectMetadata>(project.metadataURI)
          .pipe(map(projectMetadata => this.getProjectFromMetadata(projectMetadata, project)));
      })
    );
  }

  public getProjects(): Observable<Project[]> {
    return this.contractService.getProjects().pipe(
      concatMap(projects => projects),
      mergeMap(project => {
        return this.ipfsService.retrieveJSON<ProjectMetadata>(project.metadataURI).pipe(
          map(data => {
            const startDate = new Date(data.start);
            const endDate = new Date(data.end);
            return {
              ...data,
              id: project.id.toNumber(),
              status: project.status,
              organization: this.contractService.address,
              tasks: this.getTasks(project.id.toNumber()),
              members: this.getProjectMembers(project.id.toNumber()),
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

  public getProjectsByMember(memberId: number): Observable<Project[]> {
    return this.getProjects().pipe(
      switchMap(projects => {
        const requests = [];
        for (const project of projects) {
          requests.push(
            project.members.pipe(filter(members => !members.find(member => member.id === memberId.toString())))
          );
        }
        return forkJoin(requests).pipe(map(data => (data.length > 0 ? projects : [])));
      })
    );
  }

  public getProjectMembers(projectId: number): Observable<Profile[]> {
    return this.contractService.getProjectMembers(projectId).pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id)),
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

  //TODO: fix request of Observable<Task[]>[] in order to flat the inner array
  public getTasksByMember(memberId: number): Observable<Task[]> {
    return this.getProjects().pipe(
      switchMap(projects => {
        const requests: Observable<Task[]>[] = [];
        for (const project of projects) {
          requests.push(project.tasks.pipe(filter(members => !members.find(member => member.id === memberId))));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data)
    );
  }

  public setTarget(targetAddress: string): void {
    this.contractService.setTarget(targetAddress);
  }

  public getMembers(): Observable<Profile[]> {
    return this.contractService.getMembers().pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getManagers(): Observable<Profile[]> {
    return this.contractService.getManagers().pipe(
      concatMap(data => data),
      switchMap(address => this.my3secHub.getDefaultProfile(address)),
      switchMap(({ id }) => this.profileService.getProfile(id.toNumber())),
      toArray()
    );
  }

  public getPendingMembers(): Observable<Profile[]> {
    return this.contractService.getPendingMembers().pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public updateTask(taskId: number, task: DataTypes.UpdateTaskStruct) {
    const hexValue = ethers.utils.hexValue(taskId);
    return from(this.contractService.updateTask(ethers.BigNumber.from(hexValue), task));
  }

  public updateProject(projectId: number, status: Status) {
    return this.contractService.getProject(projectId).pipe(
      switchMap(data => {
        const project: DataTypes.UpdateProjectStruct = {
          metadataURI: data.metadataURI,
          status: status,
        };
        const hexValue = ethers.utils.hexValue(projectId);
        return this.contractService.updateProject(ethers.BigNumber.from(hexValue), project);
      })
    );
  }

  public rejectPendingMember(profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.rejectPendingMember(profileId);
  }

  public approvePendingMember(profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.approvePendingMember(profileId);
  }

  //different name from the contract function, but more intuitive
  public removeMember(profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.leave(profileId);
  }

  public promoteToManager(profileAddress: string): Observable<ethers.ContractReceipt> {
    return this.contractService.promoteToManager(profileAddress);
  }

  public isManager(address: string): Observable<boolean> {
    return this.contractService.isManager(address);
  }

  public isPendingMember(profileId: number): Observable<boolean> {
    return this.contractService.isPendingMember(profileId);
  }

  public isMember(profileId: number): Observable<boolean> {
    return this.contractService.isMember(profileId);
  }

  public isCurrentUserManager(): Observable<boolean> {
    return this.contractService.isManager(this.metamaskService.userAddress);
  }

  public isCurrentUserPendingMember(): Observable<boolean> {
    return this.my3secHub
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(switchMap(({ id }) => this.contractService.isPendingMember(id.toNumber())));
  }

  public isCurrentUserMember(): Observable<boolean> {
    return this.my3secHub
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(switchMap(({ id }) => this.contractService.isMember(id.toNumber())));
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
    const currentMonth = current.getMonth() - start.getMonth() + 12 * (current.getFullYear() - start.getFullYear());
    if (currentMonth < 0) return 0;
    return currentMonth;
  }

  private getOrganizationFromMetadata(organization: OrganizationMetadata, address: string): Observable<Organization> {
    return forkJoin({
      projectCount: this.contractService.getProjectCount(),
      members: this.getMembers(),
      pendingMembers: this.getPendingMembers(),
      managers: this.getManagers(),
    }).pipe(
      map(organizationMembersData => ({
        ...organization,
        ...organizationMembersData,
        address: address,
      }))
    );
  }

  private getProjectFromMetadata(
    projectMetadata: ProjectMetadata,
    projectStruct: DataTypes.ProjectViewStructOutput
  ): Project {
    const startDate = new Date(projectMetadata.start);
    const endDate = new Date(projectMetadata.end);
    return {
      ...projectMetadata,
      id: projectStruct.id.toNumber(),
      status: projectStruct.status,
      organization: this.contractService.address,
      tasks: this.getTasks(projectStruct.id.toNumber()),
      members: this.getProjectMembers(projectStruct.id.toNumber()),
      hours: 0, // TODO: calculate hours
      startDate,
      endDate,
      currentMonth: this.calculateCurrentMonth(startDate),
      durationInMonths: this.calculateDurationInMonths(startDate, endDate),
    };
  }

  private async wait(tx: ethers.ContractTransaction): Promise<ethers.ContractReceipt> {
    return await tx.wait();
  }
}
