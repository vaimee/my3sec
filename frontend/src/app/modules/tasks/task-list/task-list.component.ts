import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Task } from '@shared/interfaces/project.interface';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  @Input() tasks$!: Observable<Task[]>;

  constructor(private router: Router, private route: ActivatedRoute) {}

  goTo(id: number): void {
    this.router.navigate([`${id}`], { relativeTo: this.route });
  }
}
