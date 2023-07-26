import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-kpi-evaluation',
  templateUrl: './kpi-evaluation.component.html',
  styleUrls: ['./kpi-evaluation.component.css'],
})
export class KpiEvaluationComponent {
  changed = false;
  selectedOption = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public taskData: { closeTaskStruct: DataTypes.UpdateTaskStruct; id: number; organizationAddress: string },
    public dialogRef: MatDialogRef<TaskComponent>,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}

  public onSubmit() {
    if (this.selectedOption === '') return this.openSnack('Please select an satisfaction level');

    this.loadingService.show();
    this.organizationService
      .updateTask(this.taskData.id, this.taskData.closeTaskStruct, this.taskData.organizationAddress)
      .subscribe({
        next: () => this.handleObservable('Task updated!'),
        error: err => this.handleObservable('failed to update task', err),
      });
  }

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
