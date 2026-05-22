import {reactive, readonly} from 'vue';

const state = reactive({
    message: '',
    validationErrors: [],
});

const methods = {
    setMessage(message: string, validationErrors: any = []) {
        state.message = message;
        state.validationErrors = validationErrors;
    },
};


export default {
    state: readonly(state),
    methods,
};