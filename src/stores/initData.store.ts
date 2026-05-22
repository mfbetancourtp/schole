// src/stores/initData.ts
import { defineStore, acceptHMRUpdate } from 'pinia';
import { InitDataDto } from '../shared/dto/initData.dto';

export const useInitDataStore = defineStore({
  id: 'initData',
  state: () => ({
    initData: null as InitDataDto | null,
  }),
  actions: {
    /** Guarda initData desde cualquier componente */
    setInitData(data: InitDataDto) {
      this.initData = data;
    },
    /** Limpia el initData si lo necesitas */
    clearInitData() {
      this.initData = null;
    },
    /** Actualiza solo el matriculateId dentro de initData */
    updateMatriculateId(nuevoId: number) {
      if (this.initData?.matriculates) {
        this.initData.matriculates.matriculateId = nuevoId;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInitDataStore, import.meta.hot));
}
