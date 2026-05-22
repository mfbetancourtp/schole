<template>
  <AppLoading v-if="loading"></AppLoading>

  <div v-else-if="embedded" class="step-type-documento__embedded">
    <div class="row d-flex flex-column">
      <section>
        <AppCard
          v-for="(detail, index) in step?.detail"
          :key="index"
          v-bind:class="{
            'borde-left': currentDocument.value?.id == detail.id,
          }"
          @click="changeCurrentDocument(detail)"
          class="card-hover mt-1 mb-1 pointer"
        >
          <template #body>
            <div v-if="detail.enrolDocument" class="d-flex justify-content-end">
              <span
                :class="{
                  'text-white bg-black': documentStatus(detail) === 'Pendiente',
                  'text-white custom-bg': documentStatus(detail) === 'Finalizado',
                  'text-dark bg-warning': documentStatus(detail) === 'En revisión',
                  'text-white bg-danger': documentStatus(detail) === 'Rechazado',
                  'text-white bg-success': documentStatus(detail) === 'Aprobado',
                }"
                class="rounded-pill px-2 py-1"
                >{{
                  detail.enrolDocument == null
                    ? 'Pendiente'
                    : !step?.requiresApproval
                    ? 'Finalizado'
                    : detail.enrolDocument.isAccept == null && !detail.enrolDocument.urlSignedDocument
                    ? 'Pendiente'
                    : detail.enrolDocument.isAccept == null
                    ? 'En revisión'
                    : detail.enrolDocument.isAccept === 0
                    ? 'Rechazado'
                    : 'Aprobado'
                }}</span
              >
            </div>

            <h5>{{ detail.title }}</h5>
          </template>
        </AppCard>
      </section>

      <section>
        <AppLoading v-if="loadingStep"></AppLoading>

        <AppCard v-else class="h-100">
          <template #body>
            <iframe
              :src="
                currentDocument.value?.enrolDocument?.urlSignedDocument ??
                currentDocument.value?.enrolDocument?.urlDocumentWithSigners ??
                currentDocument.value?.enrolDocument?.urlDocument ??
                currentDocument.value?.filePdf.file
              "
              style="width: 100%; height: 61rem; border: none"
            ></iframe>

            <hr />

            <div v-if="currentDocument.value?.signers.length">
              <h4 class="m-0">Lista de firmantes</h4>

              <div class="items mt-2">
                <AppCard v-for="(signer, index) in currentDocument.value.signers" :key="index">
                  <template #body>
                    <div class="d-flex justify-content-end">
                      <span
                        class="badge rounded-pill text-bg-primary"
                        v-bind:class="{
                          'bg-dark': !signer.assigned,
                          'bg-success': signer.assigned,
                        }"
                      >
                        {{ !signer.assigned ? 'Pendiente' : 'Asignado' }}
                      </span>
                    </div>

                    <div class="d-flex align-items-center">
                      <AppIcon icon="user-circle" class="text-primary me-3 fs-5" />

                      <h5 class="mb-0">{{ signer.code }}</h5>
                    </div>

                    <span>{{ signer.description }}</span>
                  </template>

                  <template #footer>
                    <div class="d-flex flex-column align-items-end">
                      <AppButton
                        :disabled="(currentDocument.value?.enrolDocument?.isAccept ? true : false) || approvedStep"
                        v-tooltip="'Asignar firmante'"
                        icon="file-signature"
                        @click="openModalSignDocument(signer)"
                        outlined
                      ></AppButton>
                    </div>
                  </template>
                </AppCard>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="d-flex justify-content-end gap-1">
              <div>
                <input type="file" id="inputFile" style="display: none" @change="uploadSignedDocument($event)" />
                <AppButton
                  v-if="currentDocument.value?.signers.length && !step?.electronicSignature"
                  :disabled="currentDocument.value?.enrolDocument?.isAccept || !allowToSign ? true : false || approvedStep"
                  :label="'Subir documento firmado'"
                  @click="clickInputFile()"
                ></AppButton>
              </div>

              <AppButton
                v-if="currentDocument.value?.signers.length && step?.electronicSignature"
                :disabled="currentDocument.value?.enrolDocument?.isAccept || !allowToSign ? true : false || approvedStep"
                @click="signDocument()"
                :label="'Firmar'"
              ></AppButton>

              <AppButton :href="currentDocument.value?.file.file" :label="'Descargar'" target="_blank" outlined></AppButton>
            </div>
          </template>
        </AppCard>
      </section>
    </div>
  </div>

  <AppBaseList v-else :title="title" :routes="routes" :use-banner="true" :url-banner="urlBanner">
    <template v-slot:actions>
      <AppButtonBack :to="backRoute"></AppButtonBack>
      <SaveAndExitStep style="color: white" :disabled="approvedStep" :route-back="backRoute" :convocation-enrol-id="convocationEnrolId" :convocation-step-id="stepId"></SaveAndExitStep>
    </template>

    <template v-slot:content>
      <div class="row d-flex flex-column">
        <section>
          <AppCard
            v-for="(detail, index) in step?.detail"
            :key="index"
            v-bind:class="{
              'borde-left': currentDocument.value?.id == detail.id,
            }"
            @click="changeCurrentDocument(detail)"
            class="card-hover mt-1 mb-1 pointer"
          >
            <template #body>
              <div v-if="detail.enrolDocument" class="d-flex justify-content-end">
                <span
                  :class="{
                    'text-white bg-black': documentStatus(detail) === 'Pendiente',
                    'text-white custom-bg': documentStatus(detail) === 'Finalizado',
                    'text-dark bg-warning': documentStatus(detail) === 'En revisión',
                    'text-white bg-danger': documentStatus(detail) === 'Rechazado',
                    'text-white bg-success': documentStatus(detail) === 'Aprobado',
                  }"
                  class="rounded-pill px-2 py-1"
                  >{{
                    detail.enrolDocument == null
                      ? 'Pendiente'
                      : !step?.requiresApproval
                      ? 'Finalizado'
                      : detail.enrolDocument.isAccept == null && !detail.enrolDocument.urlSignedDocument
                      ? 'Pendiente'
                      : detail.enrolDocument.isAccept == null
                      ? 'En revisión'
                      : detail.enrolDocument.isAccept === 0
                      ? 'Rechazado'
                      : 'Aprobado'
                  }}</span
                >
              </div>

              <h5>{{ detail.title }}</h5>
            </template>
          </AppCard>
        </section>

        <section>
          <AppLoading v-if="loadingStep"></AppLoading>

          <AppCard v-else class="h-100">
            <template #body>
              <iframe
                :src="
                  currentDocument.value?.enrolDocument?.urlSignedDocument ??
                  currentDocument.value?.enrolDocument?.urlDocumentWithSigners ??
                  currentDocument.value?.enrolDocument?.urlDocument ??
                  currentDocument.value?.filePdf.file
                "
                style="width: 100%; height: 61rem; border: none"
              ></iframe>

              <hr />

              <div v-if="currentDocument.value?.signers.length">
                <h4 class="m-0">Lista de firmantes</h4>

                <div class="items mt-2">
                  <AppCard v-for="(signer, index) in currentDocument.value.signers" :key="index">
                    <template #body>
                      <div class="d-flex justify-content-end">
                        <span
                          class="badge rounded-pill text-bg-primary"
                          v-bind:class="{
                            'bg-dark': !signer.assigned,
                            'bg-success': signer.assigned,
                          }"
                        >
                          {{ !signer.assigned ? 'Pendiente' : 'Asignado' }}
                        </span>
                      </div>

                      <div class="d-flex align-items-center">
                        <AppIcon icon="user-circle" class="text-primary me-3 fs-5" />

                        <h5 class="mb-0">{{ signer.code }}</h5>
                      </div>

                      <span>{{ signer.description }}</span>
                    </template>

                    <template #footer>
                      <div class="d-flex flex-column align-items-end">
                        <AppButton
                          :disabled="(currentDocument.value?.enrolDocument?.isAccept ? true : false) || approvedStep"
                          v-tooltip="'Asignar firmante'"
                          icon="file-signature"
                          @click="openModalSignDocument(signer)"
                          outlined
                        ></AppButton>
                      </div>
                    </template>
                  </AppCard>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end gap-1">
                <div>
                  <input type="file" id="inputFile" style="display: none" @change="uploadSignedDocument($event)" />
                  <AppButton
                    v-if="currentDocument.value?.signers.length && !step?.electronicSignature"
                    :disabled="currentDocument.value?.enrolDocument?.isAccept || !allowToSign ? true : false || approvedStep"
                    :label="'Subir documento firmado'"
                    @click="clickInputFile()"
                  ></AppButton>
                </div>

                <AppButton
                  v-if="currentDocument.value?.signers.length && step?.electronicSignature"
                  :disabled="currentDocument.value?.enrolDocument?.isAccept || !allowToSign ? true : false || approvedStep"
                  @click="signDocument()"
                  :label="'Firmar'"
                ></AppButton>

                <AppButton :href="currentDocument.value?.file.file" :label="'Descargar'" target="_blank" outlined></AppButton>
              </div>
            </template>
          </AppCard>
        </section>
      </div>
    </template>
  </AppBaseList>

  <AppModal v-model="modalSignDocument" :size="'lg'">
    <SignDocument v-if="modalSignDocument" :data="currentSigner.value" @close="closMmodalSignDocument"></SignDocument>
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import SignDocument from '../components/SignDocument.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import SaveAndExitStep from '../components/SaveAndExitStep.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { ConvocationDto } from '../dtos/convocation.dto';
import { StepTypeDocumentoDto, DetailDto, SignerDto } from '../dtos/stepTypeDocumento.dto';

