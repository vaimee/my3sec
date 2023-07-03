export interface ShowMembersInput {
  address: string;
  projectId: number;
  isAddMember: boolean;
  isManager: boolean;
}

export interface ShowMembersOutput {
  profileId?: string;
  changed: boolean;
}
