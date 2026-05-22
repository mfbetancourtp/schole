<template>
  <AppLoading v-if="loading"></AppLoading>

  <div v-else>
    <AppBaseList :title="title" :routes="routes" :subtitle="subtitle" :use-banner="true" :urlBanner="urlBanner">
      <template #actions>
        <template v-if="!isAdmin">
          <AppButtonBack :to="{ name: 'surveys.userConvocations' }" />
        </template>
        <template v-else>
          <AppButton style="color: white" label="Volver al administrador" @click="backToAdministrator" />
        </template>
      </template>

      <template #content>
        <template v-if="convocation">
          <div>
            <AppCard class="mb-3 step-card">
              <template #body>
                <section style="color: #f43f5e; font-size: 20px" v-html="convocation.title"></section>
                <section v-html="convocation.description"></section>
                <section>{{ subtitle }}</section>
              </template>
            </AppCard>
          </div>
        </template>

        <section class="mb-2 step-container" v-for="(step, index) in steps" :key="index">
          <AppCard class="card-hover">
            <template #body>
              <div class="step-detail-container">
                <AppCard class="step-card">
                  <template #body>
                    <div class="d-flex flex-row justify-content-end align-items-end">
                      <template v-if="step.convocationStepTypeId === 2 && step.statePayment">
                        <span class="pago" :class="getStatePaymentColor(step.statePayment)">Transacción: {{ step.statePayment }}</span>
                      </template>

                      <template v-if="step.convocationStepTypeId === 1 || step.convocationStepTypeId === 2">
                        <template v-if="step.requiresApproval === 1 && step.isApproved === 1">
                          <span class="badge rounded-pill text-bg-primary bg-success">Aprobado</span>
                        </template>
                        <template v-else-if="step.requiresApproval === 1 && step.isApproved === 0">
                          <span class="badge rounded-pill text-bg-primary bg-danger">Detenido</span>
                        </template>
                        <template v-else-if="step.requiresApproval === 0 && step.isApproved === 0">
                          <span class="badge rounded-pill text-bg-primary bg-danger">Detenido</span>
                        </template>
                        <template v-else-if="step.requiresApproval === 0 && step.isApproved === 2">
                          <span
                            class="badge rounded-pill"
                            :style="{
                              backgroundColor: '#00b0da',
                              color: '#fff',
                            }"
                            >Finalizado</span
                          >
                        </template>
                        <template v-else-if="step.requiresApproval === 0 && step.isApproved === 1">
                          <span
                            class="badge rounded-pill"
                            :style="{
                              backgroundColor: '#00b0da',
                              color: '#fff',
                            }"
                            >Finalizado</span
                          >
                        </template>
                        <template v-else-if="step.requiresApproval === 1 && step.isApproved === null">
                          <span class="badge rounded-pill text-bg-primary bg-warning">En revisión</span>
                        </template>
                      </template>

                      <template v-if="step.convocationStepTypeId === 2 && step.requiresApproval === 0 && step.isApproved == null">
                        <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente</span>
                      </template>

                      <template
                        v-else-if="
                          (step.convocationStepTypeId === 3 || step.convocationStepTypeId === 4) &&
                          ((step.requiresApproval === 1 && step.isApproved === null) || (step.requiresApproval === 1 && step.isApproved === 1))
                        "
                      >
                        <span :class="['badge', 'rounded-pill', 'text-bg-primary', checkStatusColor(step)]">{{ checkAttachmentStatusApproval(step) }}</span>
                      </template>
                      <template v-else-if="(step.convocationStepTypeId === 3 || step.convocationStepTypeId === 4) && step.requiresApproval === 0 && step.isApproved === 2">
                        <span
                          class="badge rounded-pill"
                          :style="{
                            color: 'white',
                            backgroundColor: checkAttachmentStatus(step).color,
                          }"
                          >{{ checkAttachmentStatus(step).status }}</span
                        >
                      </template>

                      <template v-else-if="step.convocationStepTypeId === 4">
                        <template v-if="step.requiresApproval === 1 && step.isApproved === 0">
                          <span class="badge rounded-pill text-bg-primary bg-danger">Detenido</span>
                        </template>

                        <template v-else-if="step.requiresApproval === 0 && allFilesApproved(step)">
                          <span
                            class="badge rounded-pill"
                            :style="{
                              backgroundColor: '#00b0da',
                              color: '#fff',
                            }"
                            >Finalizado</span
                          >
                        </template>

                        <template v-else-if="step.requiresApproval === 0 && step.isApproved === null">
                          <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente</span>
                        </template>
                        <template v-else-if="typeof step.isApproved === 'string'">
                          <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente</span>
                        </template>
                      </template>

                      <template v-else-if="step.convocationStepTypeId === 3">
                        <template v-if="step.requiresApproval === 1 && step.isApproved === 0">
                          <span class="badge rounded-pill text-bg-primary bg-danger">Detenido</span>
                        </template>

                        <template v-else-if="step.requiresApproval === 0 && allFilesApproved(step)">
                          <span
                            class="badge rounded-pill"
                            :style="{
                              backgroundColor: '#00b0da',
                              color: '#fff',
                            }"
                            >Finalizado</span
                          >
                        </template>

                        <template v-else-if="step.requiresApproval === 0 && step.isApproved === null">
                          <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente</span>
                        </template>
                        <template v-else-if="typeof step.isApproved === 'string'">
                          <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente</span>
                        </template>
                      </template>

                      <template v-else-if="typeof step.isApproved === 'string'">
                        <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente</span>
                      </template>

                      <!-- <template v-else>
                        <span class="badge rounded-pill text-bg-primary bg-dark">Pendiente 3</span>
                      </template> -->
                    </div>

                    <p>{{ step.ConvocationStepType.name }}: {{ step.title }}</p>
                  </template>

                  <template #footer>
                    <AppButtonGroup>
                      <AppButton
                        v-if="convocation?.requiredOrder === 1"
                        v-tooltip="step.isApproved ? 'Ver Paso' : 'Diligenciar Paso'"
                        icon="external-link-alt"
                        variant="primary"
                        outlined
                        :to="{
                          name: 'surveys.userConvocations.registration.step' + step.ConvocationStepType.name,
                          params: {
                            stepId: step.id,
                            institutionId: institutionId,
                            convocationId: convocationId,
                            convocationEnrollId: convocationEnrolId,
                          },
                        }"
                        :disabled="nextStep(steps, index)"
                      ></AppButton>
                      <AppButton
                        v-else
                        v-tooltip="step.isApproved ? 'Ver Paso' : 'Diligenciar Paso'"
                        icon="external-link-alt"
                        variant="primary"
                        outlined
                        :to="{
                          name: 'surveys.userConvocations.registration.step' + step.ConvocationStepType.name,
                          params: {
                            stepId: step.id,
                            institutionId: institutionId,
                            convocationId: convocationId,
                            convocationEnrollId: convocationEnrolId,
                          },
                        }"
                      ></AppButton>
                    </AppButtonGroup>
                  </template>
                </AppCard>

                <section class="description-container">
                  <h5>Descripción:</h5>

                  <template v-if="step.description">
                    <div v-html="step.description"></div>
                  </template>

                  <span v-else>Sin descripción</span>
                </section>

                <section class="video-container">
                  <template v-if="step.urlVideoConvocationStep">
                    <template v-if="step.urlVideoConvocationStep.includes('youtube.com')">
                      <iframe :src="step.urlVideoConvocationStep" frameborder="0" allowfullscreen></iframe>
                    </template>

                    <template v-else>
                      <video-player :src="step.urlVideoConvocationStep" controls :height="170" />
                    </template>
                  </template>
                </section>
              </div>
            </template>
          </AppCard>
        </section>
      </template>
    </AppBaseList>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VideoPlayer } from '@videojs-player/vue'; // Documentacion: https://github.com/surmon-china/videojs-player/tree/main#usage-vue
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import 'video.js/dist/video-js.css';

