import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';

import { Status } from '@shared/enums';
import { ProfileMetadata } from '@shared/interfaces';
import { Project, Task } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit {
  project$!: Observable<Project>;
  members$!: Observable<ProfileMetadata[]>;

  ngOnInit(): void {
    const tasks$ = new Observable<Task[]>();

    this.project$ = of({
      id: 1,
      startDate: new Date('2023-06-10'),
      endDate: new Date('2023-06-27'),
      name: 'Project 1',
      status: Status.IN_PROGRESS,
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'https://picsum.photos/200/',
      hours: 5,
      tasks: tasks$,
      members: of([]),
      organization: '',
      currentMonth: 5,
      durationInMonths: 10,
    });

    this.members$ = of([
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
      {
        firstName: 'John',
        surname: 'Doe',
        organization: 'VAIMEE',
        role: 'idk',
        profileImage: 'https://picsum.photos/200/',
        regulationCheckbox: true,
      },
    ]);
  }
}
