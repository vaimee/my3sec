import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';

import { ProfileMetadata } from '@shared/interfaces';
import { Project } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit {
  project$!: Observable<Project>;
  members$!: Observable<ProfileMetadata[]>;

  ngOnInit(): void {
    this.project$ = of();
    this.members$ = of([]);
  }
}
