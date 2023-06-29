import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';

import { Project } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent {
  @Input() projects$!: Observable<Project[]>;
  @Input() showOrganization = false;
}
