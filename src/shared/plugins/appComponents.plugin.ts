import {App} from 'vue';
import AppButton from '../components/Buttons/AppButton.vue';
import AppLayout from '../layout/AppLayout.vue';

export default {
    install: (app: App) => {
        app.component('app-button', AppButton);
        app.component('app-layout', AppLayout);
    },
};