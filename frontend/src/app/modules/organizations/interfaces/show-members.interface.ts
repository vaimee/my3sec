import { Profile } from '@shared/interfaces';

import { MemberType } from '@organizations/types';

export interface ShowMembers {
  members: Profile[];
  memberType: MemberType;
  isManager: boolean;
}
