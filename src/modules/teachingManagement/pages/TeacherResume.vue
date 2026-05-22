<template>
  <AppBaseList title="Hoja de Vida Docente">
    <template #content>
      <div class="cvPage">
        <!-- TOP BAR -->
        <div class="cvTop">
          <div class="cvTop__left w-100">
            <h2 class="cvTop__title">Hoja de Vida Docente</h2>

            <div class="cvTop__progressRow">
              <div class="cvTop__progressInfo">
                <span class="cvTop__progressLabel">Porcentaje de completitud</span>
                <span class="cvTop__progressValue">{{ completionPercentage }}%</span>
              </div>

              <div class="cvProgress">
                <div class="cvProgress__bar" :style="{ width: `${completionPercentage}%` }" />
              </div>
            </div>
          </div>

          <div class="cvTop__right">
            <AppButton type="button" class="btnExport" @click="handleExportPdf">
              <AppIcon icon="file-download" />
              Exportar PDF
            </AppButton>
          </div>
        </div>

        <!-- BODY -->
        <div class="cvBody">
          <AppVerticalStepper :showFooter="false" sidebarWidth="260px" @changeStep="handleChangeStep" :useContentWrapper="false">
            <AppVerticalStep name="Información Personal" id="personal">
              <PersonalInfoStep />
            </AppVerticalStep>

            <AppVerticalStep name="Perfil Profesional" id="profile">
              <ProfileStep />
            </AppVerticalStep>

            <AppVerticalStep name="Formación Académica" id="academic">
              <AcademicFormationStep />
            </AppVerticalStep>

            <AppVerticalStep name="Formación Complementaria" id="complementary">
              <ComplementaryFormationStep />
            </AppVerticalStep>

            <AppVerticalStep name="Experiencia Laboral" id="experience">
              <WorkExperienceStep />
            </AppVerticalStep>

            <AppVerticalStep name="Experiencia Docente" id="teaching">
              <TeachingExperienceStep />
            </AppVerticalStep>

            <AppVerticalStep name="Producción Intelectual" id="production">
              <IntellectualProductionStep />
            </AppVerticalStep>

            <AppVerticalStep name="Eventos Académicos" id="events">
              <AcademicEventsStep />
            </AppVerticalStep>

            <AppVerticalStep name="Premios y Reconocimientos" id="awards">
              <AwardsRecognitionsStep />
            </AppVerticalStep>
          </AppVerticalStepper>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import AppVerticalStepper from '../../../shared/components/VerticalStepper/AppVerticalStepper.vue';
import AppVerticalStep from '../../../shared/components/VerticalStepper/AppVerticalStep.vue';

/** Steps */
import PersonalInfoStep from '../components/steps/PersonalInfoStep.vue';
import ProfileStep from '../components/steps/ProfileStep.vue';
import AcademicFormationStep from '../components/steps/AcademicFormationStep.vue';
import ComplementaryFormationStep from '../components/steps/ComplementaryFormationStep.vue';
import WorkExperienceStep from '../components/steps/WorkExperienceStep.vue';
import TeachingExperienceStep from '../components/steps/TeachingExperienceStep.vue';
import IntellectualProductionStep from '../components/steps/IntellectualProductionStep.vue';
import AcademicEventsStep from '../components/steps/AcademicEventsStep.vue';
import AwardsRecognitionsStep from '../components/steps/AwardsRecognitionsStep.vue';

type SectionId = 'personal' | 'profile' | 'academic' | 'complementary' | 'experience' | 'teaching' | 'production' | 'events' | 'awards';

interface SectionMeta {
  id: SectionId;
  title: string;
  records: number;
  lastUpdate: string;
}

export default defineComponent({
  name: 'TeacherCVPage',
  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppVerticalStepper,
    AppVerticalStep,

    PersonalInfoStep,
    ProfileStep,
    AcademicFormationStep,
    ComplementaryFormationStep,
    WorkExperienceStep,
    TeachingExperienceStep,
    IntellectualProductionStep,
    AcademicEventsStep,
    AwardsRecognitionsStep,
  },
  setup() {
    const sectionsData = ref<Record<SectionId, SectionMeta>>({
      personal: {
        id: 'personal',
        title: 'Información Personal',
        records: 1,
        lastUpdate: '15 Feb 2026',
      },
      profile: {
        id: 'profile',
        title: 'Perfil Profesional',
        records: 1,
        lastUpdate: '12 Feb 2026',
      },
      academic: {
        id: 'academic',
        title: 'Formación Académica',
        records: 3,
        lastUpdate: '10 Feb 2026',
      },
      complementary: {
        id: 'complementary',
        title: 'Formación Complementaria',
        records: 6,
        lastUpdate: '18 Feb 2026',
      },
      experience: {
        id: 'experience',
        title: 'Experiencia Laboral',
        records: 5,
        lastUpdate: '08 Feb 2026',
      },
      teaching: {
        id: 'teaching',
        title: 'Experiencia Docente',
        records: 8,
        lastUpdate: '14 Feb 2026',
      },
      production: {
        id: 'production',
        title: 'Producción Intelectual',
        records: 12,
        lastUpdate: '16 Feb 2026',
      },
      events: {
        id: 'events',
        title: 'Eventos Académicos',
        records: 6,
        lastUpdate: '11 Feb 2026',
      },
      awards: {
        id: 'awards',
        title: 'Premios y Reconocimientos',
        records: 4,
        lastUpdate: '09 Feb 2026',
      },
    });

    const activeSection = ref<SectionId>('personal');

    const completionPercentage = computed(() => {
      const all = Object.values(sectionsData.value);
      const total = all.length;
      const completed = all.filter((s) => s.records > 0).length;
      return Math.round((completed / total) * 100);
    });

    const handleChangeStep = (id: SectionId) => {
      activeSection.value = id;
    };

    const handleExportPdf = () => {
      alert('Exportar PDF (pendiente de integrar)');
    };

    return {
      activeSection,
      completionPercentage,
      handleChangeStep,
      handleExportPdf,
    };
  },
});
</script>

<style scoped>
/* (tu mismo CSS de la top bar y progress) */
.cvPage {
  width: 100%;
}

.cvTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 8px 4px 18px 4px;
}
.cvTop__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px 0;
}
.cvTop__progressRow {
  width: 100%;
}
.cvTop__progressInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.cvTop__progressLabel {
  font-size: 14px;
  color: var(--color-on-surface-variant, #667085);
}
.cvTop__progressValue {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary, #1b2e83);
}

.cvProgress {
  width: 100%;
  height: 10px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.12);
  border-radius: 999px;
  overflow: hidden;
}
.cvProgress__bar {
  height: 100%;
  background: var(--color-primary, #1b2e83);
  border-radius: 999px;
  transition: width 0.2s ease;
}
.btnExport {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}
</style>
