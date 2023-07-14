import { ethers } from 'ethers';
import {
  Observable,
  concat,
  concatMap,
  filter,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  toArray,
} from 'rxjs';

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
    return this.createProjectWithoutMembers(project).pipe(
      switchMap(id => {
        projectId = id;
        const requests: Observable<ethers.ContractReceipt>[] = [];
        for (const member of members) {
          requests.push(this.addProjectMember(id, +member.id));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(() => projectId)
    );
  }

  public createProjectWithoutMembers(project: ProjectMetadata): Observable<number> {
    return this.ipfsService
      .storeJSON(project)
      .pipe(switchMap(metadataURI => this.contractService.createProject({ metadataURI })));
  }

  public addProjectMember(projectId: number, profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.addProjectMember(projectId, profileId);
  }

  public addTaskMember(taskId: number, profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.addTaskMember(taskId, profileId);
  }

  public createTask(
    projectId: number,
    taskMetadata: TaskMetadata,
    skills: Skill[],
    members: Profile[]
  ): Observable<number> {
    let taskId: number;
    return this.createTaskWithoutMembers(projectId, taskMetadata, skills).pipe(
      switchMap(id => {
        taskId = id;
        const requests: Observable<ethers.ContractReceipt>[] = [];
        for (const member of members) {
          requests.push(this.addTaskMember(id, +member.id));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(() => taskId)
    );
  }

  public createTaskWithoutMembers(projectId: number, taskMetadata: TaskMetadata, skills: Skill[]): Observable<number> {
    return this.ipfsService.storeJSON(taskMetadata).pipe(
      map(metadataUri => {
        const createTaskStruct: DataTypes.CreateTaskStruct = {
          metadataURI: metadataUri,
          skills: skills.map(skill => skill.id),
        };
        return createTaskStruct;
      }),
      switchMap(createTaskStruct => this.contractService.createTask(projectId, createTaskStruct))
    );
  }

  public getOrganizations(): Observable<Organization[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      concatMap(addresses => {
        const requests = [];
        for (const address of addresses) {
          requests.push(this.getOrganizationByAddress(address));
        }
        return concat(requests).pipe(concatMap(data => data));
      }),
      toArray()
    );
  }

  public isMemberOfOrganization(profileId: number, address: string): Observable<boolean> {
    this.setTarget(address);
    return this.contractService.isMember(profileId);
  }

  public getOrganizationsOfProfile(profileId: number): Observable<Organization[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      concatMap(addresses => {
        const requests = [];
        for (const address of addresses) {
          requests.push(
            this.isMemberOfOrganization(profileId, address).pipe(
              map(isMember => (isMember ? address : null)),
              filter(addressOrFalse => {
                if (addressOrFalse === null) return false;
                return true;
              }),
              switchMap(address => this.getOrganizationByAddress(address as string))
            )
          );
        }
        return concat(requests).pipe(concatMap(data => data));
      }),
      toArray()
    );
  }

  public getOrganizationsOfCurrentProfile(): Observable<Organization[]> {
    return this.my3secHub.getDefaultProfile(this.metamaskService.userAddress).pipe(
      switchMap(({ id }) => {
        return this.getOrganizationsOfProfile(+id);
      })
    );
  }
  public getProjectsOfProfile(profileId: number): Observable<Project[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      concatMap(data => data),
      concatMap(address => {
        this.setTarget(address);
        return this.getProjectsByMember(profileId);
      }),
      toArray(),
      map(data => data.flat())
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
      concatMap(projects => {
        return projects;
      }),
      mergeMap(project => {
        return this.ipfsService
          .retrieveJSON<ProjectMetadata>(project.metadataURI)
          .pipe(map(metadata => this.getProjectFromMetadata(metadata, project)));
      }),
      toArray()
    );
  }

  public getCurrentUserAffiliations(): Observable<{ project: Project; tasks: Task[] }[]> {
    let memberId: number;
    return this.my3secHub.getDefaultProfile(this.metamaskService.userAddress).pipe(
      switchMap(({ id }) => {
        memberId = id.toNumber();
        return this.my3secHub.getOrganizationsAddress();
      }),
      switchMap(addresses => {
        const userProjectsAndTasks = [];
        for (const address of addresses) {
          this.setTarget(address);
          userProjectsAndTasks.push(this.getProjectsAndTaskByMember(memberId));
        }
        return forkJoin(userProjectsAndTasks).pipe(map(results => results.reduce((acc, val) => acc.concat(val), [])));
      })
    );
  }

  public getProjectsAndTaskByMember(memberId: number): Observable<{ project: Project; tasks: Task[] }[]> {
    return this.getProjectsByMember(memberId).pipe(
      switchMap(projects => {
        const requests: Observable<{ project: Project; tasks: Task[] }>[] = [];
        for (const project of projects) {
          requests.push(
            this.getTasksByMember(memberId, project.id).pipe(
              map(tasks => {
                return {
                  project,
                  tasks: tasks.filter(task => task.status === Status.IN_PROGRESS),
                };
              })
            )
          );
        }
        return forkJoin(requests);
      })
    );
  }

  public getProjectsByMember(memberId: number): Observable<Project[]> {
    return this.getProjects().pipe(
      concatMap(projects => projects),
      mergeMap(project => {
        return this.contractService.isProjectMember(project.id, memberId).pipe(
          map(isMember => {
            if (isMember) {
              return project;
            }
            return undefined;
          })
        );
      }),
      toArray(),
      map(projects => projects.filter(project => project !== undefined) as Project[])
    );
  }

  public getTasksByMember(memberId: number, projectId: number): Observable<Task[]> {
    return this.getTasks(projectId).pipe(
      concatMap(data => data),
      mergeMap(task => {
        return this.contractService.isTaskMember(task.id, memberId).pipe(
          map(isMember => {
            if (isMember) {
              return task;
            }
            return undefined;
          })
        );
      }),
      toArray(),
      map(tasks => tasks.filter(task => task !== undefined) as Task[])
    );
  }

  public getProjectMembers(projectId: number): Observable<Profile[]> {
    return this.contractService.getProjectMembers(projectId).pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getTaskMembers(taskId: number): Observable<Profile[]> {
    return this.contractService.getTaskMembers(taskId).pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getOrganizationMembersNotInProject(projectId: number): Observable<Profile[]> {
    return forkJoin([this.contractService.getMembers(), this.contractService.getProjectMembers(projectId)]).pipe(
      map(([organizationMembers, projectMembers]) => organizationMembers.filter(id => !projectMembers.includes(id))),
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getProjectMembersNotInTask(projectId: number, taskId: number): Observable<Profile[]> {
    return forkJoin([
      this.contractService.getProjectMembers(projectId),
      this.contractService.getTaskMembers(taskId),
    ]).pipe(
      map(([projectMembers, taskMembers]) => projectMembers.filter(id => !taskMembers.includes(id))),
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public removeProjectMember(projectId: number, profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.removeProjectMember(projectId, profileId);
  }

  public removeTaskMember(taskId: number, profileId: number): Observable<ethers.ContractReceipt> {
    return this.contractService.removeTaskMember(taskId, profileId);
  }

  public getTask(projectId: number, taskId: number): Observable<Task> {
    return this.contractService.getTask(projectId, taskId).pipe(
      switchMap(task => {
        return this.ipfsService
          .retrieveJSON<TaskMetadata>(task.metadataURI)
          .pipe(map(metadata => this.getTaskFromMetadata(metadata, task)));
      })
    );
  }

  public getTasks(projectId: number): Observable<Task[]> {
    return this.contractService.getTasks(projectId).pipe(
      concatMap(tasks => tasks),
      mergeMap(task =>
        this.ipfsService
          .retrieveJSON<TaskMetadata>(task.metadataURI)
          .pipe(map(metadata => this.getTaskFromMetadata(metadata, task)))
      ),
      toArray()
    );
  }

  public updateTaskTime(
    organizationAddress: string,
    taskId: number,
    hours: number
  ): Observable<ethers.ContractReceipt> {
    return this.my3secHub.logTime(organizationAddress, taskId, hours);
  }

  public setTarget(targetAddress: string) {
    return this.contractService.setTarget(targetAddress);
  }

  public getMembers(): Observable<Profile[]> {
    return this.contractService.getMembers().pipe(
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getManagers(): Observable<Profile[]> {
    return this.contractService.getManagers().pipe(
      concatMap(data => data),
      mergeMap(address => this.my3secHub.getDefaultProfile(address)),
      mergeMap(({ id }) => this.profileService.getProfile(id.toNumber())),
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

  public leave(organizationAddress: string): Observable<ethers.ContractReceipt> {
    return this.my3secHub.leaveOrganization(organizationAddress);
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

  public isCurrentUserTaskMember(taskId: number): Observable<boolean> {
    return this.my3secHub
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(switchMap(({ id }) => this.contractService.isTaskMember(taskId, id.toNumber())));
  }

  public getTaskLoggedTime(taskId: number): Observable<number> {
    return this.contractService.getTaskLoggedTime(taskId).pipe(map(seconds => Math.round(seconds / 3600)));
  }

  public getTaskLoggedTimeOfProfiles(taskId: number, task$: Observable<Task>): Observable<number[]> {
    return task$.pipe(
      switchMap(task$ => task$.members$),
      concatMap(member => member),
      switchMap(member => this.contractService.getTaskLoggedTimeOfProfile(taskId, +member.id)),
      toArray()
    );
  }

  public getTaskLoggedTimeOfProfile(taskId: number, profileId: number): Observable<number> {
    return this.contractService
      .getTaskLoggedTimeOfProfile(taskId, profileId)
      .pipe(map(seconds => Math.round(seconds / 3600)));
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
    this.setTarget(address);
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
      startDate,
      endDate,
      currentMonth: this.calculateCurrentMonth(startDate),
      durationInMonths: this.calculateDurationInMonths(startDate, endDate),
    };
  }

  getTaskFromMetadata(taskMetadata: TaskMetadata, task: DataTypes.TaskViewStructOutput): Task {
    const start = new Date(taskMetadata.start);
    const end = new Date(taskMetadata.end);
    const skills = task.skills.map(skill => this.skillService.getSkill(skill.toNumber()));
    const id = task.id.toNumber();
    return {
      ...taskMetadata,
      id: id,
      status: task.status,
      organization: this.contractService.address,
      hours$: this.getTaskLoggedTime(id),
      start,
      end,
      currentMonth: this.calculateCurrentMonth(start),
      durationInMonths: this.calculateDurationInMonths(start, end),
      skills$: skills.length > 0 ? forkJoin(skills) : of([]),
      metadataURI: task.metadataURI,
      members$: this.getTaskMembers(id),
    };
  }
}
