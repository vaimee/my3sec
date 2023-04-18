/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  displayedColumns!: string[];
  dataSource: any = []
  constructor() { }

  ngOnInit(): void {
    this.displayedColumns = ['No', 'title', 'tasks', 'project', 'months', 'workers', 'manager', 'status'];
    this.dataSource = [
      { No: 1, title: 'Hydrogen', tasks: '10', project: 'Vaimee', months: '5/10', workers: 'co-workers', manager: 'John', status: 'Active' },
      { No: 2, title: 'Helium', tasks: '15', project: 'Ufabc', months: '6/10', workers: 'co-workers', manager: 'Smith', status: 'Closed' },
    ];
  }

}
