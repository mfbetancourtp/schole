import { defineStore } from 'pinia';

export const usePendingEvaluationsStore = defineStore('pendingEvaluations', {
  state: () => ({
    showBlockModal: false,
  }),
  actions: {
    openModal() {
      this.showBlockModal = true;
    },
    closeModal() {
      this.showBlockModal = false;
    },
  },
});
