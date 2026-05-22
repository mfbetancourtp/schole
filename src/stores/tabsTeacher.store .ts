// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';

// Utilidades para manejar localStorage
function saveToLocalStorage(key: string, data: any): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key: string): any | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export const useTabsTeacherStore = defineStore({
  id: 'tabs',
  state: () => ({
    planingClassrom: loadFromLocalStorage('planingClassrom') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
    activitiesClassification: loadFromLocalStorage('activitiesClassification') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
    settingStudy: loadFromLocalStorage('settingStudy') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
    activities: loadFromLocalStorage('activities') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
    atendence: loadFromLocalStorage('atendence') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
    // reports: loadFromLocalStorage('reports') || {
    //   active: false,
    //   params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
    //   router: '',
    // },
    newSletters: loadFromLocalStorage('newSletters') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
    leveling: loadFromLocalStorage('leveling') || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0, subjectAssignmentId: 0 },
      router: '',
    },
  }),

  actions: {
    persistState() {
      saveToLocalStorage('planingClassrom', this.planingClassrom);
      saveToLocalStorage('activitiesClassification', this.activitiesClassification);
      saveToLocalStorage('settingStudy', this.settingStudy);
      saveToLocalStorage('activities', this.activities);
      saveToLocalStorage('atendence', this.atendence);
      // saveToLocalStorage('reports', this.reports);
      saveToLocalStorage('newSletters', this.newSletters);
      saveToLocalStorage('leveling', this.leveling);
    },
    // Agrega cualquier acción que puedas necesitar
  },
});

// Este bloque se encarga de aceptar actualizaciones en caliente (HMR)
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTabsTeacherStore, import.meta.hot));
}
