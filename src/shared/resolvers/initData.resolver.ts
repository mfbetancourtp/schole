import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { GetInitDataService } from '../services/getInitData.service';
import { ItemMenuType } from '../types/itemMenu.type';
import { IsAuthenticatedService } from '../services/isAuthenticated.service';
import { InstitutionsService } from '../services/institutions.service';
import { AuthenticatedUserService } from '../services/authenticatedUser.service';
import i18n from '../plugins/i18n.plugin';
import { GetTranslationsByLanguageService } from '../services/getTranslationsByLanguage.service';
import { NavigationService } from '../services/navigation.service';
import { RolesService } from '../services/roles.service';
import { SignOutService } from '../services/signOut.service';
import { ItemMenuReportType } from '../types/itemMenuReport.type';
import { ReportsService } from '../services/reports.service';
import { PermissionsService } from '../services/permissions.service';
import { PendingEvaluationsService } from '../services/pendingEvaluations.service';
import { useUserStore } from '../../stores/user';

const getInitDataService = new GetInitDataService();
const isAuthenticatedService = new IsAuthenticatedService();
const institutionsService = new InstitutionsService();
const authenticatedUserService = new AuthenticatedUserService();
const getTranslationsByLanguageService = new GetTranslationsByLanguageService();
const navigationService = new NavigationService();
const reportsService = new ReportsService();
const rolesService = new RolesService();
const permissionsService = new PermissionsService();
const pendingEvaluationsService = new PendingEvaluationsService();

/* ============================================================
 * 🔹 Funciones auxiliares (sin cambios en la lógica existente)
 * ============================================================ */

function convertRouteToNavigation(route: string): {
  route: string | null;
  externalLink: boolean;
} {
  if (!route) {
    return { route: null, externalLink: false };
  }

  if (!validURL(route)) {
    return { route, externalLink: false };
  }

  const host = window.location.origin;
  let newRoute = route;
  let externalLink = true;

  if (route.includes(host)) {
    newRoute = route.replace(host, '');
    externalLink = false;
  }

  return { route: newRoute, externalLink };
}

function validURL(str: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$',
    'i'
  );
  return !!pattern.test(str);
}

function getPermissions(item: any): any {
  if (!item.rolePermissions) return false;

  const keys = Object.keys(item.rolePermissions);
  const permissions: any = {};

  keys.forEach((key) => {
    if (item.rolePermissions[key].length) {
      permissions[`${item.code}.${key}`] = item.rolePermissions[key];
    }
  });

  return Object.keys(permissions).length ? permissions : false;
}

/* ============================================================
 * 🔹 NUEVA FUNCIÓN: obtener la primera ruta válida del menú
 * ============================================================ */
function getFirstAvailableRoute(items: any[]): string | null {
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      const firstChildWithRoute = item.children.find((child: any) => !!child.route);
      if (firstChildWithRoute) return firstChildWithRoute.route;
    }
  }
  return null;
}

function isAuthPath(path: string): boolean {
  return path === '/auth-success' || path.startsWith('/auth/');
}

function isUserConvocationPath(path: string): boolean {
  return path.startsWith('/surveys/user-convocations/');
}

/* ============================================================
 * 🔹 Resolver principal
 * ============================================================ */
