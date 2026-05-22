import {reactive, readonly} from 'vue';
import {RoleDto} from '../dto/role.dto';

interface IState {
    roles: RoleDto[];
    selectedRole: RoleDto | null;
}

const state: IState = reactive({
    roles: [],
    selectedRole: null,
});

const methods = {
    setRoles(roles: RoleDto[]) {
        state.roles = roles;
    },
    setSelectedRole(role: RoleDto) {
        state.selectedRole = role;
    },
};

export default {
    state: readonly(state),
    methods,
};