import {reactive, readonly} from 'vue';

const state = reactive({
    loading: false,
});

const methods = {
    isSaving(load: boolean) {
        state.loading = load;
    },
};


export default {
    state: readonly(state),
    methods,
};