import { Component, Input } from '@angular/core';

import { Status } from '@shared/enums';

@Component({
  selector: 'app-show-status',
  templateUrl: './show-status.component.html',
  styleUrls: ['./show-status.component.css'],
})
export class ShowStatusComponent {
  @Input() status!: Status;

  getFormattedTaskStatus(): { label: string; color: string } {
    let label: string;
    let color: string;

    switch (this.status) {
      case Status.NOT_STARTED:
        label = 'Not Started';
        color = 'text-not-started';
        break;
      case Status.IN_PROGRESS:
        label = 'In Progress';
        color = 'text-in-progress';
        break;
      case Status.COMPLETED:
        label = 'Completed';
        color = 'text-completed';
        break;
      case Status.CANCELED:
        label = 'Canceled';
        color = 'text-cancelled';
        break;
    }

    return { label, color };
  }
}
