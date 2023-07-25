import { Observable } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Project, Task } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { OrganizationService } from '@shared/services/organization.service';

@Component({
  selector: 'app-log-hours',
  templateUrl: './log-hours.component.html',
  styleUrls: ['./log-hours.component.css'],
})
export class LogHoursComponent implements OnInit, OnDestroy {
  logHoursForm!: FormGroup;
  submitted = false;
  affiliations$!: Observable<{ project: Project; tasks: Task[] }[]>;
  constructor(
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar
  ) {}
  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();
  }
  reset() {
    this.submitted = false;
  }
  loadForm() {
    this.logHoursForm = this.formBuilder.group({
      task: ['', Validators.compose([Validators.required])],
      hours: ['', Validators.compose([Validators.required])],
    });
  }

  async onSubmit() {
    this.submitted = true;
    if (!this.logHoursForm.valid) return;
    const formValue = { ...this.logHoursForm.value };
    const hours = this.logHoursForm.value.hours;

    this.loadingService.show();
    this.organizationService.updateTaskTime(formValue.task.address, formValue.task.id, hours).subscribe({
      next: () => this.handleObservable('Hours logged!'),
      error: err => this.handleObservable('Failed log hours', err),
    });
  }

  public formError = (controlName: string, errorName: string) => {
    return this.logHoursForm.controls[controlName].hasError(errorName);
  };

  private handleObservable(message: string, err?: Error) {
    if (err) console.error(err);
    this.loadingService.hide();
    this.openSnack(message);
  }

  private openSnack(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }
}
