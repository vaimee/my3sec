import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Status } from '@shared/enums';
import { Task } from '@shared/interfaces/project.interface';
import { OrganizationService } from '@shared/services/organization.service';
import { of } from 'rxjs';


@Component({
  selector: 'app-log-hours',
  templateUrl: './log-hours.component.html',
  styleUrls: ['./log-hours.component.css'],
})
export class LogHoursComponent implements OnInit, OnDestroy {
  logHoursForm!: FormGroup;
  submitted = false;
  tasks: Task[] = [];
  constructor(private formBuilder: FormBuilder) {}
  ngOnDestroy() {
    this.reset();
  }

  ngOnInit(): void {
    this.loadForm();
    const task: Task = {
      id: 1,
      name: 'Frontend Development',
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      organization: '0x7DA72c46E862BC5D08f74d7Db2fb85466ACE2997',
      hours: 10,
      status: Status.IN_PROGRESS,
      metadataURI: '',
      skills: of([
        {
          id: 0,
          name: 'HTML',
          category: 'Front-end',
          icon: 'html-icon',
          progress: 80,
        },
        {
          id: 1,
          name: 'CSS',
          category: 'Front-end',
          icon: 'css-icon',
          progress: 70,
        },
        {
          id: 2,
          name: 'JavaScript',
          category: 'Front-end',
          icon: 'js-icon',
          progress: 90,
        },
      ]),
      reviewer: 1,
      members: [2, 3, 4],
      start: new Date(),
      end: new Date(),
      currentMonth: 0,
      durationInMonths: 0
    };
    this.tasks = [task];
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
    console.log(formValue);
  }

  public formError = (controlName: string, errorName: string) => {
    return this.logHoursForm.controls[controlName].hasError(errorName);
  };
}
