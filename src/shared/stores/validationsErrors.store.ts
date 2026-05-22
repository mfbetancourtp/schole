import {reactive, readonly} from 'vue';

const state: { errors: any } = reactive({
    errors: {},
});

const methods = {
    setErrors(errors: any) {
        state.errors = errors;
    },
};


export default {
    state: readonly(state),
    methods,
};