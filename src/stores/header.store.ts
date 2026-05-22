// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';

export const useHeaderStore = defineStore({
  id: 'header',
  state: () => ({
    module: {} as { name: string; url: string },
    moduleItem: {} as { name: string; url: string },
    moduleSubItem: {} as { name: string; url: string },
    actionFilter: true as boolean,
  }),

  actions: {},
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHeaderStore, import.meta.hot));
}
