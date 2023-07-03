export interface ProfileMetadata {
  firstName: string;
  surname: string;
  organization: string;
  role: string;
  profileImage: string;
  bio?: string;
  regulationCheckbox: boolean;
}

export interface Profile extends ProfileMetadata {
  id: string;
  walletAddress: string;
}
