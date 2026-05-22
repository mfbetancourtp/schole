import LoginPage from './pages/Login.vue';
import RememberPasswordRequestPage from './pages/RememberPasswordRequest.vue';
import ChangePasswordPage from './pages/ChangePassword.vue';
import ChangePasswordLoggedPage from './pages/ChangePasswordLogged.vue';
import LoginByTokenPage from './pages/LoginByToken.vue';
import Register from './pages/Register.vue';

const appName = 'auth';

export const authRouting = [
  // router
  {
    path: '/auth-success',
    name: 'auth.success',
    component: LoginPage, // o un componente Callback dedicado
  },
  {
    path: 'login',
    component: LoginPage,
    name: `${appName}.login`,
  },
  {
    path: 'remember-password',
    component: RememberPasswordRequestPage,
    name: `${appName}.rememberPasswordRequest`,
  },
  {
    path: 'change-password',
    component: ChangePasswordPage,
    name: `${appName}.changePassword`,
  },
  {
    path: 'change-password-logged',
    component: ChangePasswordLoggedPage,
    name: `${appName}.ChangePasswordLogged`,
  },
  {
    path: 'login-token',
    component: LoginByTokenPage,
    name: `${appName}.loginByToken`,
  },
  {
    path: 'register',
    component: Register,
    name: `${appName}.register`,
  },
];
