import { from, map } from 'rxjs';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { MetamaskService } from '../services/metamask.service';

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
