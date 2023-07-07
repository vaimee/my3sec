import { Observable, of } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Status } from '@shared/enums';
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
    this.affiliations$ = of([
      {
        project: {
          id: 1,
          name: 'Project A',
          description: 'This is Project A description',
          headline: 'Project A Headline',
          status: Status.IN_PROGRESS,
          hours: 100,
          tasks: of([]),
          members: of([]),
          organization: 'Organization 1',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2023-12-31'),
          currentMonth: 6,
          durationInMonths: 7,
          start: '',
          end: '',
        },
        tasks: [
          {
            id: 1,
            name: 'Task 1',
            description: 'This is Task 2 description',
            status: Status.COMPLETED,
            hours$: of(20),
            organization: 'Organization 2',
            start: new Date('2023-08-01'),
            end: new Date('2023-08-15'),
            currentMonth: 8,
            durationInMonths: 1,
            skills$: of([
              { id: 3, name: 'Python', category: 'Backend Development' },
              { id: 4, name: 'HTML', category: 'Frontend Development' },
            ]),
            members$: of([]),
            metadataURI: '',
          },
          {
            id: 2,
            metadataURI: '',
            name: 'Task 2',
            description: 'This is Task 2 description',
            status: Status.COMPLETED,
            hours$: of(20),
            organization: 'Organization 2',
            start: new Date('2023-08-01'),
            end: new Date('2023-08-15'),
            currentMonth: 8,
            durationInMonths: 1,
            skills$: of([
              { id: 3, name: 'Python', category: 'Backend Development' },
              { id: 4, name: 'HTML', category: 'Frontend Development' },
            ]),
            members$: of([]),
          },
        ],
      },
      {
        project: {
          id: 2,
          name: 'Project B',
          description: 'This is Project A description',
          headline: 'Project A Headline',
          status: Status.IN_PROGRESS,
          hours: 100,
          tasks: of([]),
          members: of([]),
          organization: 'Organization 1',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2023-12-31'),
          currentMonth: 6,
          durationInMonths: 7,
          start: '',
          end: '',
        },
        tasks: [
          {
            id: 3,
            name: 'Task 3',
            description: 'This is Task 2 description',
            status: Status.COMPLETED,
            hours$: of(20),
            organization: 'Organization 2',
            start: new Date('2023-08-01'),
            end: new Date('2023-08-15'),
            currentMonth: 8,
            durationInMonths: 1,
            skills$: of([
              { id: 3, name: 'Python', category: 'Backend Development' },
              { id: 4, name: 'HTML', category: 'Frontend Development' },
            ]),
            members$: of([]),
            metadataURI: '',
          },
          {
            id: 4,
            metadataURI: '',
            name: 'Task 4',
            description: 'This is Task 2 description',
            status: Status.COMPLETED,
            hours$: of(20),
            organization: 'Organization 2',
            start: new Date('2023-08-01'),
            end: new Date('2023-08-15'),
            currentMonth: 8,
            durationInMonths: 1,
            skills$: of([
              { id: 3, name: 'Python', category: 'Backend Development' },
              { id: 4, name: 'HTML', category: 'Frontend Development' },
            ]),
            members$: of([]),
          },
        ],
      },
    ]); //this.organizationService.getCurrentUserAffiliations();
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
