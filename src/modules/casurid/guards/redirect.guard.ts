import { NavigationGuardNext, RouteLocationNormalized, useRouter } from 'vue-router';
import { IsAuthenticatedService } from '../../../shared/services/isAuthenticated.service';
import { settings } from '../../../shared/constant/settings.contants';

const isAuthenticatedService = new IsAuthenticatedService();

async function check(redirectURL: string): Promise<boolean> {
    const isAuth = isAuthenticatedService.run();

    if (isAuth) {
        return true;
    }

    return false;
}

export async function redirectGuardCasurid(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const redirectUrl = to.fullPath === '/sign-out' ? '/' : to.fullPath;
    const domainRedirect = settings.domainRedirect as string;
    const locationHost = window.location.host;
    // const locationHost = 'app.kontrolschool.com';

    const isCheck = await check(redirectUrl);

    if (domainRedirect === locationHost) {
        return next({
            path: '/admin/home',
        });
    }

    return next();
}