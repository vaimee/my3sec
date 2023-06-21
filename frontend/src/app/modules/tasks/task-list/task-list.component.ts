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
        'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      organization: '',
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
      durationInMonths: 0,
    };
    this.tasks = of([task]);
  }

  goTo(id: number): void {
    this.router.navigate([`/tasks/${id}`]);
  }
}
