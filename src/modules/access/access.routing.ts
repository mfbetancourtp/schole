import { RouteRecordRaw } from 'vue-router';

import RolesPage from './pages/Roles.vue';
import PermissionsPage from './pages/Permissions.vue';
import UsersPage from './pages/Users.vue';
import UserCreatePage from './pages/UserCreate.vue';
import UserEditPage from './pages/UserEdit.vue';
import ProfileFullPage from './pages/ProfileFull.vue';
import MedicalRecordsPage from './pages/MedicalRecords.vue';

const appName = 'access';

export const accessRouting: RouteRecordRaw[] = [
  {
    path: 'roles',
    component: RolesPage,
    name: `${appName}.rolesList`,
  },
  {
    path: 'roles/:roleId/permission',
    component: PermissionsPage,
    name: `${appName}.permissionsList`,
  },
  {
    path: 'users',
    component: UsersPage,
    name: `${appName}.usersList`,
  },
  {
    path: 'users/create',
    component: UserCreatePage,
    name: `${appName}.usersCreate`,
  },
  {
    path: 'users/:userId/edit',
    component: UserEditPage,
    name: `${appName}.usersEdit`,
  },
  {
    path: 'profile',
    component: ProfileFullPage,
    name: `${appName}.profile`,
  },
  {
    path: 'profile/:userId',
    component: ProfileFullPage,
    name: `${appName}.profileById`,
  },
  {
    path: 'medical-records',
    component: MedicalRecordsPage,
    name: `${appName}.medicalRecords`,
  },
];
