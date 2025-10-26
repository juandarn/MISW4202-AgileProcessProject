import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles: string[] = route.data['expectedRoles'];
    const userRole = sessionStorage.getItem('rol');
    if (userRole && expectedRoles.includes(userRole)) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
