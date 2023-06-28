import { Profile } from '.';

export interface OrganizationMetadata {
  name: string;
  description: string;
  headline: string;
  icon: string;
}

export interface Organization extends OrganizationMetadata {
  projectCount: number;
  members: Profile[];
  pendingMembers: Profile[];
  managers: Profile[];
  address: string;
}
