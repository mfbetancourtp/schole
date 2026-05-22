import {NavigationGuardNext, RouteLocationNormalized, useRouter} from 'vue-router';
import {IsAuthenticatedService} from '../../../shared/services/isAuthenticated.service';

const isAuthenticatedService = new IsAuthenticatedService();

async function check(redirectURL: string): Promise<boolean> {
    const isAuth = isAuthenticatedService.run();

    if (isAuth) {
        return true;
    }

    return false;
}

export async function authGuardCasurid(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const redirectUrl = to.fullPath === '/sign-out' ? '/' : to.fullPath;

    const isCheck = await check(redirectUrl);

    if (!isCheck) {
        return next({
            path: '/casurid/login',
            query: {
                redirectURL: to.fullPath,
            },
        });
    }

    return next();
}