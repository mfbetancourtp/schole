<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template #actions>
            <AppButtonBack
                :to="{ name:'collections.portfolioMonitoring' }"
            ></AppButtonBack>
        </template>

        <template #content>
            <AppCard>
                <template #body>
                    <nav>
                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                            <button
                                class="nav-link active text-capitalize text-dark"
                                data-bs-target="#quotas" aria-controls="quotas"
                                data-bs-toggle="tab" aria-selected="true"
                                id="quotas-tab" type="button" role="tab"
                            >{{ t('Cuotas') }}</button>

                            <button
                                class="nav-link text-capitalize text-dark" data-bs-target="#legal-collections"
                                aria-controls="legal-collections" id="legal-collections-tab" aria-selected="false"
                                data-bs-toggle="tab" type="button" role="tab"
                            >{{ t('Cobros jurídicos') }}</button>

                            <button
                                class="nav-link text-capitalize text-dark" data-bs-target="#documents"
                                aria-controls="documents" aria-selected="false" data-bs-toggle="tab"
                                id="documents-tab" type="button" role="tab"
                            >{{ t('Documentos') }}</button>
                        </div>
                    </nav>

                    <div class="tab-content" id="nav-tabContent">
                        <div
                            class="tab-pane fade show active"
                            aria-labelledby="quotas-tab"
                            role="tabpanel"
                            id="quotas"
                        >
                            <PMByStudentQuotas
                                :matriculate-id="matriculateId"
                            ></PMByStudentQuotas>
                        </div>

                        <div
                            aria-labelledby="legal-collections-tab"
                            id="legal-collections"
                            class="tab-pane fade"
                            role="tabpanel"
                        >
                            <PMByStudentLegalCollections
                                :matriculate-id="matriculateId"
                            ></PMByStudentLegalCollections>
                        </div>

                        <div
                            aria-labelledby="documents-tab"
                            class="tab-pane fade"
                            role="tabpanel"
                            id="documents"
                        >
                            <PMByStudentDocuments
                                v-if="relatedData"
                                :convocation-enrol-attachments="relatedData.convocationEnrolAttachments"
                                :convocation-enrol-documents="relatedData.convocationEnrolDocuments"
                            ></PMByStudentDocuments>
                        </div>
                    </div>
                </template>
            </AppCard>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import PMByStudentQuotas from '../components/PMByStudentQuotas.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import PMByStudentDocuments from '../components/PMByStudentDocuments.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import PMByStudentLegalCollections from '../components/PMByStudentLegalCollections.vue';

import { PortfolioMonitoringByStudentDto } from '../dtos/portfolioMonitoringByStudent.dto';

import { GetRelatedDataPortfolioMonitoringByStudentService } from '../services/getRelatedDataPortfolioMonitoringByStudent.service';

const getRelatedDataService = new GetRelatedDataPortfolioMonitoringByStudentService();

export default defineComponent({
    name: 'PortfolioMonitoringByStudent',
    components: {
        PMByStudentLegalCollections,
        PMByStudentDocuments,
        PMByStudentQuotas,
        AppButtonBack,
        AppBaseList,
        AppLoading,
        AppButton,
        AppCard,
    },

    setup() {
        const route = useRoute();
        const { t } = useI18n();

        const title = ref('Cartera por estudiante');
        useMeta({ title: title.value });
        const routes = [
            {
                name: `Seguimiento cartera`,
                url: { name: 'collections.portfolioMonitoring' },
            },
            { 
                name: title.value 
            }
        ];

        const relatedData: Ref<PortfolioMonitoringByStudentDto | null> = ref(null);

        const matriculateId = ref();

        const loading = ref(true);
        
        onMounted(async () => {
            try {
                matriculateId.value = parseInt(route.params.matriculateId.toString(), 10);
                relatedData.value = await getRelatedDataService.run(matriculateId.value);

                title.value = `Cartera por estudiante "${relatedData.value?.student.names} ${relatedData.value?.student.lastnames}"`
            } catch (e) {console.log(e)}

            loading.value = false;
        });

        return {
            loading,
            routes,
            title,
            t,

            matriculateId,
            relatedData,
        };
    },
});
</script>

<style scoped>
</style>