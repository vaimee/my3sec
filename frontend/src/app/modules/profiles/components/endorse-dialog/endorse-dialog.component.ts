import { Observable, switchMap } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EnergyWalletContractService } from '@shared/services/energy-wallet-contract.service';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { ProfileService } from '@shared/services/profile.service';

import { EndorseDialogInterface } from '@profiles/interfaces';

import { ProfileBodyComponent } from '../profile-body/profile-body.component';

@Component({
  selector: 'app-endorse-dialog',
  templateUrl: './endorse-dialog.component.html',
  styleUrls: ['./endorse-dialog.component.css'],
})
export class EndorseDialogComponent implements OnInit {
  currentEndorsing$!: Observable<number>;
  targetEnergyToEndorse = 0;
  maxEnergy!: number;

  constructor(
    public dialogRef: MatDialogRef<ProfileBodyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EndorseDialogInterface,
    private my3secHubContractService: My3secHubContractService,
    private profileService: ProfileService,
    private loadingService: LoadingService,
    private energyWallet: EnergyWalletContractService
  ) {}

  ngOnInit(): void {
    this.currentEndorsing$ = this.profileService.getEnergyEndorsedTo(this.data.endorserId, this.data.endorsingId);
    this.currentEndorsing$
      .pipe(
        switchMap(value => {
          this.targetEnergyToEndorse = value;
          return this.energyWallet.freeEnergyOf(this.data.endorserId);
        })
      )
      .subscribe(value => {
        this.maxEnergy = this.targetEnergyToEndorse + value;
      });
  }

  change(value: number): void {
    this.targetEnergyToEndorse = value;
  }

  showText(currentEndorsing: number): string {
    if (currentEndorsing === 0) return `You are not endorsing ${this.data.firstName} ${this.data.surname}.`;
    return `You are endorsing ${this.data.firstName} ${this.data.surname} with ${currentEndorsing} energy.`;
  }

  endorse(currentEndorsing: number): void {
    const valueToEndorse = this.targetEnergyToEndorse - currentEndorsing;
    if (valueToEndorse === 0) return;
    const energyTransaction$ =
      valueToEndorse > 0
        ? this.my3secHubContractService.giveEnergyTo(this.data.endorsingId, valueToEndorse)
        : this.my3secHubContractService.removeEnergyFrom(this.data.endorsingId, -valueToEndorse);
    this.loadingService.show();

    energyTransaction$.subscribe({
      next: () => this.handleObservable(),
      error: err => this.handleObservable(err),
    });
  }

  private handleObservable(err?: Error) {
    if (err) console.error(err);
    this.loadingService.hide();
    this.dialogRef.close(true);
  }
}
