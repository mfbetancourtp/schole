// stores/tabsStudent.store.ts
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

type TabState = {
  active: boolean;
  params: { courseId: number; academicPeriodGroupId: number };
  router: string;
  returnTo: string;
};

export const useTabsStudentStore = defineStore({
  id: 'tabs',
  state: () => ({
    activities: (loadFromLocalStorage('activities') as TabState) || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0 },
      router: '',
      returnTo: '',
    },
    atendence: (loadFromLocalStorage('atendence') as TabState) || {
      active: false,
      params: { courseId: 0, academicPeriodGroupId: 0 },
      router: '',
      returnTo: '',
    },
  }),

  actions: {
    /** Persiste en localStorage */
    persistState() {
      saveToLocalStorage('activities', this.activities);
      saveToLocalStorage('atendence', this.atendence);
    },

    /**
     * Actualiza la pestaña de Actividades
     * @param tab Partial<TabState> con los campos a cambiar
     */
    setActivitiesTab(tab: Partial<TabState>) {
      this.activities = { ...this.activities, ...tab };
      this.persistState();
    },

    /**
     * Actualiza la pestaña de Asistencia
     * @param tab Partial<TabState> con los campos a cambiar
     */
    setAtendenceTab(tab: Partial<TabState>) {
      this.atendence = { ...this.atendence, ...tab };
      this.persistState();
    },
  },
});

// HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTabsStudentStore, import.meta.hot));
}
