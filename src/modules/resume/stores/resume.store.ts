import { defineStore } from 'pinia';

export const useResumeStore = defineStore('resumeStore', {
  state: () => ({
    personal: null as any, // info personal
    profile: '' as string, // html del editor

    academic: [] as any[],
    complementary: [] as any[],
    experience: [] as any[],
    teaching: [] as any[],
    publications: [] as any[],
    events: [] as any[],
    awards: [] as any[], // ✅ premios / reconocimientos
    direction: [] as any[],
  }),

  actions: {
    // setters
    setPersonal(payload: any) {
      this.personal = payload ?? null;
    },

    setProfile(payload: { description: string; id?: number | null; peopleId?: number | null }) {
      this.profile = payload?.description ?? '';
    },

    setAcademic(items: any[]) {
      this.academic = Array.isArray(items) ? items : [];
    },

    setComplementary(items: any[]) {
      this.complementary = Array.isArray(items) ? items : [];
    },

    setExperience(items: any[]) {
      this.experience = Array.isArray(items) ? items : [];
    },

    setTeaching(items: any[]) {
      this.teaching = Array.isArray(items) ? items : [];
    },

    setPublications(items: any[]) {
      this.publications = Array.isArray(items) ? items : [];
    },

    setEvents(items: any[]) {
      this.events = Array.isArray(items) ? items : [];
    },

    // ✅ aquí guardas lo que venga del componente de Premios/Reconocimientos
    setAwards(items: any[]) {
      this.awards = Array.isArray(items) ? items : [];
    },

    setDirection(items: any[]) {
      this.direction = Array.isArray(items) ? items : [];
    },

    // (opcional) reset general por si algún día lo necesitas
    resetResume() {
      this.personal = null;
      this.profile = '';
      this.academic = [];
      this.complementary = [];
      this.experience = [];
      this.teaching = [];
      this.publications = [];
      this.events = [];
      this.awards = [];
      this.direction = [];
    },
  },

  getters: {
    cvTemplateData(state) {
      const p = state.personal ?? {};

      return {
        personal: {
          photo: p?.photoUrl ?? p?.profileImage ?? '',
          fullName: p?.fullName ?? `${p?.names ?? ''} ${p?.lastNames ?? ''}`.trim(),
          documentId: p?.documentId ?? p?.documentNumber ?? '',
          email: p?.email ?? '',
          phone: p?.phone ?? p?.cellphone ?? '',
          city: p?.city ?? '',
          country: p?.country ?? 'Colombia',
        },

        profile: state.profile ?? '',

        academic: state.academic ?? [],
        complementary: state.complementary ?? [],
        experience: state.experience ?? [],
        teaching: state.teaching ?? [],
        publications: state.publications ?? [],
        events: state.events ?? [],
        awards: state.awards ?? [], // ✅ ya sale directo al template del CV
        direction: state.direction ?? [],
      };
    },
  },
});
