import type { LocationQuery, RouteLocationRaw } from 'vue-router';

export const MODERN_REGISTRATION_FLOW_QUERY_KEY = 'registrationFlow';
export const MODERN_REGISTRATION_FLOW_QUERY_VALUE = 'modern';

export const DEFAULT_REGISTRATION_ROUTE_NAME = 'surveys.userConvocations.registration';
export const MODERN_REGISTRATION_ROUTE_NAME = 'surveys.userConvocations.registrationModern';
export const MODERN_REGISTRATION_EXAM_ROUTE_NAME = 'surveys.userConvocations.registrationModern.exam';

interface RegistrationRouteParams {
  institutionId: string | number;
  convocationId: string | number;
  convocationEnrollId: string | number;
}

export const isModernRegistrationFlow = (query: LocationQuery | Record<string, unknown>) => String(query?.[MODERN_REGISTRATION_FLOW_QUERY_KEY] ?? '') === MODERN_REGISTRATION_FLOW_QUERY_VALUE;

export const buildModernRegistrationQuery = () => ({
  [MODERN_REGISTRATION_FLOW_QUERY_KEY]: MODERN_REGISTRATION_FLOW_QUERY_VALUE,
});

export const buildRegistrationRoute = (params: RegistrationRouteParams, useModern = false): RouteLocationRaw => {
  const location: RouteLocationRaw = {
    name: useModern ? MODERN_REGISTRATION_ROUTE_NAME : DEFAULT_REGISTRATION_ROUTE_NAME,
    params,
  };

  if (useModern) {
    location.query = buildModernRegistrationQuery();
  }

  return location;
};