import { SignDocumentService } from '../services/signDocument.service';
import { UploadFileStepDocumentService } from '../services/uploadFileStepDocument.service';
import { GetConvocationByIdService } from '../services/getConvocationById.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import { GetConvocationStepWithDetailService } from '../services/getConvocationStepWithDetail.service';
import { buildRegistrationRoute, isModernRegistrationFlow } from '../utils/registrationFlow.utils';

const getConvocationStepWithDetailService = new GetConvocationStepWithDetailService();
const getConvocationByIdService = new GetConvocationByIdService();
const getConvocationWithStepsService = new GetConvocationWithStepsService();
const uploadFileStepDocumentService = new UploadFileStepDocumentService();
const getInstitutionByIdService = new GetInstitutionByIdService();
const signDocumentService = new SignDocumentService();

export default defineComponent({
  name: 'StepTypeDocumento',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SaveAndExitStep,
    AppButtonBack,
    SignDocument,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppIcon,
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const isAdmin = computed(() => (localStorage.getItem('administratorAsStudent') ? 1 : 0));

    const routes: any[] = [{ name: '' }];
    useMeta({ title: 'Paso: Documento' });

    const convocation: Ref<ConvocationDto | null> = ref(null);
    const step: Ref<StepTypeDocumentoDto | null> = ref(null);

    const modalSignDocument = ref(false);
    const loadingStep = ref(false);
    const approvedStep = ref(false);
    // const allowToSign = ref(false);
    const loading = ref(true);

    const convocationEnrolId = ref();
    const convocationId = ref();
    const institutionId = ref();
    const urlBanner = ref('');
    const stepId = ref();
    const title = ref();
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

    const currentDocument: { value: DetailDto | null } = reactive({
      value: null,
    });
    const currentSigner: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        convocationEnrolId.value = parseInt(String(route.params.convocationEnrollId ?? route.query.convocationEnrollId), 10);
        convocationId.value = parseInt(String(route.params.convocationId ?? route.query.convocationId), 10);
        institutionId.value = parseInt(String(route.params.institutionId ?? route.query.institutionId), 10);
        stepId.value = parseInt(String(route.params.stepId ?? route.query.stepId), 10);

        let params2 = {
          convocationEnrolId: convocationEnrolId.value,
          isAdmin: isAdmin.value,
        };

        const response = await getConvocationWithStepsService.run(convocationId.value, params2);
        const stepAux = response.steps.filter((item: any) => item.id == stepId.value)[0];
        approvedStep.value = (stepAux.isApproved === 1 && stepAux.requiresApproval === 1) || (stepAux.isApproved === 'null' && stepAux.requiresApproval == 1) ? true : false;

        await getDetailStep();
        currentDocument.value = step.value?.detail[0] ?? null;
        title.value = step.value?.title;

        if (currentDocument.value && currentDocument.value.signers.length) {
          let signersAux = currentDocument.value.signers.filter((signer) => !signer.isInstitutional);

          currentDocument.value.signers = signersAux;
        }

        if (!props.embedded) {
          await loadRoutes();
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const allowToSign = computed(() => {
      let allowToSignTemp = true;

      currentDocument.value?.signers.forEach((signer: SignerDto) => {
        if (allowToSignTemp) {
          if (!signer.assigned) {
            allowToSignTemp = false;
          }
        }
      });

      return allowToSignTemp;
    });

    const getDetailStep = async (currentDocumentId: any = null) => {
      let params = {
        id: stepId.value,
        convocationEnrolId: convocationEnrolId.value,
      };

      step.value = await getConvocationStepWithDetailService.run(params);

      if (currentDocument.value?.enrolDocument) {
        step.value?.detail.forEach((detail: DetailDto) => {
          if (currentDocument.value?.enrolDocument?.id == detail.enrolDocument?.id) {
            currentDocument.value = detail;
          }
        });
      }

      if (currentDocumentId) {
        step.value?.detail.forEach((detail: DetailDto) => {
          if (currentDocumentId == detail.id) {
            currentDocument.value = detail;
          }
        });
      }
    };

    const changeCurrentDocument = (document: DetailDto) => {
      currentDocument.value = document;

      if (currentDocument.value.signers.length) {
        let signersAux = currentDocument.value.signers.filter((signer) => !signer.isInstitutional);

        currentDocument.value.signers = signersAux;
      }
    };

    const clickInputFile = () => {
      let inputFile = document.getElementById('inputFile');
      if (inputFile != null) inputFile.click();
    };
    const uploadSignedDocument = async (event: any) => {
      loadingStep.value = true;

      const files = event.target.files;
      if (!files.length) return;

      let dataSend = {
        id: currentDocument.value?.enrolDocument?.id ?? null,
        convocationEnrolId: convocationEnrolId.value,
        convocationStepId: stepId.value,
        documentId: currentDocument.value?.id,
        file: files[0],
      };

      try {
        await uploadFileStepDocumentService.run(dataSend);
      } catch (e) {
        console.log(e);
      }

      await getDetailStep();

      loadingStep.value = false;
    };

    const openModalSignDocument = async (currentData: any) => {
      let additionalFields = currentData.additionalFields.split(',');
      let dataForm: any = {};
      let dataV: any = {};

      //if (!additionalFields.includes('indicative')) additionalFields.push('indicative');
      //if (!additionalFields.includes('country')) additionalFields.push('country');

      additionalFields.forEach((field: any) => {
        dataV[field] = { required };
        dataForm[field] = null;
      });

      currentSigner.value = {
        ...currentData,
        convocationEnrolDocumentId: currentDocument.value?.enrolDocument ? currentDocument.value.enrolDocument.id : null,
        convocationEnrolId: convocationEnrolId.value,
        convocationStepId: stepId.value,
        dataform: dataForm,
        dataV$: dataV,
      };

      modalSignDocument.value = true;
    };
    const closMmodalSignDocument = async () => {
      // location.reload();
      await getDetailStep(currentDocument.value?.id);

      modalSignDocument.value = false;
    };

    const signDocument = async () => {
      loadingStep.value = true;

      try {
        const dataSend = {
          convocationEnrolId: convocationEnrolId.value,
          convocationStepId: stepId.value,
          documentId: currentDocument.value?.id,
          convocationEnrolDocumentId: currentDocument.value?.enrolDocument ? currentDocument.value.enrolDocument.id : null,
        };

        await signDocumentService.run(dataSend);
        await getDetailStep(currentDocument.value?.id);
      } catch (e) {
        console.log(e);
      }

      loadingStep.value = false;
    };

    const loadRoutes = async () => {
      convocation.value = await getConvocationByIdService.run(convocationId.value);
      urlBanner.value = convocation.value.urlBanner ?? convocation.value.thumbnail;
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

    const documentStatus = (detail: any) => {
      if (detail.enrolDocument == null) {
        return 'Pendiente';
      } else if (!step.value?.requiresApproval) {
        return 'Finalizado';
      } else if (detail.enrolDocument.isAccept == null && !detail.enrolDocument.urlSignedDocument) {
        return 'Pendiente';
      } else if (detail.enrolDocument.isAccept == null) {
        return 'En revisión';
      } else if (detail.enrolDocument.isAccept === 0) {
        return 'Rechazado';
      } else {
        return 'Aprobado';
      }
    };

    return {
      approvedStep,
      urlBanner,
      routes,
      title,
      t,

      changeCurrentDocument,
      documentStatus,
      convocationEnrolId,
      modalSignDocument,
      currentDocument,
      institutionId,
      backRoute,
      currentSigner,
      convocationId,
      convocation,
      loadingStep,
      allowToSign,
      loading,
      stepId,
      step,

      closMmodalSignDocument,
      openModalSignDocument,
      uploadSignedDocument,
      clickInputFile,
      signDocument,

      color: import.meta.env.VITE_COLOR_PRIMARY,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}
.filter {
  backdrop-filter: blur(3px);
  background: rgb(0, 0, 0);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%);
}

.pointer {
  cursor: pointer;
}
.borde-left {
  border-left-color: v-bind(color);
  border-left-width: 4px;
}

.custom-bg {
  background-color: #00b0da;
}

.step-type-documento__embedded {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
