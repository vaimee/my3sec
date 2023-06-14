import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, map } from 'rxjs';
import { MetamaskService } from '../services/metamask.service';

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
