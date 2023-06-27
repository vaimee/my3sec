export interface OrganizationMetadata {
  name: string;
  description: string;
  headline: string;
  icon: string;
}

export interface Organization extends OrganizationMetadata {
  projectCount: number;
  memberCount: number;
  address: string;
}
