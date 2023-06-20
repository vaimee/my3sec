import { Observable, of } from 'rxjs';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Status } from '@shared/enums';
import { Profile } from '@shared/interfaces';
import { ProfileService } from '@shared/services/profile.service';

import { Task } from '../interfaces';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent {
  task$: Observable<Task>;
  showReward = true;
  showCloseTask = true;
  reviewer$: Observable<Profile> = of({
    id: '123',
    firstName: 'John',
    surname: 'Doe',
    organization: 'ABC Company',
    role: 'Developer',
    profileImage: 'https://picsum.photos/200/',
    walletAddress: '0x1234567890abcdef',
    regulationCheckbox: true,
  });
  members$: Observable<Profile[]> = of([
    {
      id: '4',
      firstName: 'Lorenzo',
      surname: 'Gigli',
      organization: 'ABC Company',
      role: 'Developer',
      profileImage: 'https://picsum.photos/200/',
      walletAddress: '0x1234567890abcdef',
      regulationCheckbox: true,
    },
    {
      id: '5',
      firstName: 'Ivan',
      surname: 'Zyrianoff',
      organization: 'ABC Company',
      role: 'Developer',
      profileImage: 'https://picsum.photos/200/',
      walletAddress: '0x1234567890abcdef',
      regulationCheckbox: true,
    },
  ]);
  constructor(private router: Router, private profileService: ProfileService) {
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
      description: `
      In this task, you will be working on enhancing the user interface (UI) of a web application. The goal is to improve the overall user experience and make the interface more visually appealing.

      #### 1. Implement Responsive Design
      
      - Utilize **media queries** to create a responsive layout that adapts to different screen sizes.
      - Ensure that the web application is mobile-friendly and displays correctly on various devices.
      
      #### 2. Apply Styling and Theming
      
      - Use **CSS** to style the components and elements of the web application.
      - Apply a consistent **color scheme** and **typography** throughout the application.
      - Enhance the user interface with **transitions** and **animations** to provide a smooth user experience.
      ### Task Deliverables

      1. Updated HTML, CSS, and JavaScript files with the implemented changes.
      2. A visually enhanced web application that meets the requirements specified above.
`,
      organization: org,
      project: project,
      hours: 10,
      feedback: 0,
      status: Status.IN_PROGRESS,
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
      creationDate: new Date(2023, 5, 10),
      deadline: new Date(2023, 5, 27),
      reviewer: 1,
      members: [2, 3, 4],
    };
    this.task$ = of(task);
  }

  goTo(id: string) {
    this.router.navigate(['/profiles', id]);
  }
}
