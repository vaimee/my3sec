export interface ShowMembersInput {
  address: string;
  projectId: number;
  taskId: number;
}

export interface ShowMembersOutput {
  profileId?: string;
  changed: boolean;
}
