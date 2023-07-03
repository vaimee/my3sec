import { catchError, from, of, switchMap } from 'rxjs';

import { Location } from '@angular/common';
import { inject } from '@angular/core';

import { MetamaskService } from '@auth/services/metamask.service';

import { OrganizationService } from '@shared/services/organization.service';

export const managerGuard = () => {
  const metamaskService = inject(MetamaskService);
  const organizationService = inject(OrganizationService);
  const location = inject(Location);

  return from(metamaskService.isReady).pipe(
    switchMap(() => {
      const url = window.location.pathname;
      const organizationAddress = url.split('/')[2];
      organizationService.setTarget(organizationAddress);
      return organizationService.isManager(metamaskService.userAddress);
    }),
    switchMap(isManager => (isManager ? of(true) : of(location.back()))),
    catchError(error => {
      console.error(error);
      console.log(`error when checking if ${metamaskService.userAddress} is a manager`);
      return of(location.back());
    })
  );
};
