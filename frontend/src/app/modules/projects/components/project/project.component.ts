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
  status = Status.IN_PROGRESS;
  ngOnInit(): void {
    const tasks$ = new Observable<Task[]>();
    this.project$ = of({
      id: 1,
      name: 'My3Sec',
      description: 'Redefining career growth and project management',
      status: Status.IN_PROGRESS,
      hours: 128,
      tasks: of(), // Assuming a function that returns an Observable of tasks
      members: of([
        {
          id: '5',
          firstName: 'Ivan',
          surname: 'Zyrianoff',
          organization: 'ABC Company',
          role: 'Developer',
          profileImage: '../../../assets/images/ivan.jpg',
          walletAddress: '0x1234567890abcdef',
          regulationCheckbox: true,
        },
        {
          id: '4',
          firstName: 'Lorenzo',
          surname: 'Gigli',
          organization: 'ABC Company',
          role: 'Developer',
          profileImage: '../../../assets/images/gigli.jpg',
          walletAddress: '0x1234567890abcdef',
          regulationCheckbox: true,
        },
      ]),
      organization: 'VAIMEE',
      startDate: new Date('2022-10-01'),
      endDate: new Date('2023-08-31'),
      currentMonth: 9,
      durationInMonths: 12,
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
