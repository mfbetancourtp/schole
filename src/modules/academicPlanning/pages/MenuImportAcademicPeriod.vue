<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'academicPlanning.academicPeriods' }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <!-- Page header -->
        <div class="import-header">
          <h2 class="import-header__title">Importación de datos del periodo académico</h2>
          <p class="import-header__desc">Desde esta sección puedes importar o copiar la información necesaria para configurar un nuevo periodo académico.</p>
        </div>

        <!-- Cards grid -->
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <!-- Oferta académica -->
          <div class="col">
            <AppCard class="h-100">
              <template #body>
                <div class="import-card">
                  <div class="import-card__icon-wrap">
                    <AppIcon icon="graduation-cap" class="import-card__icon" />
                  </div>
                  <h5 class="import-card__title">
                    {{ t('core.generalTerms.academic.academicOffer.singular') }}
                  </h5>
                  <p class="import-card__desc">Importa o copia la oferta de cursos que estarán disponibles en el periodo académico.</p>
                  <div class="d-grid gap-2 mt-auto">
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importTemplateAcademicOffer',
                        params: { academicPeriodId },
                      }"
                      variant="primary"
                      :outlined="false"
                      >Importar plantilla de cursos</AppButton
                    >
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importCopyAcademicOffer',
                        params: { academicPeriodId },
                      }"
                      outlined
                      >Copiar ofertas anteriores</AppButton
                    >
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- Gestión de usuarios -->
          <div class="col">
            <AppCard class="h-100">
              <template #body>
                <div class="import-card">
                  <div class="import-card__icon-wrap">
                    <AppIcon icon="users" class="import-card__icon" />
                  </div>
                  <h5 class="import-card__title">
                    {{ t('access.users.title') }}
                  </h5>
                  <p class="import-card__desc">Administra la información de usuarios necesaria para el nuevo periodo.</p>
                  <div class="d-grid gap-2 mt-auto">
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importTemplateTeachers',
                        params: { academicPeriodId },
                      }"
                      variant="primary"
                      :outlined="false"
                      >Importar docentes</AppButton
                    >
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importTemplateStudents',
                        params: { academicPeriodId },
                      }"
                      outlined
                      >Importar estudiantes</AppButton
                    >
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importTemplateParents',
                        params: { academicPeriodId },
                      }"
                      outlined
                      >Importar acudientes</AppButton
                    >
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- Carga académica -->
          <div class="col">
            <AppCard class="h-100">
              <template #body>
                <div class="import-card">
                  <div class="import-card__icon-wrap">
                    <AppIcon icon="chalkboard" class="import-card__icon" />
                  </div>
                  <h5 class="import-card__title">
                    {{ t('core.generalTerms.academic.subjectAssignment.singular') }}
                  </h5>
                  <p class="import-card__desc">Importa o copia la asignación de docentes a las asignaturas del periodo.</p>
                  <div class="d-grid gap-2 mt-auto">
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importTemplateSubjectAssignments',
                        params: { academicPeriodId },
                      }"
                      variant="primary"
                      :outlined="false"
                      >Importar carga académica</AppButton
                    >
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importCopyAcademicCarga',
                        params: { academicPeriodId },
                      }"
                      outlined
                      >Copiar carga anterior</AppButton
                    >
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- Horario de clases -->
          <div class="col">
            <AppCard class="h-100">
              <template #body>
                <div class="import-card">
                  <div class="import-card__icon-wrap">
                    <AppIcon icon="calendar-alt" class="import-card__icon" />
                  </div>
                  <h5 class="import-card__title">
                    {{ t('core.generalTerms.academic.clasroom.singular') }}
                  </h5>
                  <p class="import-card__desc">Importa o replica la programación de horarios para el nuevo periodo académico.</p>
                  <div class="d-grid gap-2 mt-auto">
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importTemplateSubjectClasroom',
                        params: { academicPeriodId },
                      }"
                      variant="primary"
                      :outlined="false"
                      >Importar horario</AppButton
                    >
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importCopyTemplateSubjectClasroom',
                        params: { academicPeriodId },
                      }"
                      outlined
                      >Copiar horario anterior</AppButton
                    >
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- Competencias y performance -->
          <div class="col">
            <AppCard class="h-100">
              <template #body>
                <div class="import-card">
                  <div class="import-card__icon-wrap">
                    <AppIcon icon="chart-bar" class="import-card__icon" />
                  </div>
                  <h5 class="import-card__title">
                    {{ t('core.competencesandperformance.singular') }}
                  </h5>
                  <p class="import-card__desc">Copia la configuración de competencias y métricas de desempeño del periodo anterior.</p>
                  <div class="d-grid gap-2 mt-auto">
                    <AppButton
                      :to="{
                        name: 'academicPlanning.importCopyTemplateSubjectClasroom',
                        params: { academicPeriodId },
                      }"
                      variant="primary"
                      :outlined="false"
                      >Copiar configuración anterior</AppButton
                    >
                  </div>
                </div>
              </template>
            </AppCard>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { GetAcademicPeriodsWithPeriodsService } from '../services/getAcademicPeriodsWithPeriods.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsWithPeriodsService = new GetAcademicPeriodsWithPeriodsService();

export default defineComponent({
  name: 'MenuImportAcademicPeriod',
  components: {
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCard,
    AppIcon,
  },

  setup() {
    const title = ref('temp');
    const { t } = useI18n();
    const loading = ref(true);

    const routes: any[] = [{ name: '' }];
    useMeta({ title: 'Importación de ciclo académico' });

    const academicPeriodId = ref();
    const route = useRoute();

    onMounted(async () => {
      try {
        academicPeriodId.value = parseInt(route.params.academicPeriodId.toString(), 10);
        await loadRoutes();
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Año Académico', url: '' };
        headerStorage.moduleSubItem = { name: title.value, url: '' };
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    const loadRoutes = async () => {
      try {
        const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsService.run();

        academicPeriodsWithPeriods.academicPeriods.forEach((academicPeriod: AcademicPeriodDto) => {
          if (academicPeriodId.value == academicPeriod.id) {
            title.value = `Importar información a "${academicPeriod.name}"`;
          }
        });
      } catch (e) {
        console.log(e);
      }

      routes[0].name = title.value;

      routes.unshift({
        name: `academicPlanning.academicPeriods.name`,
        url: { name: 'academicPlanning.academicPeriods' },
      });
    };

    return {
      academicPeriodId,
      loading,
      routes,
      title,
      t,
    };
  },
});
</script>

<style scoped>
/* ── Page header ── */
.import-header {
  margin-bottom: 2rem;
  padding-top: 0.75rem;
}

.import-header__title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.3;
}

.import-header__desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-gray-500, #6b7280);
  line-height: 1.5;
}

/* ── Button hover: force white text on filled and outlined ── */
:deep(.o-btn--primary:hover) {
  color: #ffffff !important;
}

/* ── Card hover ── */
:deep(.appcard-container) {
  transition: transform 0.2s ease;
}

:deep(.appcard-container .content) {
  transition: box-shadow 0.2s ease;
}

:deep(.appcard-container:hover) {
  transform: translateY(-4px);
}

:deep(.appcard-container:hover .content) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;
}

/* ── Card body ── */
.import-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
}

.import-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(var(--color-primary-rgb), 0.12);
  margin: 0 auto 1rem;
}

.import-card__icon {
  font-size: 1.4rem;
  color: var(--color-primary);
}

.import-card__title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
}

.import-card__desc {
  margin: 0 0 1.25rem;
  font-size: 0.85rem;
  color: var(--color-gray-500, #6b7280);
  line-height: 1.5;
  flex-grow: 1;
}
</style>
