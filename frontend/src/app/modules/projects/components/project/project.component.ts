import { Observable } from 'rxjs';

import { Component } from '@angular/core';

import { ProfileMetadata } from '@shared/interfaces';
import { Project } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent  {
  project$!: Observable<Project>;
  members$!: Observable<ProfileMetadata[]>;

}
