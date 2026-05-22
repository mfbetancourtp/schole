import {NavigationGuardNext, RouteLocationNormalized} from 'vue-router';
import {IsAuthenticatedService} from '../services/isAuthenticated.service';

const isAuthenticatedService = new IsAuthenticatedService();

async function check(redirectURL: string): Promise<boolean> {
    const isAuth = isAuthenticatedService.run();
    if (isAuth) {
        return true;
    }

    /*if (window.location.origin === environment.applications.users) {
        await this._router.navigate(['/auth/login'], {
            queryParams: {
                redirectURL,
            },
        });
    } else {
        window.location.href = `${environment.applications.users}/auth/login?redirectURL=${encodeURI(window.location.origin + redirectURL)}`;
    }*/

    return false;
}

export async function authGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const redirectUrl = to.fullPath === '/sign-out' ? '/' : to.fullPath;

    const isCheck = await check(redirectUrl);

    if (!isCheck) {
        return next({
            path: '/auth/login',
            // query: {
            //     redirectURL: to.fullPath,
            // },
        });
    }

    return next();
}