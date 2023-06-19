import { environment } from 'environments/environment';
import { BigNumber, ethers, providers } from 'ethers';
import { Observable, concatMap, forkJoin, from, mergeMap, switchMap } from 'rxjs';

import { Injectable } from '@angular/core';

import { My3SecHub, Organization__factory } from '@vaimee/my3sec-contracts/dist';
import { DataTypes as HubTypes } from '@vaimee/my3sec-contracts/dist/contracts/My3SecHub';
import { DataTypes, Organization } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

import { My3secHubContractService } from './my3sec-hub-contract.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationContractService {
  private contract: Organization | undefined;

  constructor(private my3SecHub: My3secHubContractService) {}

  public setTarget(targetAddress: string): void {
    const provider = new ethers.providers.Web3Provider(window.ethereum as providers.ExternalProvider, 'any');

    const signer = provider.getSigner();

    this.contract = Organization__factory.connect(targetAddress, signer);
  }

  public get address(): string {
    this.assertTargetSet();
    return this.contract!.address;
  }

  public getMetadataURI(): Observable<string> {
    this.assertTargetSet();
    return from(this.contract!.getMetadataURI());
  }

  public join(profileId: BigNumber): Observable<unknown> {
    this.assertTargetSet();
    return from(this.contract!.join(profileId));
  }

  public leave(profileId: BigNumber): Observable<unknown> {
    this.assertTargetSet();
    return from(this.contract!.leave(profileId));
  }

  public rejectPendingMember(profileId: BigNumber): Observable<unknown> {
    this.assertTargetSet();
    return from(this.contract!.rejectPendingMember(profileId));
  }

  public approvePendingMember(profileId: BigNumber): Observable<unknown> {
    this.assertTargetSet();
    return from(this.contract!.approvePendingMember(profileId));
  }

  /* TODO:
    public getManagers(): Observable<HubTypes.ProfileViewStructOutput[]> {
      this.assertTargetSet();
      return undefined;
    }*/
  public getProjects(): Observable<DataTypes.ProjectViewStructOutput[]> {
    this.assertTargetSet();
    return from(this.contract!.getProjectCount()).pipe(
      mergeMap(count => {
        const total = count.toNumber();
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.contract!.getProject(i));
        }
        return forkJoin(requests);
      })
    );
  }

  public updateProject(projectId: BigNumber, project: DataTypes.UpdateProjectStruct): Observable<unknown> {
    this.assertTargetSet();
    return from(this.contract!.updateProject(projectId, project));
  }

  /*TODO:
  public getMembers(): Observable<HubTypes.ProfileViewStructOutput[]> {
    this.assertTargetSet();
    return from(this.contract!.getMemberCount()).pipe(
      mergeMap(count => {
        const total = count.toNumber();
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.contract!.getProjectMember(i));
        }
        return forkJoin(requests);
      })
    }
    );*/

  /*TODO:
  public getPendingMembers(): Observable<HubTypes.ProfileViewStructOutput[]> {
    this.assertTargetSet();
    return from(this.contract!.getMemberCount()).pipe(
      mergeMap(count => {
        const total = count.toNumber();
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.contract!.getProjectMember(i));
        }
        return forkJoin(requests);
      })
    }
    );
  */

  public getTasks(projectId: number): Observable<DataTypes.TaskViewStructOutput[]> {
    this.assertTargetSet();
    return from(this.contract!.getTaskCount(projectId)).pipe(
      mergeMap(count => {
        const total = count.toNumber();
        const requests = [];
        for (let i = 0; i < total; i++) {
          requests.push(this.contract!['getTask(uint256,uint256)'](projectId, i));
        }
        return forkJoin(requests);
      })
    );
  }

  public updateTask(taskId: BigNumber, task: DataTypes.UpdateTaskStruct): Observable<unknown> {
    this.assertTargetSet();
    return from(this.contract!.updateTask(taskId, task));
  }

  private assertTargetSet(): void {
    if (!this.contract) throw new Error('Target address not set');
  }
}
