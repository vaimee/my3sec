import { Task } from '@shared/interfaces/project.interface';
import { Observable } from 'rxjs';

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
