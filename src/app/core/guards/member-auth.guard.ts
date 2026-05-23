import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { MemberAuthService } from '../services/member-auth.service';

export const memberAuthGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const memberAuthService = inject(MemberAuthService);
  const router = inject(Router);

  if (memberAuthService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/member/login'], { queryParams: { returnUrl: state.url } });
};