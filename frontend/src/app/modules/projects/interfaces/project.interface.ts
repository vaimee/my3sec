export interface Project {
  name: string;
  status: string;
  description?: string;
  image?: string;
  hours: number;
  tasks: string[];
  organization: string;
  currentMonth: number;
  durationInMonths: number;
}
