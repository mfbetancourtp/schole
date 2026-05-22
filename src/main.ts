import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueApexCharts from 'vue3-apexcharts';
import App from './App.vue';
import plugins from './shared/plugins';
import { router } from './app.routing';
import VueToast from 'vue-toast-notification';
import i18n from './shared/plugins/i18n.plugin';
import { createMetaManager } from 'vue-meta';
import '@fontsource/roboto';
// @ts-ignore
import CKEditor from '@ckeditor/ckeditor5-vue';

// @ts-ignore
import vSelect from 'vue-select';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import 'vue-toast-notification/dist/theme-sugar.css';
import './index.css';
import './assets/theme/index.scss';
import 'vue-select/dist/vue-select.css';
import 'bootstrap';
import '../src/assets/style/vueflow.css';

import { TooltipDirective } from './shared/directives/tooltip.directive';
import stickyHScroll from './directives/stickyHScroll';
const pinia = createPinia();
const app = createApp(App);

app.use(i18n);
app.use(plugins.fortawesomePlugin);
app.use(plugins.orugaPlugin);
app.use(router);
app.use(VueApexCharts);
app.use(VueToast);
app.use(createMetaManager());
app.use(CKEditor);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

app.component('v-select', vSelect);

/*Akademia Directives*/
app.directive('tooltip', TooltipDirective);
app.use(pinia);
app.directive('sticky-hscroll', stickyHScroll);
app.mount('#app');
