import { Status } from '@shared/enums';

import { Organization } from '@organizations/interfaces';
import { Project, Skill } from '@profiles/interfaces';

export interface Task {
  id: number;
  name: string;
  description: string;
  organization: Organization;
  project: Project;
  hours: number;
  feedback: number;
  status: Status;
  skills: Skill[];
  reviewer: number;
  members: number[];
  creationDate: Date;
  deadline: Date;
}
