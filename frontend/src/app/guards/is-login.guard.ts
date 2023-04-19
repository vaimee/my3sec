import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { MetaMaskService } from 'app/services/meta-mask.service';

@Injectable({
  providedIn: 'root'
})
export class IsLoginGuard implements CanActivate {

  constructor(private metaMaskId: MetaMaskService, private router: Router) { }

  async canActivate(): Promise<boolean | UrlTree> {
    await this.metaMaskId.isReady;
    if (this.metaMaskId.isLoggedIn) {
      return true;
    } else {
      return this.router.parseUrl('/notconnected');
    }
  }

}
