import { Observable } from 'rxjs';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ProfileService } from '@shared/services/profile.service';

import { EndorserItem } from '@profiles/interfaces';

import { ProfileBodyComponent } from '../profile-body/profile-body.component';

@Component({
  selector: 'app-endorsers-list',
  templateUrl: './endorsers-list.component.html',
  styleUrls: ['./endorsers-list.component.css'],
})
export class EndorsersListComponent implements OnInit {
  public isEndorser: boolean;
  public endorsers!: Observable<EndorserItem[]>;
  public id: number;

  constructor(
    public dialogRef: MatDialogRef<ProfileBodyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; isEndorser: boolean },
    private profileService: ProfileService
  ) {
    this.id = data.id as number;
    this.isEndorser = data.isEndorser;
  }
  ngOnInit() {
    this.endorsers = this.isEndorser
      ? this.profileService.getEndorsers(this.id)
      : this.profileService.getEndorsing(this.id);
  }
  goTo(profileId: number): void {
    this.dialogRef.close(profileId);
  }
}
