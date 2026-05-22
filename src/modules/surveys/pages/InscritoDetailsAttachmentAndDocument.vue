<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template v-slot:actions>
            <AppButtonBack 
                :to="{ 
                    name: 'surveys.inscritosByStep',
                    params: { 
                        convocationId: convocationId,
                        convocationStepId: convocationStepId,
                    }
                }"
            ></AppButtonBack>
        </template>

        <template v-slot:content>
            <AppEmptyResponse
                v-if="!data.length"
                :showImage="true"
            ></AppEmptyResponse>

            <div v-else class="row">
                <section class="col-3">
                    <AppCard
                        v-for="dat, index in data"
                        v-bind:class="{'borde-left': currentFile.value?.id == dat.id}"
                        @click="changeCurrentFile(dat)"
                        class="card-hover mt-1 mb-1 pointer"
                        :key="index"
                    >
                        <template #body>
                            <div class="d-flex justify-content-end">
                                <AppBadge :variant="buildStatusVariant(dat.isAccept)" :label="dat.isAccept == null ? 'Pendiente' : dat.isAccept == 0 ? 'Rechazado' : 'Aprobado'"></AppBadge>
                            </div>

                            <h5>{{ dat.title }}</h5>
                        </template>
                    </AppCard>
                </section>

                <section class="col-9">
                    <AppLoading v-if="loadingStep"></AppLoading>

                    <AppCard v-else class="h-100">
                        <template #body>
                            <h3 
                                v-if="!currentFile.value?.urlDocumentWithSigners && !currentFile.value?.urlSignedDocument && !currentFile.value?.urlDocument && !currentFile.value?.urlAttachment"
                                class="text-center" style="color: #aaa;"
                            >No hay archivo que mostrar.</h3>

                            <iframe 
                                v-else
                                :src="currentFile.value?.urlSignedDocument ?? currentFile.value?.urlDocumentWithSigners ?? currentFile.value?.urlDocument ?? currentFile.value?.urlAttachment" 
                                style="width: 100%; height: 61rem; border: none;"
                            ></iframe>
                        </template>

                        <template #footer>
                            <div class="d-flex flex-row-reverse">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="form-check">
                                        <input 
                                            :checked="currentFile.value?.isAccept == 1"
                                            @click="isAccept(1)" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1">
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            Aceptar {{ stepType }}
                                        </label>
                                    </div>

                                    <div class="form-check">
                                        <input 
                                            :checked="currentFile.value?.isAccept == 0"
                                            @click="isAccept(0)" class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2">
                                        <label class="form-check-label" for="flexRadioDefault2">
                                            Rechazar {{ stepType }}
                                        </label>
                                    </div>

                                    <AppButton
                                        :href="currentFile.value?.urlDocument || currentFile.value?.urlAttachment"
                                        :label="'Descargar'"
                                        variant="primary"
                                        target="_blank"
                                        outlined
                                    ></AppButton>
                                </div>
                            </div>
                        </template>
                    </AppCard>
                </section>
            </div>

            <!-- {{ data }} -->
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {useMeta} from 'vue-meta';
import {useRoute} from "vue-router";
import {VariantsConstant} from '../../../shared/constant/variants.constant';
import {defineComponent, onMounted, reactive, ref} from "vue";

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import {GetInscritoDetailsService} from '../services/getInscritoDetails.service';
import {GetConvocationStepsService} from '../services/getConvocationSteps.service';
import {GetFiltersSummaryInscritosByStepService} from '../services/getFiltersSummaryInscritosByStep.service';
import {UpdateDocumentVerificationStatusService} from '../services/updateDocumentVerificationStatus.service';
import {UpdateAttachmentVerificationStatusService} from '../services/updateAttachmentVerificationStatus.service';

const updateAttachmentVerificationStatusService = new UpdateAttachmentVerificationStatusService();
const getFiltersSummaryInscritosByStepService = new GetFiltersSummaryInscritosByStepService();
const updateDocumentVerificationStatusService = new UpdateDocumentVerificationStatusService();
const getConvocationStepsService = new GetConvocationStepsService();
const getInscritoDetailsService = new GetInscritoDetailsService();

