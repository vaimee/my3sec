import { BigNumber, ethers, providers } from 'ethers';
import { Observable, catchError, concatMap, forkJoin, from, map, mergeMap, of, reduce, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Organization__factory } from '@vaimee/my3sec-contracts/dist';
import { DataTypes, Organization } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

@Injectable({
  providedIn: 'root',
})
export class OrganizationContractService {
  protected contract: Organization | undefined;

  public setTarget(targetAddress: string): void {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    const signer = provider.getSigner();
    this.contract = Organization__factory.connect(targetAddress, signer);
  }

  public get address(): string {
    this.assertTargetSet();
    return this.contract.address;
  }

  public getMetadataURI(): Observable<string> {
    this.assertTargetSet();
    return from(this.contract.getMetadataURI());
  }

  public join(profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.join(profileId)).pipe(switchMap(this.wait));
  }

  public leave(profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.leave(profileId)).pipe(switchMap(this.wait));
  }

  public rejectPendingMember(profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.rejectPendingMember(profileId)).pipe(switchMap(this.wait));
  }

  public approvePendingMember(profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.approvePendingMember(profileId)).pipe(switchMap(this.wait));
  }

  public removeProjectMember(projectId: number, profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.removeProjectMember(projectId, profileId)).pipe(switchMap(this.wait));
  }

  public promoteToManager(memberAccount: string): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.addToWhitelist(memberAccount)).pipe(switchMap(this.wait));
  }

  public isManager(address: string) {
    this.assertTargetSet();
    return from(this.contract.isWhitelisted(address));
  }

  public getProjectCount(): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getProjectCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getProject(projectId: number): Observable<DataTypes.ProjectViewStructOutput> {
    this.assertTargetSet();
    return from(this.contract.getProject(projectId));
  }

  public getProjects(): Observable<DataTypes.ProjectViewStructOutput[]> {
    return from(this.getProjectCount()).pipe(
      mergeMap(total => {
        const requests = [];
        this.assertTargetSet();
        for (let i = 0; i < total; i++) {
          requests.push(this.contract.getProject(i));
        }
        return forkJoin(requests);
      })
    );
  }

  public updateProject(
    projectId: BigNumber,
    project: DataTypes.UpdateProjectStruct
  ): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.updateProject(projectId, project)).pipe(switchMap(this.wait));
  }

  public getMemberCount(): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getMemberCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getMembers(): Observable<number[]> {
    return from(this.getMemberCount()).pipe(
      mergeMap(count => {
        const requests = [];
        this.assertTargetSet();
        for (let i = 0; i < count; i++) {
          requests.push(this.contract.getMember(i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public getManagersCount(): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getWhitelistCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getManagers(): Observable<string[]> {
    return from(this.getManagersCount()).pipe(
      mergeMap(count => {
        const requests = [];
        this.assertTargetSet();
        for (let i = 0; i < count; i++) {
          requests.push(this.contract.getWhitelistMember(i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      toArray()
    );
  }

  public getPendingMemberCount(): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getPendingMemberCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getPendingMembers(): Observable<number[]> {
    this.assertTargetSet();
    return from(this.getPendingMemberCount()).pipe(
      mergeMap(count => {
        const requests: Observable<ethers.BigNumber>[] = [];
        this.assertTargetSet();
        for (let i = 0; i < count; i++) {
          requests.push(from(this.contract.getPendingMember(i)));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public getProjectMemberCount(projectId: number): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getProjectMemberCount(projectId)).pipe(map(value => value.toNumber()));
  }

  public getProjectMembers(projectId: number): Observable<number[]> {
    return this.getProjectMemberCount(projectId).pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total; i++) {
          this.assertTargetSet();
          requests.push(from(this.contract.getProjectMember(projectId, i)));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public getTaskMemberCount(taskId: number): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getTaskMemberCount(taskId)).pipe(map(value => value.toNumber()));
  }

  public getTaskLoggedTime(taskId: number): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getTaskLoggedTimeCount(taskId)).pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total.toNumber(); i++) {
          this.assertTargetSet();
          requests.push(from(this.contract.getTaskLoggedTime(taskId, i)));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data[1].toNumber()),
      reduce((acc, hour) => acc + hour, 0)
    );
  }

  public getTaskLoggedTimeOfProfile(taskId: number, profileId: number): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.getTaskLoggedTimeOfProfile(taskId, profileId)).pipe(
      map(bigNumber => bigNumber.toNumber()),
      catchError(() => of(0))
    );
  }

  public getTaskMembers(taskId: number): Observable<number[]> {
    return this.getTaskMemberCount(taskId).pipe(
      mergeMap(total => {
        const requests = [];
        this.assertTargetSet();
        for (let i = 0; i < total; i++) {
          requests.push(this.contract.getTaskMember(taskId, i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public isMember(profileId: number): Observable<boolean> {
    this.assertTargetSet();
    return from(this.contract.isMember(profileId));
  }

  public isTaskMember(taskId: number, profileId: number): Observable<boolean> {
    this.assertTargetSet();
    return from(this.contract.isTaskMember(taskId, profileId));
  }

  public isPendingMember(profileId: number): Observable<boolean> {
    this.assertTargetSet();
    return from(this.contract.isPendingMember(profileId));
  }
  public getTask(projectId: number, taskId: number): Observable<DataTypes.TaskViewStructOutput> {
    this.assertTargetSet();
    return from(this.contract['getTask(uint256,uint256)'](projectId, taskId));
  }

  public getTasks(projectId: number): Observable<DataTypes.TaskViewStructOutput[]> {
    this.assertTargetSet();
    return from(this.contract.getTaskCount(projectId)).pipe(
      mergeMap(count => {
        const total = count.toNumber();
        const requests = [];
        this.assertTargetSet();
        for (let i = 0; i < total; i++) {
          requests.push(this.getTask(projectId, i));
        }
        return forkJoin(requests);
      })
    );
  }

  public createTask(projectId: number, taskStruct: DataTypes.CreateTaskStruct): Observable<ethers.ContractTransaction> {
    this.assertTargetSet();
    return from(this.contract.createTask(projectId, taskStruct));
  }

  public updateTask(taskId: BigNumber, task: DataTypes.UpdateTaskStruct): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.updateTask(taskId, task)).pipe(switchMap(this.wait));
  }

  public createProject(projectStruct: DataTypes.CreateProjectStruct): Observable<ethers.ContractTransaction> {
    this.assertTargetSet();
    return from(this.contract.createProject(projectStruct));
  }

  public addProjectMember(projectId: number, profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.addProjectMember(projectId, profileId)).pipe(switchMap(this.wait));
  }

  public addTaskMember(taskId: number, profileId: number): Observable<ethers.ContractTransaction> {
    this.assertTargetSet();
    return from(this.contract.addTaskMember(taskId, profileId));
  }

  private wait(tx: ethers.ContractTransaction): Observable<ethers.ContractReceipt> {
    return from(tx.wait());
  }

  private assertTargetSet(): asserts this is { contract: Organization } {
    if (this.contract === undefined) throw new Error('Target address not set');
  }
}
