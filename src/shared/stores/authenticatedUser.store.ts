import {reactive, readonly} from 'vue';
import {UserDto} from '../dto/user.dto';

interface IAuthenticatedUserStore {
    user: UserDto | null;
}

const state: IAuthenticatedUserStore = reactive({
    user: null,
});

const methods = {
    set(user: UserDto) {
        state.user = user;
    },
    clear() {
        state.user = null;
    },
};

export default {
    state: readonly(state),
    methods,
};
