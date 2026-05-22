import {reactive, readonly} from 'vue';

const state = reactive({
    message: '',
    type: 'success',
});

const methods = {
    show(message: string, type = 'success') {
        state.message = message;
        state.type = type;
    },
    hide() {
        state.message = '';
    },
};


export default {
    state: readonly(state),
    methods,
};