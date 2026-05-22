import {App} from 'vue';
import {Config, Table, Pagination, Loading, Select, Dropdown, Button, Modal, Steps} from '@oruga-ui/oruga-next';
import '@oruga-ui/oruga-next/dist/oruga.css';
import '@oruga-ui/oruga-next/dist/oruga-full.css';

export default {
    install: (app: App) => {
        app.use(Config, {
            iconComponent: 'font-awesome-icon',
            iconPack: 'fas',
        });

        app.use(Table);
        app.use(Pagination);
        app.use(Loading);
        app.use(Select);
        app.use(Dropdown);
        app.use(Button);
        app.use(Modal);
        app.use(Steps);
    },
};