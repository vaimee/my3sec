import { Observable } from 'rxjs';

import { Skill } from '@profiles/interfaces';
import { DataTypes } from '@vaimee/my3sec-contracts/dist/contracts/organizations/Organization';

import { Status } from '../enums';
import { Profile } from './profile.interface';

export interface ProjectMetadata {
  name: string;
  description: string;
  icon?: string;
  startDate: string;
  endDate: string;
}

export interface TaskMetadata {
  name: string;
  description: string;
  start: string;
  end: string;
}

export interface Project extends Omit<ProjectMetadata, 'startDate' | 'endDate'> {
  id: number;
  status: Status;
  hours: number;
  tasks: Observable<Task[]>;
  members: Observable<Profile[]>;
  organization: string;
  startDate: Date;
  endDate: Date;
  currentMonth: number;
  durationInMonths: number;
}

export interface Task extends Omit<TaskMetadata, 'start' | 'end'>, Omit<DataTypes.TaskViewStruct, 'skills' | 'id'> {
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
