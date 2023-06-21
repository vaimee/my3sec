import { Observable, of } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Status } from '@shared/enums';
import { Task } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  @Input() tasks!: Observable<Task[]>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const task: Task = {
      id: 1,
      name: 'Frontend Development',
      description:
        'Develop a web interface-based UI to explore My3Sec features implemented in the blockchain',
      organization: '',
      hours: 58,
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
      members: [2, 3],
      start: new Date(),
      end: new Date(),
      currentMonth: 0,
      durationInMonths: 0,
    };
    const task2: Task = {
      id: 2,
      name: 'Backend Development',
      description:
        'Develop in solidity the contract logic to support user skill growth and project management features',
      organization: '',
      hours: 80,
      status: Status.COMPLETED,
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
      members: [2],
      start: new Date(),
      end: new Date(),
      currentMonth: 0,
      durationInMonths: 0,
    };
    this.tasks = of([task, task2]);
  }

  goTo(id: number): void {
    this.router.navigate([`/tasks/${id}`]);
  }
}
