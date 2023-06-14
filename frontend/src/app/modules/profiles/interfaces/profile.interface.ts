import { ProfileData } from 'app/shared/interfaces';

import { Certificate } from './certificate.interface';
import { ProfileEnergyData } from './profile-energy-data.interface';
import { Project } from './project.interface';
import { Skill } from './skill.interface';

export interface Profile extends Omit<ProfileData, 'regulationCheckbox'> {
  id: string;
  walletAddress: string;
  energy: ProfileEnergyData;
  skills: Skill[];
  certificates: Certificate[];
  projects: Project[];
}
