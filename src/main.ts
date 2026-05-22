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

app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info);
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4444;color:#fff;padding:16px;z-index:99999;font-size:14px;white-space:pre-wrap;max-height:40vh;overflow:auto;';
  div.textContent = `[Error Vue] ${info}\n${(err as any)?.message ?? err}`;
  document.body.appendChild(div);
};

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise]', event.reason);
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff8800;color:#fff;padding:16px;z-index:99999;font-size:14px;white-space:pre-wrap;max-height:40vh;overflow:auto;';
  div.textContent = `[Promise Error]\n${event.reason?.message ?? event.reason}`;
  document.body.appendChild(div);
});

app.mount('#app');
