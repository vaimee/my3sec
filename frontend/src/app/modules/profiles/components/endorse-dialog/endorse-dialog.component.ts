import { Observable } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

  constructor(
    public dialogRef: MatDialogRef<ProfileBodyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EndorseDialogInterface,
    private my3secHubContractService: My3secHubContractService,
    private profileService: ProfileService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.currentEndorsing$ = this.profileService.getEnergyEndorsedTo(this.data.endorserId, this.data.endorsingId);
    this.currentEndorsing$.subscribe(value => {
      this.targetEnergyToEndorse = value;
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
    this.loadingService.show();
    const energyTransaction$ =
      valueToEndorse > 0
        ? this.my3secHubContractService.giveEnergyBlocking(this.data.endorsingId, valueToEndorse)
        : this.my3secHubContractService.removeEnergyBlocking(this.data.endorsingId, -valueToEndorse);
    energyTransaction$.subscribe(() => {
      this.loadingService.hide();
      this.dialogRef.close(true);
    });
  }
}
