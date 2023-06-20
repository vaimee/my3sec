import { Observable } from 'rxjs';

import { Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

import { Status } from '../enums';

export interface ProjectMetadata {
  name: string;
  description: string;
  icon?: string;
  start: string;
  end: string;
}

export interface TaskMetadata {
  name: string;
  description: string;
  start: string;
  end: string;
}

export interface Project extends Omit<ProjectMetadata, 'start' | 'end'> {
  id: number;
  status: Status;
  hours: number;
  tasks: Observable<Task[]>;
  organization: string;
  start: Date;
  end: Date;
  currentMonth: number;
  durationInMonths: number;
}

export interface Task extends Omit<TaskMetadata, 'start' | 'end'>, Omit<DataTypes.UpdateTaskStruct, 'skills'> {
  id: number;
  status: Status;
  hours: number;
  organization: string;
  start: Date;
  end: Date;
  currentMonth: number;
  durationInMonths: number;
  skills: Observable<Skill[]>;
  reviewer?: number;
  members?: number[];
}
