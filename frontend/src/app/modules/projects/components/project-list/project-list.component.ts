import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';

import { Project } from '../../interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  projects$!: Observable<Project[]>;

  ngOnInit(): void {
    this.projects$ = of([
      {
        name: 'Project 1',
        status: 'ACTIVE',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        image: 'https://picsum.photos/200/',
        hours: 5,
        tasks: [],
        organization: '',
        currentMonth: 5,
        durationInMonths: 10,
      },
      {
        name: 'Project 2',
        status: 'ACTIVE',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        image: 'https://picsum.photos/200/',
        hours: 7,
        tasks: [],
        organization: '',
        currentMonth: 2,
        durationInMonths: 8,
      },
    ]);
  }
}
