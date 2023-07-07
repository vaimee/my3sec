import { from, map } from 'rxjs';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { MetamaskService } from '../services/metamask.service';

export const metamaskCheck = () => {
  const metamaskService = inject(MetamaskService);
  const router = inject(Router);
  return from(metamaskService.isReady).pipe(
    map(() => {
      if (!metamaskService.isMetamaskInstalled) {
        return router.parseUrl('auth/metamask-not-installed');
      }
      if (!metamaskService.isLoggedIn) {
        return router.parseUrl('auth/login');
      }
      if (!metamaskService.isVivianiChain) {
        return router.parseUrl('auth/wrong-chain');
      }
      return true;
    })
  );
};

export const metamaskNotInstalledGuard = () => {
  const metamaskService = inject(MetamaskService);
  const router = inject(Router);
  return from(metamaskService.isReady).pipe(
    map(() => {
      if (!metamaskService.isMetamaskInstalled) {
        return router.parseUrl('auth/metamask-not-installed');
      }
      return true;
    })
  );
};

export const metamaskLoginGuard = () => {
  const metamaskService = inject(MetamaskService);
  const router = inject(Router);
  return from(metamaskService.isReady).pipe(
    map(() => {
      if (!metamaskService.isLoggedIn) {
        return router.parseUrl('auth/login');
      }
      return true;
    })
  );
};

export const rightChainGuard = () => {
  const metamaskService = inject(MetamaskService);
  const router = inject(Router);
  return from(metamaskService.isReady).pipe(
    map(() => {
      if (!metamaskService.isVivianiChain) {
        return router.parseUrl('auth/wrong-chain');
      }
      return true;
    })
  );
};
