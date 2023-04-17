import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MetaMaskService } from 'app/services/meta-mask.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsLoginGuard implements CanActivate {

  constructor(private metaMaskId: MetaMaskService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    await this.metaMaskId.isReady;
    if (this.metaMaskId.isLoggedIn) {
      return true;
    } else {
      return this.router.parseUrl('/notconnected');
    }
  }

}
