import { Organization } from '@organizations/interfaces';
import { Project, Skill } from '@profiles/interfaces';

export interface Task {
  name: string;
  description: string;
  organization: Organization;
  project: Project;
  hours: number;
  feedback: number;
  status: boolean;
  skills: Skill[];
  reviewer: string;
  members: string[];
}
