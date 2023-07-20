import { MemberType } from '@organizations/types';

export interface ShowMembersInput {
  address: string;
  memberType: MemberType;
  isManager: boolean;
  isOwner: boolean;
}

export interface ShowMembersOutput {
  profileId?: string;
  changed: boolean;
}
