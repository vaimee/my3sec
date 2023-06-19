import { Component, Input } from '@angular/core';

import { TaskStatus } from '../enums';

@Component({
  selector: 'app-show-status',
  templateUrl: './show-status.component.html',
  styleUrls: ['./show-status.component.css'],
})
export class ShowStatusComponent {
  @Input() status!: TaskStatus;

  getFormattedTaskStatus(): { label: string; color: string } {
    let label: string;
    let color: string;

    switch (this.status) {
      case TaskStatus.NOT_STARTED:
        label = 'Not Started';
        color = 'text-not-started';
        break;
      case TaskStatus.IN_PROGRESS:
        label = 'In Progress';
        color = 'text-in-progress';
        break;
      case TaskStatus.COMPLETED:
        label = 'Completed';
        color = 'text-completed';
        break;
      case TaskStatus.CANCELED:
        label = 'Canceled';
        color = 'text-cancelled';
        break;
    }

    return { label, color };
  }
}
