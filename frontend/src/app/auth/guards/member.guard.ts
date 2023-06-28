import { catchError, from, of, switchMap } from 'rxjs';

import { inject } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { OrganizationService } from '@shared/services/organization.service';

export const managerGuard = () => {
  const metamaskService = inject(MetamaskService);
  const organizationService = inject(OrganizationService);

  return from(metamaskService.isReady).pipe(
    switchMap(() => organizationService.isManager(metamaskService.userAddress)),
    catchError(error => {
      console.error(error);
      console.log(`error when checking if ${metamaskService.userAddress} is a manager`);
      return of(false);
    })
  );
};
