import { catchError, from, map, of, switchMap } from 'rxjs';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { MetamaskService } from '../services/metamask.service';
import { My3secHubContractService } from './../../shared/services/my3sec-hub-contract.service';

export const my3secLoginGuard = () => {
  const metamaskService = inject(MetamaskService);
  const my3secHubContractService = inject(My3secHubContractService);

  const router = inject(Router);
  return from(metamaskService.isReady).pipe(
    switchMap(() => my3secHubContractService.getDefaultProfile(metamaskService.userAddress)),
    map(profileUrl => {
      if (!profileUrl.metadataURI) return router.parseUrl('auth/signup');
      return true;
    }),
    catchError(error => {
      console.error(error);
      console.log('error when reading profile - redirect to signup');
      return of(router.parseUrl('auth/signup'));
    }),
  );
};
