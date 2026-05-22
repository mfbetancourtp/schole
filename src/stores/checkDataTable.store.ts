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

export const useCheckDataTableStore = defineStore({
  id: 'check',
  state: () => ({
    isCheckData:{
      dataTable: [] as any,
      dataTableSelect: [] as any,
      selectedAll: false as boolean,
    },
    // isCheckActive: loadFromLocalStorage('planingClassrom') || {
    //   active: false,
    //   params: { courseId: 0, academicPeriodGroupId: 0 },
    //   router: '',
    // },
  }),

  actions: {
    persistState() {
      saveToLocalStorage('isCheckData', this.isCheckData);
    },
    // Agrega cualquier acción que puedas necesitar
  },
});

// Este bloque se encarga de aceptar actualizaciones en caliente (HMR)
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCheckDataTableStore, import.meta.hot));
}
