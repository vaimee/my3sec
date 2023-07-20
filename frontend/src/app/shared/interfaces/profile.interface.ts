export interface ProfileMetadata {
  firstName: string;
  surname: string;
  profileImage: string;
  bio?: string;
}

export interface Profile extends ProfileMetadata {
  id: string;
  walletAddress: string;
}