export default defineComponent({
    name: "InscritoDetailsAttachment",
    components: {
        AppEmptyResponse,
        AppButtonBack,
        AppBaseList,
        AppLoading,
        AppButton,
        AppBadge,
        AppCard,
    },

    setup() {
        const {t} = useI18n();
        const routes: any = [{ name: '' }];
        useMeta({title: 'Verificación de archivos'});

        const convocationEnrolStepId = ref();
        const convocationStepTypeId = ref();
        const convocationStepId = ref();
        const loadingStep = ref(false);
        const convocationId = ref();
        const loading = ref(true);
        const route = useRoute();
        const stepTypes  = ref();
        const stepType = ref();
        const filters  = ref();
        const title = ref();
        const data = ref();

        const currentFile: { value: any } = reactive({
            value: null,
        });

        onMounted(async () => {
            try {
                convocationEnrolStepId.value = parseInt(route.params.convocationEnrolStepId.toString(), 10);
                convocationStepId.value = parseInt(route.params.convocationStepId.toString(), 10);
                convocationId.value = parseInt(route.params.convocationId.toString(), 10);

                stepTypes.value = await getConvocationStepsService.run(convocationId.value);
                filters.value = await getFiltersSummaryInscritosByStepService.run(convocationStepId.value);

                convocationStepTypeId.value = filters.value.convocationStep.convocationStepTypeId;

                stepTypes.value.stepTypes.forEach((stepTypeB: any) => {
                    if (stepTypeB.id == convocationStepTypeId.value) {
                        stepType.value = stepTypeB.name;
                    }
                });

                await getData();
                await loadRoutes();
            } catch (e) {}

            loading.value = false;
        });

        const getData = async () => {
            data.value = await getInscritoDetailsService.run(convocationEnrolStepId.value);
            currentFile.value = data.value[0] ?? null;
        };

        const changeCurrentFile = (file: any) => {
            currentFile.value = file;
        };

        const isAccept = async (value: any) => {
            if (stepType.value == 'Documento') {
                await updateDocumentVerificationStatusService.run(currentFile.value.id, {  isAccept: value ? 1 : 0});
            } else {
                await updateAttachmentVerificationStatusService.run(currentFile.value.id, {  isAccept: value ? 1 : 0});
            }

            await getData();
        };

        const loadRoutes = async () => {
            title.value = `Verificación de ${stepType.value}s`;
            routes[0].name = title.value;

            routes.unshift(
                {
                    name: `Procesos de matriculación`,
                    url: { name: 'surveys.convocationsList' },
                },
                {
                    name: `Resumen Inscritos "${stepTypes.value.convocation.title}"`,
                    url: { 
                        name: 'surveys.previewInscritos',
                        params: { convocationId: convocationId.value }
                    },
                },
                {
                    name: `Inscritos paso ${stepType.value} "${filters.value.convocationStep.title}"`,
                    url: {
                        name: 'surveys.inscritosByStep',
                        params: { 
                            convocationId: convocationId.value,
                            convocationStepId: convocationStepId.value,
                        }
                    },
                },
            );
        };
        const buildStatusVariant = (isAccept: string): VariantsConstant => {
            const colors: { [key: string]: VariantsConstant } = {
                    'null': 'dark',
                    '0': 'danger',
                }
                return colors[isAccept] ?? 'success';
            }
        return {
            loading,
            routes,
            title,
            t,

            convocationStepId,
            convocationId,
            currentFile,
            loadingStep,
            stepType,
            data,

            buildStatusVariant,
            changeCurrentFile,
            isAccept,
        };
    },
});
</script>

<style scoped>
.pointer {
    cursor: pointer;
}
.borde-left {
    border-left-color: var(--color-primary);
    border-left-width: var(--border-4);
}
</style>