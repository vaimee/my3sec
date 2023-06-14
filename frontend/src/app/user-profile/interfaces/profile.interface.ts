import { ProfileData } from 'app/shared/interfaces';
import { Skill } from './skill.interface';
import { Certificate } from './certificate.interface';
import { Project } from './project.interface';
import { ProfileEnergyData } from './profile-energy-data.interface';

export interface Profile extends Omit<ProfileData, 'regulationCheckbox'> {
  id: string;
  walletAddress: string;
  energy: ProfileEnergyData;
  skills: Skill[];
  certificates: Certificate[];
  projects: Project[];
}
