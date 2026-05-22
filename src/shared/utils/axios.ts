import axios from 'axios';
import { TokenService } from '../services/token.service';
import { ErrorAlertService } from '../services/errorAlert.service';
import { ToastService } from '../services/toast.service';
import { InstitutionsService } from '../services/institutions.service';
import { ButtonLoadingService } from '../services/buttonLoading.service';
import { services } from '../constant/services';
import { TokenLtiService } from '../services/tokenLti.service';
import i18n from '../plugins/i18n.plugin';
import { ValidationsErrorsService } from '../services/validationsErrors.service';
import { RolesService } from '../services/roles.service';

const getTokenService = new TokenService();
const tokenLtiService = new TokenLtiService();
const errorAlertService = new ErrorAlertService();
const toastService = new ToastService();
const institutionsService = new InstitutionsService();
const rolesService = new RolesService();
const buttonLoadingService = new ButtonLoadingService();
const validationsErrorsService = new ValidationsErrorsService();

const t = i18n.global.t.bind(i18n);

// Deduplicación de toasts: evita mostrar el mismo mensaje múltiples veces
// cuando varias llamadas fallan simultáneamente (ej. token expirado → 3 llamadas 401)
let lastToastMessage = '';
let lastToastTime = 0;
const TOAST_DEDUP_MS = 2000;

function showDedupedToast(message: string, type: string = 'error') {
  const now = Date.now();
  if (message === lastToastMessage && now - lastToastTime < TOAST_DEDUP_MS) {
    return; // duplicado, no mostrar
  }
  lastToastMessage = message;
  lastToastTime = now;
  toastService.show(message, type);
}

axios.interceptors.request.use(async (config) => {
  if (!config.headers) {
    config.headers = {};
  }

  // Agregando Token
  const auxUrl = config.url;
  const urlSearch = services.ltiProvider as string;
  if (auxUrl && auxUrl.indexOf(urlSearch) >= 0) {
    const token = await tokenLtiService.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    const token = await getTokenService.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Agregando la Institucion
  const institution = institutionsService.getSelectedInstitution();
  if (institution) {
    config.headers.institutionId = institution.id.toString();
  } else {
    const rawInstitutionId = localStorage.getItem('institutionId');
    if (rawInstitutionId) config.headers.institutionId = rawInstitutionId;
  }

  // Agregando el rol
  const role = rolesService.getSelectedRole();
  if (role) {
    config.headers.roleId = role.id.toString();
  }

  /* ErrorAlert */
  errorAlertService.hide();
  toastService.hide();
  validationsErrorsService.hide();

  buttonLoadingService.isSaving(true);

  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (response && response.data && response.data.message) {
      toastService.show(t(response.data.message));
    }
    buttonLoadingService.isSaving(false);
    return response;
  },
  (error) => {
    /* ErrorAlert */
    const response = error.response;

    if (response && response.data) {
      const data = response.data;

      if (data.message) {
        showDedupedToast(t(data.message), 'error');
      }

      if (data.message || data.errors) {
        errorAlertService.show(t(data.message), data.errors ?? []);
      }

      if (data.errors) {
        validationsErrorsService.setErrors(data.errors);
      }
    }
    buttonLoadingService.isSaving(false);
    return Promise.reject(error);
  }
);

export default axios;
