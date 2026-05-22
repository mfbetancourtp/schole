import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

import { settings } from '../constant/settings.contants';

import { IsAuthenticatedService } from '../services/isAuthenticated.service';

const isAuthenticatedService = new IsAuthenticatedService();

export async function redirectGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const locationHost = window.location.host;
  const domainRedirect = settings.domainRedirect as string;

  const isAuth = isAuthenticatedService.run();

  if (!isAuth) return next({ path: '/auth/login', query: { redirectURL: to.fullPath } });
  // if (domainRedirect === locationHost) return next({ path: '/admin/home' });

  return next();
}
