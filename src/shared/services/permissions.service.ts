import PermissionsStore from '../stores/permissions.store';

export class PermissionsService {
    listMe = 'list-me';
    private permissions = {};

    saveOnLocal(permissions: object): void {
        PermissionsStore.methods.setPermissions(permissions);
    }

    check(permission: string): boolean {
        const permissions = this.getFromLocal();
        
        let hasPermission = false;

        if (permissions[permission] && permissions[permission].length) {
            hasPermission = true;
        }

        return hasPermission;
    }

    get(permission: string): [] {
        const permissions = this.getFromLocal();

        return permissions[permission];
    }

    private getFromLocal(): any {
        return PermissionsStore.state.permissions;
    }
}
