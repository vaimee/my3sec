import { BigNumber, ethers, providers } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { Observable, catchError, concatMap, forkJoin, from, map, mergeMap, of, reduce, switchMap, toArray } from 'rxjs';

import { Injectable } from '@angular/core';

import { Events__factory, Organization__factory } from '@vaimee/my3sec-contracts/dist';
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

  public removeTaskMember(taskId: number, profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.removeTaskMember(taskId, profileId)).pipe(switchMap(this.wait));
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
    return from(this.contract.getProject(projectId)).pipe(
      catchError(() => {
        throw new Error('Mio error' + projectId + ' ' + this.contract!.address);
      })
    );
  }

  public isProjectMember(projectId: number, profileId: number): Observable<boolean> {
    this.assertTargetSet();
    return from(this.contract.isProjectMember(projectId, profileId));
  }

  public getProjects(): Observable<DataTypes.ProjectViewStructOutput[]> {
    return from(this.getProjectCount()).pipe(
      mergeMap(total => {
        if (total === 0) return of([]);
        const requests = [];
        console.log('requesting for', this.contract!.address);

        for (let i = 0; i < total; i++) {
          requests.push(this.getProject(i));
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
      })
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
      //if an user did not logged time, it throws an error instead of returning zero
      catchError(() => of(0))
    );
  }

  public updateTaskTime(taskId: number, profileId: number, hours: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.updateTaskTime(taskId, profileId, hours)).pipe(switchMap(this.wait));
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
        const requests: Observable<DataTypes.TaskViewStructOutput>[] = [];
        this.assertTargetSet();
        for (let i = 0; i < total; i++) {
          requests.push(this.getTask(projectId, i));
        }
        return forkJoin(requests);
      })
    );
  }

  public createTask(projectId: number, taskStruct: DataTypes.CreateTaskStruct): Observable<number> {
    const hexValue = ethers.utils.hexValue(projectId);
    this.assertTargetSet();
    return from(this.contract.createTask(ethers.BigNumber.from(hexValue), taskStruct)).pipe(
      switchMap(this.wait),
      map(receipt => {
        this.assertTargetSet();
        const event = this.findEvent(receipt, 'TaskCreated');
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.args?.['taskId'].toNumber();
      })
    );
  }

  public updateTask(taskId: BigNumber, task: DataTypes.UpdateTaskStruct): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.updateTask(taskId, task)).pipe(switchMap(this.wait));
  }

  public createProject(projectStruct: DataTypes.CreateProjectStruct): Observable<number> {
    this.assertTargetSet();
    return from(this.contract.createProject(projectStruct)).pipe(
      switchMap(this.wait),
      map(receipt => {
        this.assertTargetSet();
        const event = this.findEvent(receipt, 'ProjectCreated');
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.args?.['projectId'].toNumber();
      })
    );
  }

  public addProjectMember(projectId: number, profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.addProjectMember(projectId, profileId)).pipe(switchMap(this.wait));
  }

  public addTaskMember(taskId: number, profileId: number): Observable<ethers.ContractReceipt> {
    this.assertTargetSet();
    return from(this.contract.addTaskMember(taskId, profileId)).pipe(switchMap(this.wait));
  }

  private wait(tx: ethers.ContractTransaction): Observable<ethers.ContractReceipt> {
    return from(tx.wait());
  }

  private assertTargetSet(): asserts this is { contract: Organization } {
    if (this.contract === undefined) throw new Error('Target address not set');
  }

  private findEvent(receipt: ethers.ContractReceipt, name: string, emitterAddress?: string) {
    this.assertTargetSet();
    const contractInterface = Events__factory.createInterface();

    const events = receipt.logs;

    if (events != undefined) {
      // match name from list of events in eventContract, when found, compute the sigHash
      let sigHash: string | undefined;
      for (const contractEvent of Object.keys(contractInterface.events)) {
        if (contractEvent.startsWith(name) && contractEvent.charAt(name.length) == '(') {
          sigHash = keccak256(toUtf8Bytes(contractEvent));
          break;
        }
      }
      // Throw if the sigHash was not found
      if (!sigHash) {
        throw Error(
          `Event "${name}" not found in provided contract (default: Events library). \nAre you sure you're using the right contract?`
        );
      }

      for (const emittedEvent of events) {
        // If we find one with the correct sighash, check if it is the one we're looking for
        if (emittedEvent.topics[0] == sigHash) {
          // If an emitter address is passed, validate that this is indeed the correct emitter, if not, continue
          if (emitterAddress) {
            if (emittedEvent.address != emitterAddress) continue;
          }
          const event = contractInterface.parseLog(emittedEvent);
          return event;
        }
      }
      // Throw if the event args were not expected or the event was not found in the logs
      throw Error(`Event "${name}" not found emitted by "${emitterAddress}" in given transaction log`);
    } else {
      throw Error('No events were emitted');
    }
  }
}
