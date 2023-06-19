import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TaskStatus } from '../enums';
import { Task } from '../interfaces';

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

    const org = {
      address: '0x7DA72c46E862BC5D08f74d7Db2fb85466ACE2997',
      name: 'VAIMEE',
      description:
        'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'https://picsum.photos/200/',
      projectsCount: 5,
      membersCount: 10,
    };
    const project = {
      name: 'My3Sec',
      status: 'In Progress',
      description: 'Lorem ipsum dolor sit amet',
      hours: 120,
      tasks: ['Task 1', 'Task 2', 'Task 3'],
      organization: 'ABC Company',
      currentMonth: 6,
      durationInMonths: 12,
    };
    const task: Task = {
      id: 1,
      name: 'Frontend Development',
      description:
        'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      organization: org,
      project: project,
      hours: 10,
      feedback: 0,
      status: TaskStatus.IN_PROGRESS,
      skills: [
        {
          name: 'HTML',
          category: 'Front-end',
          icon: 'html-icon',
          progress: 80,
        },
        {
          name: 'CSS',
          category: 'Front-end',
          icon: 'css-icon',
          progress: 70,
        },
        {
          name: 'JavaScript',
          category: 'Front-end',
          icon: 'js-icon',
          progress: 90,
        },
      ],
      reviewer: 1,
      members: [2, 3, 4],
      creationDate: new Date(),
      deadline: new Date(),
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
