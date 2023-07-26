import { ethers } from 'ethers';
import { Observable, concat, concatMap, filter, forkJoin, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';

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

  public createProject(project: ProjectMetadata, members: Profile[], address: string): Observable<number> {
    let projectId: number;
    return this.createProjectWithoutMembers(project, address).pipe(
      switchMap(id => {
        projectId = id;
        const requests: Observable<ethers.ContractReceipt>[] = [];
        for (const member of members) {
          requests.push(this.addProjectMember(id, +member.id, address));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(() => projectId)
    );
  }

  public createProjectWithoutMembers(project: ProjectMetadata, address: string): Observable<number> {
    return this.ipfsService
      .storeJSON(project)
      .pipe(switchMap(metadataURI => this.contractService.createProject({ metadataURI }, address)));
  }

  public addProjectMember(projectId: number, profileId: number, address: string): Observable<ethers.ContractReceipt> {
    return this.contractService.addProjectMember(projectId, profileId, address);
  }

  public addTaskMember(taskId: number, profileId: number, address: string): Observable<ethers.ContractReceipt> {
    return this.contractService.addTaskMember(taskId, profileId, address);
  }

  public createTask(
    projectId: number,
    taskMetadata: TaskMetadata,
    skills: Skill[],
    members: Profile[],
    address: string
  ): Observable<number> {
    let taskId: number;
    return this.createTaskWithoutMembers(projectId, taskMetadata, skills, address).pipe(
      switchMap(id => {
        taskId = id;
        const requests: Observable<ethers.ContractReceipt>[] = [];
        for (const member of members) {
          requests.push(this.addTaskMember(id, +member.id, address));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(() => taskId)
    );
  }

  public createTaskWithoutMembers(
    projectId: number,
    taskMetadata: TaskMetadata,
    skills: Skill[],
    address: string
  ): Observable<number> {
    return this.ipfsService.storeJSON(taskMetadata).pipe(
      map(metadataUri => {
        const createTaskStruct: DataTypes.CreateTaskStruct = {
          metadataURI: metadataUri,
          skills: skills.map(skill => skill.id),
        };
        return createTaskStruct;
      }),
      switchMap(createTaskStruct => this.contractService.createTask(projectId, createTaskStruct, address))
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
    return this.contractService.isMember(profileId, address);
  }

  public getOrganizationsOfProfile(profileId: number): Observable<Organization[]> {
    return forkJoin([
      this.my3secHub.getOrganizationsJoined(profileId),
      this.my3secHub.getOrganizationsLeft(profileId),
    ]).pipe(
      map(organizationMovement => {
        const joined = organizationMovement[0].map(event => event.args[0]);
        const left = organizationMovement[1].map(event => event.args[0]);
        left.map(organizationLeft => {
          const indexToRemove = joined.indexOf(organizationLeft);
          if (indexToRemove > -1) joined.splice(indexToRemove, 1);
        });
        return joined;
      }),
      concatMap(data => data),
      mergeMap(address => {
        return this.getOrganizationByAddress(address);
      }),
      toArray()
    );
  }

  public isManagerOfOrganization(profileId: number, address: string): Observable<boolean> {
    return this.my3secHub
      .getProfileAccount(profileId)
      .pipe(switchMap(walletAddress => this.contractService.isManager(walletAddress, address)));
  }

  public getOrganizationsManagerOfProfile(profileId: number): Observable<Organization[]> {
    return this.my3secHub.getOrganizationsAddress().pipe(
      concatMap(addresses => {
        const requests = [];
        for (const address of addresses) {
          requests.push(
            this.isManagerOfOrganization(profileId, address).pipe(
              map(isManager => (isManager ? address : null)),
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
    return forkJoin([this.my3secHub.getProjectsAdded(profileId), this.my3secHub.getProjectsRemoved(profileId)]).pipe(
      map(projectsMovement => {
        const joined: [string, ethers.BigNumber, ethers.BigNumber][] = projectsMovement[0].map(event => [
          event.args[0],
          event.args[1],
          event.args[2],
        ]);
        const left: [string, ethers.BigNumber, ethers.BigNumber][] = projectsMovement[1].map(event => [
          event.args[0],
          event.args[1],
          event.args[2],
        ]);
        left.map(projectLeft => {
          const indexToRemove = joined.indexOf(projectLeft);
          if (indexToRemove > -1) joined.splice(indexToRemove, 1);
        });
        return joined;
      }),
      concatMap(data => data),
      mergeMap(projectAddedEvent => {
        return this.getProject(projectAddedEvent[1].toNumber(), projectAddedEvent[0]);
      }),
      toArray()
    );
  }

  public getOrganizationByAddress(address: string): Observable<Organization> {
    return this.getOrganization(address).pipe(
      switchMap((organization: OrganizationMetadata) => this.getOrganizationFromMetadata(organization, address))
    );
  }

  public getOrganization(address: string): Observable<OrganizationMetadata> {
    return this.contractService.getMetadataURI(address).pipe(
      switchMap((uri: string) => {
        return this.ipfsService.retrieveJSON<OrganizationMetadata>(uri);
      })
    );
  }

  public getProject(projectId: number, address: string): Observable<Project> {
    return this.contractService.getProject(projectId, address).pipe(
      mergeMap(project => {
        return this.ipfsService
          .retrieveJSON<ProjectMetadata>(project.metadataURI)
          .pipe(map(projectMetadata => this.getProjectFromMetadata(projectMetadata, project, address)));
      })
    );
  }

  public getProjects(address: string): Observable<Project[]> {
    return this.contractService.getProjects(address).pipe(
      concatMap(projects => {
        return projects;
      }),
      mergeMap(project => {
        return this.ipfsService
          .retrieveJSON<ProjectMetadata>(project.metadataURI)
          .pipe(map(metadata => this.getProjectFromMetadata(metadata, project, address)));
      }),
      toArray()
    );
  }

  public getProjectsAndTaskByMember(
    memberId: number,
    address: string
  ): Observable<{ project: Project; tasks: Task[] }[]> {
    return this.getProjectsByMember(memberId, address).pipe(
      switchMap(projects => {
        const requests: Observable<{ project: Project; tasks: Task[] }>[] = [];
        for (const project of projects) {
          requests.push(
            this.getTasksByMember(memberId, project.id, address).pipe(
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

  public getProjectsByMember(memberId: number, address: string): Observable<Project[]> {
    return this.getProjects(address).pipe(
      concatMap(projects => projects),
      mergeMap(project => {
        return this.contractService.isProjectMember(project.id, memberId, address).pipe(
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

  public getTasksByMember(memberId: number, projectId: number, address: string): Observable<Task[]> {
    return this.getTasks(projectId, address).pipe(
      concatMap(data => data),
      mergeMap(task => {
        return this.contractService.isTaskMember(task.id, memberId, address).pipe(
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

  public getProjectMembers(projectId: number, address: string): Observable<Profile[]> {
    return this.contractService.getProjectMembers(projectId, address).pipe(
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getTaskMembers(taskId: number, address: string): Observable<Profile[]> {
    return this.contractService.getTaskMembers(taskId, address).pipe(
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getOrganizationMembersNotInProject(projectId: number, address: string): Observable<Profile[]> {
    return forkJoin([
      this.contractService.getMembers(address),
      this.contractService.getProjectMembers(projectId, address),
    ]).pipe(
      map(([organizationMembers, projectMembers]) => organizationMembers.filter(id => !projectMembers.includes(id))),
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getProjectMembersNotInTask(projectId: number, taskId: number, address: string): Observable<Profile[]> {
    return forkJoin([
      this.contractService.getProjectMembers(projectId, address),
      this.contractService.getTaskMembers(taskId, address),
    ]).pipe(
      map(([projectMembers, taskMembers]) => projectMembers.filter(id => !taskMembers.includes(id))),
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public removeProjectMember(
    projectId: number,
    profileId: number,
    address: string
  ): Observable<ethers.ContractReceipt> {
    return this.contractService.removeProjectMember(projectId, profileId, address);
  }

  public removeTaskMember(taskId: number, profileId: number, address: string): Observable<ethers.ContractReceipt> {
    return this.contractService.removeTaskMember(taskId, profileId, address);
  }

  public getTask(projectId: number, taskId: number, address: string): Observable<Task> {
    return this.contractService.getTask(projectId, taskId, address).pipe(
      switchMap(task => {
        return this.ipfsService
          .retrieveJSON<TaskMetadata>(task.metadataURI)
          .pipe(map(metadata => this.getTaskFromMetadata(metadata, task, address)));
      })
    );
  }

  public getTaskById(taskId: number, address: string): Observable<Task> {
    return this.contractService.getTaskById(taskId, address).pipe(
      switchMap(task => {
        return this.ipfsService
          .retrieveJSON<TaskMetadata>(task.metadataURI)
          .pipe(map(metadata => this.getTaskFromMetadata(metadata, task, address)));
      })
    );
  }

  public getTasks(projectId: number, address: string): Observable<Task[]> {
    return this.contractService.getTasks(projectId, address).pipe(
      concatMap(tasks => tasks),
      mergeMap(task =>
        this.ipfsService
          .retrieveJSON<TaskMetadata>(task.metadataURI)
          .pipe(map(metadata => this.getTaskFromMetadata(metadata, task, address)))
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

  public getMembers(address: string): Observable<Profile[]> {
    return this.contractService.getMembers(address).pipe(
      concatMap(data => data),
      mergeMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public getManagers(address: string): Observable<Profile[]> {
    return this.contractService.getManagers(address).pipe(
      concatMap(data => data),
      mergeMap(address => this.my3secHub.getDefaultProfile(address)),
      mergeMap(({ id }) => this.profileService.getProfile(id.toNumber())),
      toArray()
    );
  }

  public getPendingMembers(address: string): Observable<Profile[]> {
    return this.contractService.getPendingMembers(address).pipe(
      concatMap(data => data),
      switchMap(id => this.profileService.getProfile(id)),
      toArray()
    );
  }

  public updateTask(taskId: number, task: DataTypes.UpdateTaskStruct, address: string) {
    const hexValue = ethers.utils.hexValue(taskId);
    return from(this.contractService.updateTask(ethers.BigNumber.from(hexValue), task, address));
  }

  public updateProject(projectId: number, status: Status, address: string) {
    return this.contractService.getProject(projectId, address).pipe(
      switchMap(data => {
        const project: DataTypes.UpdateProjectStruct = {
          metadataURI: data.metadataURI,
          status: status,
        };
        const hexValue = ethers.utils.hexValue(projectId);
        return this.contractService.updateProject(ethers.BigNumber.from(hexValue), project, address);
      })
    );
  }

  public rejectPendingMember(profileId: number, address: string): Observable<ethers.ContractReceipt> {
    return this.contractService.rejectPendingMember(profileId, address);
  }

  public approvePendingMember(profileId: number, address: string): Observable<ethers.ContractReceipt> {
    return this.contractService.approvePendingMember(profileId, address);
  }

  public leave(organizationAddress: string): Observable<ethers.ContractReceipt> {
    return this.my3secHub.leaveOrganization(organizationAddress);
  }

  public promoteToManager(profileAddress: string, address: string): Observable<ethers.ContractReceipt> {
    return this.contractService.promoteToManager(profileAddress, address);
  }

  public getOwnerAddress(address: string): Observable<string> {
    return this.contractService.getOwner(address);
  }

  public isOwner(walletAddress: string, organizationAddress: string): Observable<boolean> {
    return this.contractService.isOwner(walletAddress, organizationAddress);
  }

  public isManager(userWalletAddress: string, organizationAddress: string): Observable<boolean> {
    return this.contractService.isManager(userWalletAddress, organizationAddress);
  }

  public isPendingMember(profileId: number, address: string): Observable<boolean> {
    return this.contractService.isPendingMember(profileId, address);
  }

  public isMember(profileId: number, address: string): Observable<boolean> {
    return this.contractService.isMember(profileId, address);
  }

  public isCurrentUserManager(address: string): Observable<boolean> {
    return this.contractService.isManager(this.metamaskService.userAddress, address);
  }

  public isCurrentUserOwner(address: string): Observable<boolean> {
    // TODO: fixme this.contractService.isOwner(this.metamaskService.userAddress); // didn't work
    return this.getOwnerAddress(address).pipe(
      map(address => {
        return this.metamaskService.userAddress === address.toLocaleLowerCase();
      })
    );
  }

  public isCurrentUserPendingMember(address: string): Observable<boolean> {
    return this.my3secHub
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(switchMap(({ id }) => this.contractService.isPendingMember(id.toNumber(), address)));
  }

  public isCurrentUserMember(address: string): Observable<boolean> {
    return this.my3secHub
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(switchMap(({ id }) => this.contractService.isMember(id.toNumber(), address)));
  }

  public isCurrentUserTaskMember(taskId: number, address: string): Observable<boolean> {
    return this.my3secHub
      .getDefaultProfile(this.metamaskService.userAddress)
      .pipe(switchMap(({ id }) => this.contractService.isTaskMember(taskId, id.toNumber(), address)));
  }

  public getTaskLoggedTime(taskId: number, address: string): Observable<number> {
    return this.contractService.getTaskLoggedTime(taskId, address).pipe(map(seconds => Math.round(seconds / 3600)));
  }

  public getTaskLoggedTimeOfProfiles(
    taskId: number,
    task$: Observable<Task>,
    address: string
  ): Observable<{ id: string; time: number }[]> {
    return task$.pipe(
      switchMap(task$ => task$.members$),
      concatMap(member => member),
      mergeMap(member => {
        return this.contractService
          .getTaskLoggedTimeOfProfile(taskId, +member.id, address)
          .pipe(map(timeLogged => ({ id: member.id, time: timeLogged })));
      }),
      toArray()
    );
  }

  public getTaskLoggedTimeOfProfile(taskId: number, profileId: number, address: string): Observable<number> {
    return this.contractService
      .getTaskLoggedTimeOfProfile(taskId, profileId, address)
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
    return forkJoin({
      projectCount: this.contractService.getProjectCount(address),
      members: this.getMembers(address),
      pendingMembers: this.getPendingMembers(address),
      managers: this.getManagers(address),
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
    projectStruct: DataTypes.ProjectViewStructOutput,
    address: string
  ): Project {
    const startDate = new Date(projectMetadata.start);
    const endDate = new Date(projectMetadata.end);
    return {
      ...projectMetadata,
      id: projectStruct.id.toNumber(),
      status: projectStruct.status,
      organization: address,
      tasks: this.getTasks(projectStruct.id.toNumber(), address),
      members: this.getProjectMembers(projectStruct.id.toNumber(), address),
      startDate,
      endDate,
      currentMonth: this.calculateCurrentMonth(startDate),
      durationInMonths: this.calculateDurationInMonths(startDate, endDate),
    };
  }

  getTaskFromMetadata(taskMetadata: TaskMetadata, task: DataTypes.TaskViewStructOutput, address: string): Task {
    const start = new Date(taskMetadata.start);
    const end = new Date(taskMetadata.end);
    const skills = task.skills.map(skill => this.skillService.getSkill(skill.toNumber()));
    const id = task.id.toNumber();
    return {
      ...taskMetadata,
      id: id,
      status: task.status,
      organization: address,
      hours$: this.getTaskLoggedTime(id, address),
      start,
      end,
      currentMonth: this.calculateCurrentMonth(start),
      durationInMonths: this.calculateDurationInMonths(start, end),
      skills$: skills.length > 0 ? forkJoin(skills) : of([]),
      metadataURI: task.metadataURI,
      members$: this.getTaskMembers(id, address),
    };
  }
}
