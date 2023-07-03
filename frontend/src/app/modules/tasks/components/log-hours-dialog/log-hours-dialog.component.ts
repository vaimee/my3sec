import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

import { LogHoursInput } from '../../interfaces';
import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-log-hours-dialog',
  templateUrl: './log-hours-dialog.component.html',
  styleUrls: ['./log-hours-dialog.component.css'],
})
export class LogHoursDialogComponent implements OnInit {
  logHoursForm!: FormGroup;
  changed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LogHoursInput,
    public dialogRef: MatDialogRef<TaskComponent>,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.loadForm();
  }

  public loadForm() {
    this.logHoursForm = this.formBuilder.group({
      hours: ['', Validators.compose([Validators.required])],
    });
  }

  public onSubmit() {
    this.logHoursForm.markAllAsTouched();
    if (!this.logHoursForm.valid) return;
    const hours = this.logHoursForm.value.hours;
    this.loadingService.show();
    this.organizationService.updateTaskTime(this.data.address, this.data.id, hours).subscribe({
      next: () => this.handleObservable('Hours logged!'),
      error: err => this.handleObservable('Failed log hours', err),
    });
    console.log('submit');
  }

  public formError = (controlName: string, errorName: string) => {
    return this.logHoursForm.controls[controlName].hasError(errorName);
  };

  private handleObservable(message: string, err?: Error) {
    if (err) console.error(err);
    this.loadingService.hide();
    this.openSnack(message);
    this.dialogRef.close(true);
  }

  private openSnack(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }
}
