import { Status } from '@shared/enums';

import { Organization } from '@organizations/interfaces';
import { Skill } from '@profiles/interfaces';

export interface Task {
  id: number;
  name: string;
  description: string;
  organization: Organization;
  hours: number;
  feedback: number;
  status: Status;
  skills: Skill[];
  reviewer: number;
  members: number[];
  creationDate: Date;
  deadline: Date;
}
