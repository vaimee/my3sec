export interface Project {
  name: string;
  status: string;
  description: string;
  hours: number;
  tasks: string[];
  organization: string;
  currentMonth: number;
  durationInMonths: number;
}
