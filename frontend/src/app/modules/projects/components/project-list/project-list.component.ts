import { Observable, of } from 'rxjs';

import { Component, Input } from '@angular/core';

import { Status } from '@shared/enums';
import { Project } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent {
  @Input() projects$!: Observable<Project[]>;
  @Input() showOrganization = false;
  projects: Project[];
  managers = [
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
  ];

  constructor() {
    this.projects = [
      {
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
        ]), // Assuming a function that returns an Observable of members
        organization: 'VAIMEE',
        startDate: new Date('2022-10-01'),
        endDate: new Date('2023-08-31'),
        currentMonth: 9,
        durationInMonths: 12,
      },
      {
        id: 1,
        name: 'DESMO-LD',
        description: 'Enabling an IoT Global Market through blockchain',
        status: Status.COMPLETED,
        hours: 184,
        tasks: of(), // Assuming a function that returns an Observable of tasks
        members: of([
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
          {
            id: '5',
            firstName: 'Ivan',
            surname: 'Zyrianoff',
            organization: 'ABC Company',
            role: 'Developer',
            profileImage: '../../../assets/images/greg.jpg',
            walletAddress: '0x1234567890abcdef',
            regulationCheckbox: true,
          },
        ]), // Assuming a function that returns an Observable of members
        organization: 'VAIMEE',
        startDate: new Date('2022-10-01'),
        endDate: new Date('2022-12-31'),
        currentMonth: 12,
        durationInMonths: 12,
      },
    ];
  }
}