import dayjs from 'dayjs';
import es from 'dayjs/locale/es';
import localeData from 'dayjs/plugin/localeData';

import { VariantsConstant } from '../../../shared/constant/variants.constant';
import { useHeaderStore } from '../../../stores/header.store';

// import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { ConvocationStepsDto, StepDto } from '../dtos/convocationWithSteps.dto';

import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';

dayjs.locale(es);
dayjs.extend(localeData);

const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getInstitutionByIdService = new GetInstitutionByIdService();

export default defineComponent({
  name: 'RegistrationStepsConvocation',
  components: {
    AppButtonGroup,
    AppButtonBack,
    VideoPlayer,
    AppBaseList,
    AppLoading,
    AppButton,
    // AppBadge,
    AppCard,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const routes: any = [{ name: '' }];
    useMeta({ title: 'Proceso de matriculación' });
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const convocation: Ref<ConvocationStepsDto | null> = ref(null);
    const steps: Ref<StepDto[]> = ref([]);

    const convocationEnrolId = ref();
    const institutionId = ref();
    const convocationId = ref();
    const urlBanner = ref('');
    const subtitle = ref('');
    const title = ref('');

    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Formularios', url: '' };
        headerStorage.moduleItem = {
          name: 'Configuración y procesos de admisión',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title.value, url: '' };

        convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
        institutionId.value = parseInt(route.params.institutionId.toString(), 10);

        let params = {
          convocationEnrolId: convocationEnrolId.value,
          isAdmin: isAdmin.value,
        };

        convocation.value = await getConvocationWithStepsService.run(convocationId.value, params);
        urlBanner.value = convocation.value?.urlBanner ?? convocation.value?.thumbnail;

        await filterSteps();
        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const filterSteps = () => {
      let skipStep = false;

      convocation.value?.steps.forEach((step: StepDto) => {
        steps.value.push(step);
      });
    };

    const backToAdministrator = async () => {
      localStorage.removeItem('administratorAsStudent');

      await router.push({
        name: 'surveys.adminConvocationSummaryInscritos',
        params: { convocationId: convocationId.value },
      });
    };

    const loadRoutes = async () => {
      let response = await getInstitutionByIdService.run(institutionId.value);

      title.value = `Proceso de matriculación "${convocation.value?.title}"`;
      subtitle.value = `Fecha de cierre: ${dayjs(convocation.value?.endDate).locale('es').format('D MMMM YYYY')}`;

      routes[0].name = title.value;

      if (!isAdmin.value) {
        routes.unshift({
          name: `Proceso de matriculación colegio ${response.institution.name}`,
          url: {
            name: 'surveys.userConvocations',
          },
          params: { institutionId: institutionId.value },
        });
      }
    };
    const buildStatusVariant = (isApproved: string): VariantsConstant => {
      const colors: { [key: string]: VariantsConstant } = {
        null: 'dark',
        '0': 'danger',
      };
      return colors[isApproved] ?? 'success';
    };
    const checkAttachmentStatus = (step: any) => {
      const statusColors = {
        Pendiente: 'black',
        Finalizado: '#00b0da',
      };

      if (step.convocationStepTypeId === 4) {
        if (step.detail !== null) {
          const detailsLength = step.detail.length;
          let lengthDetails = 0;
          for (const detail of step.detail) {
            if (detail.enrolAttachment !== null) {
              lengthDetails += 1;
            }
          }
          if (detailsLength === lengthDetails) {
            return { status: 'Finalizado', color: statusColors['Finalizado'] };
          } else {
            return { status: 'Pendiente', color: statusColors['Pendiente'] };
          }
        }
      } else if (step.convocationStepTypeId === 3) {
        if (step.detail !== null) {
          const detailsLength = step.detail.length;
          let lengthDetails = 0;
          for (const detail of step.detail) {
            if (detail.enrolDocument?.urlSignedDocument !== null) {
              lengthDetails += 1;
            }
          }
          if (detailsLength === lengthDetails) {
            return { status: 'Finalizado', color: statusColors['Finalizado'] };
          } else {
            return { status: 'Pendiente', color: statusColors['Pendiente'] };
          }
        }
      }

      return { status: 'Pendiente', color: statusColors['Pendiente'] };
    };

    const checkAttachmentStatusApproval = (step: any) => {
      if (step.convocationStepTypeId === 4) {
        if (step.detail !== null) {
          const detailsLength = step.detail.length;
          let lengthDetails = 0;
          for (const detail of step.detail) {
            if (detail.enrolAttachment !== null) {
              lengthDetails += 1;
            }
          }
          if (detailsLength === lengthDetails) {
            if (step.requiresApproval === 1 && step.isApproved === null) {
              return 'En revisión';
            } else if (step.requiresApproval === 1 && step.isApproved === 0) {
              return 'Detenido';
            } else if (step.requiresApproval === 1 && step.isApproved === 1) {
              return 'Aprobado';
            } else {
              return 'Pendiente';
            }
          } else {
            return 'Pendiente';
          }
        }
      } else if (step.convocationStepTypeId === 3) {
        if (step.detail !== null) {
          const detailsLength = step.detail.length;
          let lengthDetails = 0;
          for (const detail of step.detail) {
            if (detail.enrolDocument !== null) {
              lengthDetails += 1;
            }
          }
          if (detailsLength === lengthDetails) {
            if (step.requiresApproval === 1 && step.isApproved === null) {
              return 'En revisión';
            } else if (step.requiresApproval === 1 && step.isApproved === 0) {
              return 'Detenido';
            } else if (step.requiresApproval === 1 && step.isApproved === 1) {
              return 'Aprobado';
            } else {
              return 'Pendiente';
            }
          } else {
            return 'Pendiente';
          }
        }
      }

      return 'Pendiente';
    };

    const checkStatusColor = (step: any) => {
      const statusColors = {
        Aprobado: 'bg-success',
        Pendiente: 'bg-dark',
        Detenido: 'bg-danger',
        'En revisión': 'bg-warning',
      };

      if (step.convocationStepTypeId === 4) {
        if (step.detail !== null) {
          const detailsLength = step.detail.length;
          let lengthDetails = 0;
          for (const detail of step.detail) {
            if (detail.enrolAttachment !== null) {
              lengthDetails += 1;
            }
          }
          if (detailsLength === lengthDetails) {
            if (step.requiresApproval === 1 && step.isApproved === null) {
              return statusColors['En revisión'];
            } else if (step.requiresApproval === 1 && step.isApproved === 0) {
              return statusColors['Detenido'];
            } else if (step.requiresApproval === 1 && step.isApproved === 1) {
              return statusColors['Aprobado'];
            } else {
              return statusColors['Pendiente'];
            }
          } else {
            return statusColors['Pendiente'];
          }
        }
      } else if (step.convocationStepTypeId === 3) {
        if (step.detail !== null) {
          const detailsLength = step.detail.length;
          let lengthDetails = 0;
          for (const detail of step.detail) {
            if (detail.enrolDocument !== null) {
              lengthDetails += 1;
            }
          }
          if (detailsLength === lengthDetails) {
            if (step.requiresApproval === 1 && step.isApproved === null) {
              return statusColors['En revisión'];
            } else if (step.requiresApproval === 1 && step.isApproved === 0) {
              return statusColors['Detenido'];
            } else if (step.requiresApproval === 1 && step.isApproved === 1) {
              return statusColors['Aprobado'];
            } else {
              return statusColors['Pendiente'];
            }
          } else {
            return statusColors['Pendiente'];
          }
        }
      }

      return statusColors['Pendiente'];
    };

    const getStatePaymentColor = (statePayment: string): string => {
      const stateColors: { [key: string]: string } = {
        Rechazada: 'bg-danger text-white',
        Aprobada: 'bg-success text-white',
        Recibida: 'bg-warning text- white',
      };

      return stateColors[statePayment] || '';
    };

    const allFilesApproved = (step: any): boolean => {
      if (Array.isArray(step.detail)) {
        const files: any[] = step.detail;

        const allCompletedFiles: boolean = files.every((detail: any) => {
          if ('enrolDocument' in detail) return detail.enrolDocument != null;
          if ('enrolAttachment' in detail) return detail.enrolAttachment != null;
        });

        return allCompletedFiles;
      }

      return false;
    };

    const nextStep = (steps: any, index: number): boolean => {
      console.log(`Ejecutando nextStep para el paso ${index}`);

      if (index === 0) {
        return false;
      }

      const previousStep = steps[index - 1];

      if (previousStep && previousStep.requiresApproval !== undefined && previousStep.isApproved !== undefined) {
        if (
          index > 0 &&
          (previousStep.requiresApproval === 0 || previousStep.requiresApproval === 1) &&
          (previousStep.isApproved === 1 || previousStep.isApproved === '' || previousStep.isApproved === 2)
        ) {
          return false;
        } else {
          console.log(`Paso ${index} bloqueado. requiresApproval: ${previousStep.requiresApproval}, isApproved: ${previousStep.isApproved}`);
        }
      } else {
        console.log(`Paso ${index} bloqueado debido a datos insuficientes en el paso anterior`);
      }

      return true;
    };

    return {
      urlBanner,
      subtitle,
      isAdmin,
      loading,
      routes,
      title,
      t,

      convocationEnrolId,
      checkAttachmentStatusApproval,
      checkStatusColor,
      convocationId,
      institutionId,
      convocation,
      steps,
      checkAttachmentStatus,
      getStatePaymentColor,

      backToAdministrator,
      buildStatusVariant,
      allFilesApproved,
      nextStep,
    };
  },
});
</script>

<style scoped>
.step-detail-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: stretch;
}

.step-detail-container .step-card {
  min-width: 17rem;
  max-width: 17rem;
}

.step-detail-container .description-container {
  max-height: 13rem;
  overflow-x: scroll;
  width: 100%;
}

.step-detail-container .video-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.step-detail-container .step-card {
  position: relative;
}

.step-detail-container .step-card .pago {
  position: absolute;
  bottom: 60px;
  left: 48px;
  transform: translate(-25%, 25%);
  padding: 0px 6px;
  font-size: 0.8rem;
  border-radius: 91rem;
  background-color: rgba(var(--bs-warning-rgb), var(--bs-bg-opacity));
  color: #ffffff;
}

.status-indicator {
  padding: 5px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
}

.o-base-list-wrapper {
  display: flex;
  gap: var(--gap-1);
  background-color: var(--color-light);
  border-bottom-width: var(--border-2);
  position: sticky;
  top: 10px;
  z-index: 5;
  padding: var(--padding-4);
}
</style>
