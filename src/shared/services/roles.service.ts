import { RoleDto } from '../dto/role.dto';
import RolesStore from '../stores/roles.store';

export class RolesService {
  private rolesKey = 'roles';
  private selectedRoleKey = 'roleId';
  private selectedProfileKey = 'profileId';

  getRoles(): RoleDto[] | [] {
    const roles = localStorage.getItem(this.rolesKey);

    if (roles) {
      return JSON.parse(roles);
    }

    return [];
  }

  setRoles(roles: RoleDto[]) {
    localStorage.setItem(this.rolesKey, JSON.stringify(roles));
    this.setRolesOnStore();
  }

  setRolesOnStore() {
    const roles = this.getRoles();

    if (roles) {
      RolesStore.methods.setRoles(roles);
    }
  }

  getSelectedRole(): RoleDto | null {
    const roleId = localStorage.getItem(this.selectedRoleKey) ?? '';
    const roles = this.getRoles();

    let role = null;

    roles.forEach((rol) => {
      if (parseInt(roleId) === rol.id) {
        role = rol;
      }
    });

    return role;
  }

  setSelectedRoles(role: RoleDto) {
    localStorage.setItem(this.selectedRoleKey, role.id.toString());

    if (role.profileId !== undefined) {
      localStorage.setItem(this.selectedProfileKey, role.profileId.toString());
    } else {
      console.error('profileId es undefined para el rol seleccionado.');
    }
    this.setSelectedRoleOnStore();
  }

  setSelectedRoleOnStore() {
    const role = this.getSelectedRole();

    if (role) {
      RolesStore.methods.setSelectedRole(role);
    }
  }

  setDefaultSelectedRole() {
    const role = this.getSelectedRole();

    if (role) {
      return;
    }

    const roles = this.getRoles();

    this.setSelectedRoles(roles[0]);
  }
}
