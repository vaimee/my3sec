import { Task } from 'app/modules/tasks/interfaces';
import { Observable } from 'rxjs';

export interface Project {
  name: string;
  status: string;
  description?: string;
  image?: string;
  hours: number;
  tasks: Observable<Task[]>;
  organization: string;
  currentMonth: number;
  durationInMonths: number;
}
