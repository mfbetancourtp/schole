// stores/filtersTeacher.store.ts
import { defineStore } from 'pinia';

export const useFiltersTeacherStore = defineStore('filtersTeacher', {
  state: () => ({
    academicPeriodId: null as number | null,
    levelId: [] as number[],
    degreeId: [] as number[],
    groupId: [] as number[],
    courseIds: [] as number[],
    teacherId: [] as number[],
  }),
  actions: {
    setFilters(payload: Partial<Omit<this, '$id' | '$state' | '$patch'>>) {
      Object.assign(this, payload);
    },
    resetFilters() {
      this.academicPeriodId = null;
      this.levelId = [];
      this.degreeId = [];
      this.groupId = [];
      this.courseIds = [];
      this.teacherId = [];
    },
  },
});