async function initDataResolver(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const language = 'es';
  const userStorage = useUserStore();

  // Cargar traducciones
  const messages = await getTranslationsByLanguageService.run(language);
  i18n.global.setLocaleMessage(language, messages);

  const isAuth = isAuthenticatedService.run();

  // ❌ No autenticado
  if (!isAuth) {
    // Si entra al root "/" sin login → mandar al login
    if (to.path === '/') {
      return next('/auth/login');
    }
    return next();
  }

  // ✅ Si sí está autenticado
  // Si intenta ir al login con parámetros SAML → dejarlo pasar para que el componente
  // Login ejecute el flujo SAML automático (handleSamlAutoRedirect)
  if (to.path === '/auth/login' && to.query.protocol === 'saml') {
    return next();
  }

  // Si intenta ir al login manualmente sin SAML → enviarlo al "/"
  if (to.path === '/auth/login') {
    return next('/');
  }

  try {
    const { items, userInstitutions, user, userRoles, pendingEvaluations } = await getInitDataService.run();

    // Permite continuar el flujo de inscripción a convocatoria sin forzar
    // el cambio de contraseña en medio del proceso de primer ingreso.
    if (user?.isFirstLogin === 1 && !isAuthPath(to.path) && !isUserConvocationPath(to.path)) {
      return next('/auth/change-password-logged');
    }

    let permissions = {};

    authenticatedUserService.set(user);

    /* ===== Construcción del menú ===== */
    const itemsMenu: ItemMenuType[] = [];
    const itemsReport: ItemMenuReportType[] = [];

    items.forEach((item) => {
      const children: ItemMenuType[] = [];

      const permission = getPermissions(item);
      if (permission) {
        permissions = { ...permissions, ...permission };
      }

      item.children.forEach((itemChild) => {
        const permissionChild = getPermissions(itemChild);
        if (permissionChild) {
          permissions = { ...permissions, ...permissionChild };
        }

        if (itemChild.showMenu) {
          const convertRouteChild = convertRouteToNavigation(itemChild.route);
          children.push({
            id: itemChild.id.toString(),
            title: itemChild.name,
            icon: itemChild.icon,
            link: convertRouteChild.route,
            externalLink: convertRouteChild.externalLink,
            code: itemChild.code,
          });
        }

        if (itemChild.isReport) {
          const convertRouteChild = convertRouteToNavigation(itemChild.route);
          itemsReport.push({
            id: itemChild.id.toString(),
            title: itemChild.name,
            icon: itemChild.icon,
            link: convertRouteChild.route,
            externalLink: convertRouteChild.externalLink,
            isReport: itemChild.isReport,
            code: itemChild.code,
          });
        }
      });

      if (item.showMenu) {
        const convertRoute = convertRouteToNavigation(item.route);
        itemsMenu.push({
          id: item.id.toString(),
          title: item.name,
          icon: item.icon,
          link: convertRoute.route,
          externalLink: convertRoute.externalLink,
          children,
          code: item.code,
        });
      }

      if (item.isReport) {
        const convertRoute = convertRouteToNavigation(item.route);
        itemsReport.push({
          id: item.id.toString(),
          title: item.name,
          icon: item.icon,
          link: convertRoute.route,
          externalLink: convertRoute.externalLink,
          isReport: item.isReport,
          code: item.code,
        });
      }
    });

    /* ===== Guardar datos en stores ===== */
    await userStorage.setItemsMenu(itemsMenu);
    await userStorage.setUserDto(user);

    navigationService.set(itemsMenu);
    reportsService.set(itemsReport);

    permissionsService.saveOnLocal(permissions);

    const institutions = userInstitutions.map((u) => u.institution);
    institutionsService.setInstitutions(institutions);
    institutionsService.setDefaultSelectedInstitution();

    const roles = userRoles.map((r) => r.role);
    rolesService.setRoles(roles);
    rolesService.setDefaultSelectedRole();

    // Guardar evaluaciones pendientes en localStorage
    if (pendingEvaluations) {
      pendingEvaluationsService.set(pendingEvaluations);
    }

    /* ============================================================
     * 🔹 NUEVA LÓGICA: redirigir al primer route del menú
     * ============================================================ */
    const firstRoute = getFirstAvailableRoute(items);
    if (to.path === '/') {
      // TODO: eliminar cuando el backend ordene el menú correctamente por perfil
      if (pendingEvaluationsService.isStudent()) {
        return next({ name: 'administration.dashboardStudent' });
      }
      if (firstRoute) {
        return next(firstRoute);
      }
    }

    return next();
  } catch (e) {
    const signOutService = new SignOutService();
    signOutService.run();
    return next('/auth/login');
  }
}

export { initDataResolver };
