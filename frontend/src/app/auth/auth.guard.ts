import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = ""

    if (state.url.includes('login')) {
      if (!token) {
        return true;
      } else {
        this.router.navigate(['/projectlist']);
        return false;
      }
    } else {
      if (token) {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

}
