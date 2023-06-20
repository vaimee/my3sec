import { Observable, of } from 'rxjs';

import { Component, OnInit } from '@angular/core';

import { Project } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
})
export class ProjectListComponent implements OnInit {
  projects$!: Observable<Project[]>;

  ngOnInit(): void {
    this.projects$ = of([]);
  }
}
