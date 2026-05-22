import AgendaPage from './pages/Agenda.vue';
import InstitutionalTimelinePage from './pages/InstitutionalTimeline.vue';
import InstitutionalTimelineCreatePage from './pages/InstitutionalTimelineCreate.vue';
import InstitutionalTimelineEditPage from './pages/InstitutionalTimelineEdit.vue';
import InstitutionalTimelineActivitySummaryPage from './pages/InstitutionalTimelineInstitutionalActivitySummary.vue';

const appName = 'institutionalEvents';

export const institutionalEventsRouting = [
  {
    path: 'agenda',
    component: AgendaPage,
    name: `${appName}.agenda`,
  },

  {
    path: 'institutional-timeline',
    component: InstitutionalTimelinePage,
    name: `${appName}.institutionalTimeline`,
  },
  {
    path: 'institutional-timeline/create',
    component: InstitutionalTimelineCreatePage,
    name: `${appName}.institutionalTimelineCreate`,
  },
  {
    path: 'institutional-timeline/:institutionalActivityId/edit',
    component: InstitutionalTimelineEditPage,
    name: `${appName}.institutionalTimelineEdit`,
  },
  {
    path: 'institutional-timeline/:institutionalActivityId/activity-summary',
    component: InstitutionalTimelineActivitySummaryPage,
    name: `${appName}.institutionalTimelineActivitySummary`,
  },
];
