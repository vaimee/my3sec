import { Observable, of } from 'rxjs';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Status } from '@shared/enums';
import { Profile } from '@shared/interfaces';
import { Task } from '@shared/interfaces/project.interface';
import { LoadingService } from '@shared/services/loading.service';
import { My3secHubContractService } from '@shared/services/my3sec-hub-contract.service';
import { OrganizationService } from '@shared/services/organization.service';

import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';
import { Skill } from '@profiles/interfaces';

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
  constructor(
    private router: Router,
    private my3secHub: My3secHubContractService,
    private organizationService: OrganizationService,
    private loadingService: LoadingService
  ) {

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
      organization: '',
      hours: 10,
      status: Status.IN_PROGRESS,
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
      start: new Date(2023, 5, 10),
      end: new Date(2023, 5, 27),
      reviewer: 1,
      members: [2, 3, 4],
      metadataURI: '',
      currentMonth: 0,
      durationInMonths: 0
    };
    this.task$ = of(task);
  }

  goTo(id: string) {
    this.router.navigate(['/profiles', id]);
  }

  getReward(id: number) {
    //TODO: get org address
    this.loadingService.show();
    this.my3secHub.withdrawExperienceBlocking('', `${id}`).subscribe(() => {
      this.loadingService.hide();
    });
  }

  updateTask(closeTask: boolean, task: Task, skills: Skill[]) {
    const taskStruct: DataTypes.UpdateTaskStruct = {
      metadataURI: task.metadataURI,
      status: closeTask ? Status.COMPLETED : Status.CANCELED,
      skills: skills.map(skill => skill.id),
    };
    const numericId = Number(task.id);
    this.loadingService.show();
    this.organizationService.updateTask(numericId, taskStruct).subscribe(() => {
      this.loadingService.hide();
    });
  }
}
