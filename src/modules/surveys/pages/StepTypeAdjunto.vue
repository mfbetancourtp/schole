<template>
  <AppLoading v-if="loading" />

  <div v-else-if="embedded" class="step-type-adjunto__embedded">
    <AppLoading v-if="loadingItems" />

    <template v-else>
      <div class="items">
        <AppCard v-for="(detail, index) in step?.detail" class="card-hover" :key="index">
          <template #body>
            <div class="d-flex justify-content-end">
              <span
                :class="{
                  'text-white bg-black': documentStatus(detail) === 'Pendiente',
                  'text-white custom-bg': documentStatus(detail) === 'Finalizado',
                  'text-dark bg-warning': documentStatus(detail) === 'En revisión',
                  'text-white bg-danger': documentStatus(detail) === 'Rechazado',
                  'text-white bg-success': documentStatus(detail) === 'Aprobado',
                }"
                class="rounded-pill px-2 py-1"
              >
                {{ documentStatus(detail) }}
              </span>
            </div>

            <h1 class="h5 lead tw-line-clamp-2">{{ detail.title }}</h1>
            <p class="tw-line-clamp-3" v-html="linkifyHtml(detail.description ?? '', { target: '_blank' })"></p>

            <template v-if="(detail.enrolAttachment || selectedFile) && currentData?.id == detail.id">
              <a :disabled="!!selectedFile" :href="detail.enrolAttachment?.urlAttachment" class="tw-line-clamp-3" target="_blank">
                {{ detail.enrolAttachment?.title ?? selectedFile.name ?? '' }}
              </a>
            </template>

            <template v-else-if="detail.enrolAttachment">
              <a :href="detail.enrolAttachment?.urlAttachment" class="tw-line-clamp-3" target="_blank">
                {{ detail.enrolAttachment?.title ?? selectedFile.name ?? '' }}
              </a>
            </template>
            <a v-else-if="detail.urlTemplate" :href="detail.urlTemplate" class="tw-line-clamp-3" target="_blank">
              {{ detail.urlTemplate ? 'Plantilla' : '' }}
            </a>
          </template>

          <template #footer>
            <div v-if="!detail.enrolAttachment?.urlAttachment" class="d-flex justify-content-end">
              <div>
                <AppButtonGroup>
                  <input type="file" id="inputFile" style="display: none" @change="selectFile($event)" />
                  <AppButton :disabled="approvedOrInReviewStep && !incompleteStep" @click="clickInputFile(detail)" :label="'core.select'"></AppButton>
                  <AppButton :disabled="approvedOrInReviewStep && !incompleteStep" :label="'core.upload'" @click="uploadFile()" outlined> </AppButton>
                </AppButtonGroup>
              </div>
            </div>

            <div v-if="detail.enrolAttachment?.urlAttachment" class="d-flex justify-content-start">
              <div>
                <AppButton :label="'core.delete'" :disabled="detail.enrolAttachment && detail.enrolAttachment.isAccept === 1" @click="openConfirmDelete(detail)"></AppButton>
              </div>
            </div>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="currentData?.enrolAttachment.title" @confirmDelete="confirmDelete()" @close="modalDelete = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </div>

  <AppBaseList v-else :title="title" :routes="routes" :use-banner="true" :urlBanner="urlBanner">
    <template v-slot:actions>
      <AppButtonBack :to="backRoute" />

      <SaveAndExitStep
        style="color: white"
        :disabled="incompleteStep || (!incompleteStep && allFilesApproved)"
        :route-back="backRoute"
        :convocation-enrol-id="convocationEnrolId"
        :convocation-step-id="stepId"
      />
    </template>

    <template v-slot:content>
      <AppLoading v-if="loadingItems" />

      <template v-else>
        <div class="items">
          <AppCard v-for="(detail, index) in step?.detail" class="card-hover" :key="index">
            <template #body>
              <div class="d-flex justify-content-end">
                <span
                  :class="{
                    'text-white bg-black': documentStatus(detail) === 'Pendiente',
                    'text-white custom-bg': documentStatus(detail) === 'Finalizado',
                    'text-dark bg-warning': documentStatus(detail) === 'En revisión',
                    'text-white bg-danger': documentStatus(detail) === 'Rechazado',
                    'text-white bg-success': documentStatus(detail) === 'Aprobado',
                  }"
                  class="rounded-pill px-2 py-1"
                >
                  {{ documentStatus(detail) }}
                </span>
              </div>

              <h1 class="h5 lead tw-line-clamp-2">{{ detail.title }}</h1>
              <p class="tw-line-clamp-3" v-html="linkifyHtml(detail.description ?? '', { target: '_blank' })"></p>

              <template v-if="(detail.enrolAttachment || selectedFile) && currentData?.id == detail.id">
                <a :disabled="!!selectedFile" :href="detail.enrolAttachment?.urlAttachment" class="tw-line-clamp-3" target="_blank">
                  {{ detail.enrolAttachment?.title ?? selectedFile.name ?? '' }}
                </a>
              </template>

              <template v-else-if="detail.enrolAttachment">
                <a :href="detail.enrolAttachment?.urlAttachment" class="tw-line-clamp-3" target="_blank">
                  {{ detail.enrolAttachment?.title ?? selectedFile.name ?? '' }}
                </a>
              </template>
              <a v-else-if="detail.urlTemplate" :href="detail.urlTemplate" class="tw-line-clamp-3" target="_blank">
                {{ detail.urlTemplate ? 'Plantilla' : '' }}
              </a>
            </template>

            <template #footer>
              <div v-if="!detail.enrolAttachment?.urlAttachment" class="d-flex justify-content-end">
                <div>
                  <AppButtonGroup>
                    <input type="file" id="inputFile" style="display: none" @change="selectFile($event)" />
                    <AppButton :disabled="approvedOrInReviewStep && !incompleteStep" @click="clickInputFile(detail)" :label="'core.select'"></AppButton>
                    <AppButton :disabled="approvedOrInReviewStep && !incompleteStep" :label="'core.upload'" @click="uploadFile()" outlined> </AppButton>
                  </AppButtonGroup>
                </div>
              </div>

              <div v-if="detail.enrolAttachment?.urlAttachment" class="d-flex justify-content-start">
                <div>
                  <AppButton :label="'core.delete'" :disabled="detail.enrolAttachment && detail.enrolAttachment.isAccept === 1" @click="openConfirmDelete(detail)"></AppButton>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
      </template>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="currentData?.enrolAttachment.title" @confirmDelete="confirmDelete()" @close="modalDelete = false"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import linkifyHtml from 'linkify-html';
