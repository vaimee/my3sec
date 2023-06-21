import { Observable } from 'rxjs';

import { Task } from '@shared/interfaces/project.interface';

export interface Project {
  name: string;
  status: string;
  description: string;
  hours: number;
  tasks: Observable<Task[]>;
  organization: string;
  currentMonth: number;
  durationInMonths: number;
}
