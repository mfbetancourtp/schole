<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton style="color: white" @click="handleExportPdf" variant="secondary">
        <AppIcon icon="file-download" />
        Exportar PDF
      </AppButton>
    </template>
    <template #content>
      <div class="cvPage">
        <!-- TOP BAR -->
        <div class="cvTop">
          <div class="cvTop__left w-100">
            <h2 class="cvTop__title">{{ title }}</h2>

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
        </div>

        <!-- BODY -->
        <div class="cvBody">
          <AppVerticalStepper :showFooter="false" sidebarWidth="260px" @changeStep="handleChangeStep" :useContentWrapper="false" :disablePadding="true">
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
            <AppVerticalStep name="CvTemplate" id="cvTemplate">
              <CvTemplateStep />
            </AppVerticalStep>
          </AppVerticalStepper>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { useHeaderStore } from '../../../stores/header.store';

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
import CvTemplateStep from '../components/steps/CvTemplateStep.vue';
import { useResumeStore } from '../stores/resume.store';
import { ProfessionalProfileCompletionDto } from '../dtos/professionalProfileCompletion.dto';
import { GetProfessionalProfileCompletionService } from '../services/getProfessionalProfileCompletion.service';

type SectionId = 'personal' | 'profile' | 'academic' | 'complementary' | 'experience' | 'teaching' | 'production' | 'events' | 'awards' | 'cvTemplate';

const getProfessionalProfileCompletionService = new GetProfessionalProfileCompletionService();

const emptyCompletionSummary = (): ProfessionalProfileCompletionDto => ({
  percentage: 0,
  totalModules: 8,
  completedModules: 0,
  modules: {
    ProfessionalProfile: false,
    AcademicBackground: false,
    SupplementaryTraining: false,
    WorkExperience: false,
    TeachingExperience: false,
    IntellectualProduction: false,
    AcademicEvents: false,
    Recognition: false,
  },
});

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
    CvTemplateStep,
  },
  setup() {
    const title = 'Hoja de Vida Docente';
    const resumeStore = useResumeStore();
    const activeSection = ref<SectionId>('personal');
    const completionSummary = ref<ProfessionalProfileCompletionDto>(emptyCompletionSummary());
    const completionRefreshTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

    const completionPercentage = computed(() => {
      return Number(completionSummary.value?.percentage ?? 0);
    });

    const getPeopleIdFromLocalStorage = () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;

        const user = JSON.parse(raw);
        return user?.people?.id ?? null;
      } catch (error) {
        console.log('Error obteniendo peopleId para completitud:', error);
        return null;
      }
    };

    const loadCompletionSummary = async () => {
      const peopleId = getPeopleIdFromLocalStorage();

      if (!peopleId) {
        completionSummary.value = emptyCompletionSummary();
        return;
      }

      try {
        completionSummary.value = await getProfessionalProfileCompletionService.run(peopleId);
      } catch (error) {
        console.log('Error cargando completitud de hoja de vida:', error);
        completionSummary.value = emptyCompletionSummary();
      }
    };

    const scheduleCompletionRefresh = () => {
      if (completionRefreshTimeout.value) {
        clearTimeout(completionRefreshTimeout.value);
      }

      completionRefreshTimeout.value = setTimeout(() => {
        loadCompletionSummary();
      }, 250);
    };

    const handleChangeStep = (id: SectionId) => {
      activeSection.value = id;
    };

    const handleExportPdf = () => {
      alert('Exportar PDF (pendiente de integrar)');
    };

    onMounted(() => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Hoja de vida', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log('error configurando header:', e);
      }

      loadCompletionSummary();
    });

    watch(
      () => [
        resumeStore.profile,
        resumeStore.academic.length,
        resumeStore.complementary.length,
        resumeStore.experience.length,
        resumeStore.teaching.length,
        resumeStore.publications.length,
        resumeStore.events.length,
        resumeStore.awards.length,
      ],
      () => {
        scheduleCompletionRefresh();
      }
    );

    onBeforeUnmount(() => {
      if (completionRefreshTimeout.value) {
        clearTimeout(completionRefreshTimeout.value);
      }
    });

    return {
      title,
      activeSection,
      completionSummary,
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
