import { Observable } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { ProfileService } from '@shared/services/profile.service';

import { EndorseDialogInterface } from '@profiles/interfaces';

@Component({
  selector: 'app-endorse-dialog',
  templateUrl: './endorse-dialog.component.html',
  styleUrls: ['./endorse-dialog.component.css'],
})
export class EndorseDialogComponent implements OnInit {
  currentEndorsing$!: Observable<number>;
  targetEnergyToEndorse: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EndorseDialogInterface,
    private my3secHubContractService: My3secHubContractService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.currentEndorsing$ = this.profileService.getEnergyEndorsedTo(this.data.endorsingId, this.data.endorsedId);
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
    if (valueToEndorse > 0)
      this.my3secHubContractService.giveEnergyTo(this.data.endorsingId, this.targetEnergyToEndorse);
    else this.my3secHubContractService.removeEnergyFrom(this.data.endorsingId, valueToEndorse);
  }
}
