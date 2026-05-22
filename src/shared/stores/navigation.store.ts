import {reactive, readonly} from 'vue';
import {ItemMenuType} from '../types/itemMenu.type';

const state: { items: ItemMenuType[] } = reactive({
    items: [],
});

const methods = {
    set(items: ItemMenuType[]) {
        state.items = items;
    },
    get() {
        return state.items;
    },
};


export default {
    state: readonly(state),
    methods,
};