import OffenseTemplatesPage from './pages/OffenseTemplates.vue';
import OffenseTemplatesWithPagPage from './pages/OffenseTemplatesWithPag.vue';
import DisciplinaryOffensesPage from './pages/DisciplinaryOffenses.vue';
import CreateDisciplinaryOffensesPage from './pages/CreateDisciplinaryOffenses.vue';
import EditDisciplinaryOffensesPage from './pages/EditDisciplinaryOffenses.vue';

import ObserverPage from './pages/Observer.vue';
import FutureAbsences from './pages/FutureAbsences.vue';
import ObcerverByUserId from './pages/ObserverByUserId.vue';
import ObceAttendanceGeneral from './pages/ObceAttendanceGeneral.vue';

const appName = 'disciplinaryControl';

export const disciplinaryControlRouting = [
  {
    path: 'offense-templates',
    component: OffenseTemplatesPage,
    name: `${appName}.offenseTemplates`,
  },

  {
    path: 'offense-templates-with-pag',
    component: OffenseTemplatesWithPagPage,
    name: `${appName}.offenseTemplatesWithPag`,
  },

  {
    path: 'disciplinary-offenses',
    component: DisciplinaryOffensesPage,
    name: `${appName}.disciplinaryOffenses`,
  },
  {
    path: 'disciplinary-offenses/create',
    component: CreateDisciplinaryOffensesPage,
    name: `${appName}.disciplinaryOffenses.create`,
  },
  {
    path: 'disciplinary-offenses/:disciplinaryOffenseId/edit',
    component: EditDisciplinaryOffensesPage,
    name: `${appName}.disciplinaryOffenses.edit`,
  },

  {
    path: 'observer',
    component: ObserverPage,
    name: `${appName}.observer`,
  },
  {
    path: 'observer/:userId',
    component: ObcerverByUserId,
    name: `${appName}.observerByUserId`,
  },
  {
    path: 'observer/:academicPeriodGroupId/attendance-general/:sessionId',
    component: ObceAttendanceGeneral,
    name: `${appName}.observer.attendanceGeneral`,
  },
  {
    path: 'observer/:matriculateId/future-absences',
    component: FutureAbsences,
    name: `${appName}.observer.futureAbsences`,
  },
];
