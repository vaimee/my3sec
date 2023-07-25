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
  protected signer: ethers.providers.JsonRpcSigner;

  constructor() {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');
    this.signer = provider.getSigner();
  }

  public setContract(targetAddress: string): Organization {
    return Organization__factory.connect(targetAddress, this.signer);
  }

  public getMetadataURI(address: string): Observable<string> {
    const contract = this.setContract(address);
    return from(contract.getMetadataURI());
  }

  public join(profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.join(profileId)).pipe(switchMap(this.wait));
  }

  public leave(profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.leave(profileId)).pipe(switchMap(this.wait));
  }

  public rejectPendingMember(profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.rejectPendingMember(profileId)).pipe(switchMap(this.wait));
  }

  public approvePendingMember(profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.approvePendingMember(profileId)).pipe(switchMap(this.wait));
  }

  public removeProjectMember(
    projectId: number,
    profileId: number,
    address: string
  ): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.removeProjectMember(projectId, profileId)).pipe(switchMap(this.wait));
  }

  public removeTaskMember(taskId: number, profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.removeTaskMember(taskId, profileId)).pipe(switchMap(this.wait));
  }

  public promoteToManager(memberAccount: string, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.addToWhitelist(memberAccount)).pipe(switchMap(this.wait));
  }

  public getOwner(address: string): Observable<string> {
    const contract = this.setContract(address);
    return from(contract.owner());
  }

  public isOwner(walletAddress: string, address: string): Observable<boolean> {
    return from(this.getOwner(address)).pipe(map(ownerAddress => ownerAddress === walletAddress));
  }

  public isManager(walletAddress: string, address: string) {
    const contract = this.setContract(address);
    return from(contract.isWhitelisted(walletAddress));
  }

  public getProjectCount(address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getProjectCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getProject(projectId: number, address: string): Observable<DataTypes.ProjectViewStructOutput> {
    const contract = this.setContract(address);
    return from(contract.getProject(projectId)).pipe(
      catchError(() => {
        throw new Error('Error getting project: ' + projectId + ' ' + contract.address);
      })
    );
  }

  public isProjectMember(projectId: number, profileId: number, address: string): Observable<boolean> {
    const contract = this.setContract(address);
    return from(contract.isProjectMember(projectId, profileId));
  }

  public getProjects(address: string): Observable<DataTypes.ProjectViewStructOutput[]> {
    return from(this.getProjectCount(address)).pipe(
      mergeMap(total => {
        if (total === 0) return of([]);
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.getProject(i, address));
        }
        return forkJoin(requests);
      })
    );
  }

  public updateProject(
    projectId: BigNumber,
    project: DataTypes.UpdateProjectStruct,
    address: string
  ): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.updateProject(projectId, project)).pipe(switchMap(this.wait));
  }

  public getMemberCount(address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getMemberCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getMembers(address: string): Observable<number[]> {
    return from(this.getMemberCount(address)).pipe(
      mergeMap(count => {
        const requests = [];
        const contract = this.setContract(address);
        for (let i = 0; i < count; i++) {
          requests.push(contract.getMember(i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public getManagersCount(address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getWhitelistCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getManagers(address: string): Observable<string[]> {
    return from(this.getManagersCount(address)).pipe(
      mergeMap(count => {
        const requests = [];
        const contract = this.setContract(address);
        for (let i = 0; i < count; i++) {
          requests.push(contract.getWhitelistMember(i));
        }
        return forkJoin(requests);
      })
    );
  }

  public getPendingMemberCount(address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getPendingMemberCount()).pipe(map(bigNumber => bigNumber.toNumber()));
  }

  public getPendingMembers(address: string): Observable<number[]> {
    return from(this.getPendingMemberCount(address)).pipe(
      mergeMap(count => {
        const requests: Observable<ethers.BigNumber>[] = [];
        const contract = this.setContract(address);
        for (let i = 0; i < count; i++) {
          requests.push(from(contract.getPendingMember(i)));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public getProjectMemberCount(projectId: number, address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getProjectMemberCount(projectId)).pipe(map(value => value.toNumber()));
  }

  public getProjectMembers(projectId: number, address: string): Observable<number[]> {
    return this.getProjectMemberCount(projectId, address).pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total; i++) {
          const contract = this.setContract(address);
          requests.push(from(contract.getProjectMember(projectId, i)));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public getTaskMemberCount(taskId: number, address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getTaskMemberCount(taskId)).pipe(map(value => value.toNumber()));
  }

  public getTaskLoggedTime(taskId: number, address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getTaskLoggedTimeCount(taskId)).pipe(
      mergeMap(total => {
        const requests = [];
        for (let i = 0; i < total.toNumber(); i++) {
          requests.push(from(contract.getTaskLoggedTime(taskId, i)));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data[1].toNumber()),
      reduce((acc, hour) => acc + hour, 0)
    );
  }

  public getTaskLoggedTimeOfProfile(taskId: number, profileId: number, address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.getTaskLoggedTimeOfProfile(taskId, profileId)).pipe(
      map(bigNumber => bigNumber.toNumber()),
      //if an user did not logged time, it throws an error instead of returning zero
      catchError(() => of(0))
    );
  }

  public updateTaskTime(
    taskId: number,
    profileId: number,
    hours: number,
    address: string
  ): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.updateTaskTime(taskId, profileId, hours)).pipe(switchMap(this.wait));
  }

  public getTaskMembers(taskId: number, address: string): Observable<number[]> {
    return this.getTaskMemberCount(taskId, address).pipe(
      mergeMap(total => {
        const requests = [];
        const contract = this.setContract(address);
        for (let i = 0; i < total; i++) {
          requests.push(contract.getTaskMember(taskId, i));
        }
        return forkJoin(requests);
      }),
      concatMap(data => data),
      map(data => data.toNumber()),
      toArray()
    );
  }

  public isMember(profileId: number, address: string): Observable<boolean> {
    const contract = this.setContract(address);
    return from(contract.isMember(profileId));
  }

  public isTaskMember(taskId: number, profileId: number, address: string): Observable<boolean> {
    const contract = this.setContract(address);
    return from(contract.isTaskMember(taskId, profileId));
  }

  public isPendingMember(profileId: number, address: string): Observable<boolean> {
    const contract = this.setContract(address);
    return from(contract.isPendingMember(profileId));
  }
  public getTask(projectId: number, taskId: number, address: string): Observable<DataTypes.TaskViewStructOutput> {
    const contract = this.setContract(address);
    return from(contract['getTask(uint256,uint256)'](projectId, taskId));
  }

  public getTaskById(taskId: number, address: string): Observable<DataTypes.TaskViewStructOutput> {
    const contract = this.setContract(address);
    return from(contract['getTask(uint256)'](taskId));
  }

  public getTasks(projectId: number, address: string): Observable<DataTypes.TaskViewStructOutput[]> {
    const contract = this.setContract(address);
    return from(contract.getTaskCount(projectId)).pipe(
      mergeMap(count => {
        const total = count.toNumber();
        const requests: Observable<DataTypes.TaskViewStructOutput>[] = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.getTask(projectId, i, address));
        }
        return forkJoin(requests);
      })
    );
  }

  public createTask(projectId: number, taskStruct: DataTypes.CreateTaskStruct, address: string): Observable<number> {
    const hexValue = ethers.utils.hexValue(projectId);
    const contract = this.setContract(address);
    return from(contract.createTask(ethers.BigNumber.from(hexValue), taskStruct)).pipe(
      switchMap(this.wait),
      map(receipt => {
        const event = this.findEvent(receipt, 'TaskCreated');
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.args?.['taskId'].toNumber();
      })
    );
  }

  public updateTask(
    taskId: BigNumber,
    task: DataTypes.UpdateTaskStruct,
    address: string
  ): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.updateTask(taskId, task)).pipe(switchMap(this.wait));
  }

  public createProject(projectStruct: DataTypes.CreateProjectStruct, address: string): Observable<number> {
    const contract = this.setContract(address);
    return from(contract.createProject(projectStruct)).pipe(
      switchMap(this.wait),
      map(receipt => {
        const event = this.findEvent(receipt, 'ProjectCreated');
        if (!event) {
          throw new Error('Event not found in transaction receipt');
        }
        return event.args?.['projectId'].toNumber();
      })
    );
  }

  public addProjectMember(projectId: number, profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.addProjectMember(projectId, profileId)).pipe(switchMap(this.wait));
  }

  public addTaskMember(taskId: number, profileId: number, address: string): Observable<ethers.ContractReceipt> {
    const contract = this.setContract(address);
    return from(contract.addTaskMember(taskId, profileId)).pipe(switchMap(this.wait));
  }

  private wait(tx: ethers.ContractTransaction): Observable<ethers.ContractReceipt> {
    return from(tx.wait());
  }

  private findEvent(receipt: ethers.ContractReceipt, name: string, emitterAddress?: string) {
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
