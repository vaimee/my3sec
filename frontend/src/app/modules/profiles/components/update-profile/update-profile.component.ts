import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Profile } from '@shared/interfaces';

import { ProfileBodyComponent } from '../profile-body/profile-body.component';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css'],
})
export class UpdateProfileComponent {
  constructor(public dialogRef: MatDialogRef<ProfileBodyComponent>, @Inject(MAT_DIALOG_DATA) public profile: Profile) {}

  public profileUpdated() {
    this.dialogRef.close(true);
  }
}
