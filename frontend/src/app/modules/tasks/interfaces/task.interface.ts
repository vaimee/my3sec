import { Organization } from '@organizations/interfaces';
import { Project, Skill } from '@profiles/interfaces';

import { TaskStatus } from '../enums';

export interface Task {
  id: number;
  name: string;
  description: string;
  organization: Organization;
  project: Project;
  hours: number;
  feedback: number;
  status: TaskStatus;
  skills: Skill[];
  reviewer: number;
  members: number[];
  creationDate: Date;
  deadline: Date;
}