import { useRoute } from 'vue-router';
import * as linkify from 'linkifyjs';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import SaveAndExitStep from '../components/SaveAndExitStep.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ConvocationDto } from '../dtos/convocation.dto';
import { StepTypeAdjuntoDto, DetailDto } from '../dtos/stepTypeAdjunto.dto';

// import { VariantsConstant } from '../../../shared/constant/variants.constant';
import { GetConvocationByIdService } from '../services/getConvocationById.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import { DeleteFileTypeAttachmentService } from '../services/deleteFileTypeAttachment.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { CreateOrUpdateStepTypeAttachmentService } from '../services/createOrUpdateStepTypeAttachment.service';
import { buildRegistrationRoute, isModernRegistrationFlow } from '../utils/registrationFlow.utils';

const createOrUpdateStepTypeAttachmentService = new CreateOrUpdateStepTypeAttachmentService();
const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const deleteFileTypeAttachmentService = new DeleteFileTypeAttachmentService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getConvocationByIdService = new GetConvocationByIdService();
const getInstitutionByIdService = new GetInstitutionByIdService();

export default defineComponent({
  name: 'StepTypeAdjunto',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    AppConfirmDeleteModal,
    SaveAndExitStep,
    AppButtonGroup,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const routes: any[] = [{ name: '' }];
    useMeta({ title: 'Paso: Adjunto' });

    const convocation: Ref<ConvocationDto | null> = ref(null);
    const step: Ref<StepTypeAdjuntoDto | null> = ref(null);
    const currentData: Ref<DetailDto | null> = ref(null);
    const selectedFile: Ref<any> = ref(null);

    const convocationEnrolId = ref();
    const convocationId = ref();
    const institutionId = ref();
    const urlBanner = ref('');
    const title = ref();
    const stepId = ref();

    const approvedOrInReviewStep = ref(false);
    const allFilesApproved = ref(false);
    const incompleteStep = ref(false);
    const loadingItems = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);
    const useModernRegistration = computed(() => isModernRegistrationFlow(route.query));
    const backRoute = computed(() =>
      buildRegistrationRoute(
        {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
          convocationEnrollId: convocationEnrolId.value,
        },
        useModernRegistration.value
      )
    );

    onMounted(async () => {
      try {
        convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
        institutionId.value = parseInt(route.params.institutionId.toString(), 10);
        stepId.value = parseInt(String(route.params.stepId ?? route.query.stepId), 10);

        let params2 = {
          convocationEnrolId: convocationEnrolId.value,
          isAdmin: isAdmin.value,
        };

        const response = await getConvocationWithStepsService.run(convocationId.value, params2);
        const stepAux = response.steps.filter((item: any) => item.id == stepId.value)[0];

        approvedOrInReviewStep.value = (stepAux.isApproved == 1 && stepAux.requiresApproval == 1) || (stepAux.isApproved == null && stepAux.requiresApproval == 1) ? true : false;

        await getDetailStep();

        title.value = step.value?.title;

        if (!props.embedded) {
          await loadRoutes();
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getDetailStep = async () => {
      loadingItems.value = true;

      let params = {
        id: stepId.value,
        convocationEnrolId: convocationEnrolId.value,
      };

      step.value = await getConvocationStepWithDetailService.run(params);
      incompleteStep.value = false;

      if (step.value && step.value.requiresApproval) {
        for (let i = 0; i < step.value.detail.length; i++) {
          const detail: any = step.value.detail[i];

          if (detail.enrolAttachment === null || (detail.enrolAttachment && detail.enrolAttachment.isAccept === 0)) {
            incompleteStep.value = true;
            break;
          }
        }
      }

      if (step.value) {
        allFilesApproved.value = step.value.detail.every((detail: any) => {
          return detail.enrolAttachment?.isAccept === 1;
        });
      }

      loadingItems.value = false;
    };

    const clickInputFile = (data: DetailDto) => {
      currentData.value = data;

      let inputFile = document.getElementById('inputFile');
      if (inputFile != null) inputFile.click();
    };
    const selectFile = (event: any) => {
      const files = event.target.files;
      if (!files.length) return;

      selectedFile.value = files[0];
    };

    const openConfirmDelete = async (data: any) => {
      currentData.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteFileTypeAttachmentService.run(currentData.value?.enrolAttachment.id);
      modalDelete.value = false;

      await getDetailStep();
    };

    const uploadFile = async () => {
      let dataSend = {
        convocationEnrolId: convocationEnrolId.value,
        convocationStepId: stepId.value,
        requirementId: currentData.value?.id,
        file: selectedFile.value,
      };

      await createOrUpdateStepTypeAttachmentService.run(dataSend);

      selectedFile.value = null;
      currentData.value = null;

      await getDetailStep();
    };

    const loadRoutes = async () => {
      convocation.value = await getConvocationByIdService.run(convocationId.value);
      urlBanner.value = convocation.value?.urlBanner ?? convocation.value?.thumbnail;
      let response = await getInstitutionByIdService.run(institutionId.value);

      routes[0].name = title.value;

      routes.unshift(
        {
          name: `Procesos de matriculación colegio ${response.institution.name}`,
          url: {
            name: 'surveys.userConvocations',
            params: { institutionId: institutionId.value },
          },
        },
        {
          name: `Proceso de matriculación "${convocation.value?.title}"`,
          url: backRoute.value,
        }
      );
    };

    const buttonDisabled = (step: any): boolean => {
      if (step.detail !== null) {
        const detailsLength = step.detail.length;
        let lengthDetails = 0;

        for (const detail of step.detail) {
          if (detail.enrolAttachment !== null) lengthDetails += 1;
        }

        if (detailsLength === lengthDetails) {
          const isAccepted = step.detail.every((detail: any) => {
            return detail.enrolAttachment?.isAccept === 1 || detail.enrolAttachment?.isAccept === null;
          });

          const isReview = step.detail.some((detail: any) => {
            return detail.enrolAttachment?.isAccept === 0;
          });

          return isAccepted || isReview;
        }
      }

      return true;
    };

    const documentStatus = (detail: any) => {
      if (detail.enrolAttachment === null) {
        return 'Pendiente';
      } else if (!step.value?.requiresApproval) {
        return 'Finalizado';
      } else if (detail.enrolAttachment.isAccept === null) {
        return 'En revisión';
      } else if (detail.enrolAttachment.isAccept === 0) {
        return 'Rechazado';
      } else {
        return 'Aprobado';
      }
    };

    return {
      approvedOrInReviewStep,
      buttonDisabled,
      loadingItems,
      routes,
      stepId,
      title,
      t,

      convocationEnrolId,
      allFilesApproved,
      incompleteStep,
      institutionId,
      convocationId,
      selectedFile,
      currentData,
      convocation,
      backRoute,
      modalDelete,
      urlBanner,
      loading,
      step,

      openConfirmDelete,
      documentStatus,
      clickInputFile,
      confirmDelete,
      selectFile,
      uploadFile,

      linkifyHtml,
      linkify,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 25rem), 1fr));
}

.custom-bg {
  background-color: #00b0da;
}
</style>
