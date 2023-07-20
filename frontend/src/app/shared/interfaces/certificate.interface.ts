export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
}

export interface Certificate extends CertificateMetadata {
  id: number;
  profileId: number;
  organizationAddress: string;
  date?: Date;
}
