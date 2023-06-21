import { Organization as OrganizationMetadata } from '@shared/interfaces';

export interface Organization extends OrganizationMetadata {
  projectCount: number;
  memberCount: number;
  address: string;
}
