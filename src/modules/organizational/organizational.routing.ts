import ConfigurationDevelopmentMapsPage from './pages/ConfigurationDevelopmentMaps.vue';

const appName = 'organizational';

export const organizationalRouting = [
  {
    path: 'configuration-development-maps',
    component: ConfigurationDevelopmentMapsPage,
    name: `${appName}.configurationDevelopmentMaps`,
  },
];
