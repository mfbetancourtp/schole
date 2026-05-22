import {reactive, readonly} from 'vue';
import {ItemMenuReportType} from '../types/itemMenuReport.type';

const state: { items: ItemMenuReportType[] } = reactive({
    items: [],
});

const methods = {
    set(items: ItemMenuReportType[]) {
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