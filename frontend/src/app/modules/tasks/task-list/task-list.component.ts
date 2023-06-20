import { Observable, of } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Status } from '@shared/enums';

import { Organization } from '@organizations/interfaces';
import { Project } from '@profiles/interfaces';

import { Task } from '../interfaces';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  @Input() tasks!: Observable<Task[]>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const org: Organization = {
      address: '0x7DA72c46E862BC5D08f74d7Db2fb85466ACE2997',
      name: 'VAIMEE',
      description:
        'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'https://picsum.photos/200/',
      projectsCount: 5,
      membersCount: 10,
    };
    const project: Project = {
      name: 'My3Sec',
      status: 'In Progress',
      description: 'Lorem ipsum dolor sit amet',
      hours: 120,
      tasks: of([]),
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
      hours: 10,
      feedback: 0,
      status: Status.COMPLETED,
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
    this.tasks = of([task]);
  }

  goTo(id: number): void {
    this.router.navigate([`/tasks/${id}`]);
  }
}
