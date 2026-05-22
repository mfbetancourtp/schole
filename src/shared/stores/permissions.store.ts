import {reactive, readonly} from 'vue';

interface IState {
    permissions: object;
}

const state: IState = reactive({
    permissions: {},
});

const methods = {
    setPermissions(permissions: object) {
        state.permissions = permissions;
    },
};

export default {
    state: readonly(state),
    methods,
};
