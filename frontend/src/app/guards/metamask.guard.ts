/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MetamaskService } from 'app/landing-metamask/services/metamask.service';


@Injectable({
  providedIn: 'root'
})
export class IsMetamaskGuard implements CanActivate {
  constructor(private metamaskId: MetamaskService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    await this.metamaskId.isReady;
    if (this.metamaskId.isLoggedIn && this.metamaskId.isMetamaskInstalled) {
      return true;
    } else {
      return this.router.parseUrl('/');
    }
  }

}

