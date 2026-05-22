import AgendaPage from './pages/Agenda.vue';

const appName = 'events';

export const eventsRouting = [
  {
    path: 'agenda',
    component: AgendaPage,
    name: `${appName}.agenda`,
  },
];