export interface OrganizationMetadata {
  address: string;
  name: string;
  description: string;
  icon: string;
}

export interface Organization extends OrganizationMetadata {
  projectCount: number;
  memberCount: number;
}
