<template>
    <AppBaseList :title="title" :routes="routes">
        <template v-slot:actions>
            <AppButtonBack 
                :to="{ name: 'collections.syncCollections' }"
            ></AppButtonBack>
        </template>

        <template v-slot:content>
            <AppLoading v-if="loading"></AppLoading>

            <AppCard v-else>
                <template #body>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="form-row">
                            <AppFormField :form-control="v$.form.starDate" :label="'Fecha inicio'">
                                <input id="startDate" type="date" class="form-control" v-model="v$.form.starDate.$model">
                            </AppFormField>

                            <AppFormField :form-control="v$.form.endDate" :label="'Fecha cierre'">
                                <input id="endDate" type="date" class="form-control" v-model="v$.form.endDate.$model">
                            </AppFormField>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="flexCheckIndeterminate" v-model="v$.form.showExported.$model">

                            <label class="form-check-label" for="flexCheckIndeterminate">
                                Mostrar exportadas?
                            </label>
                        </div>

                        <AppButton
                            :disabled="!v$.form.starDate.$model || !v$.form.endDate.$model"
                            :label="'Buscar'"
                            @click="search"
                            class="text-white"
                        ></AppButton>
                    </div>

                    <AppLoading v-if="loadingStepTwo"></AppLoading>

                    <div v-if="showStepTwo">
                        <hr>

                        <p>Paso 2: Visualización de resultados</p>

                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Exportado?</th>
                                    <th>Recibo</th>
                                    <th>Fecha</th>
                                    <th>Nombre</th>
                                    <th>Forma de pago</th>
                                    <th>Valor total</th>
                                    <th>saldo</th>
                                    <th># productos</th>
                                    <th># cuotas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="data, index in summaryBeforeExporting" :key="index">
                                    <td>{{ data.isExport ? 'Si' : 'No' }}</td>
                                    <td>{{ data.code ?? '--' }}</td>
                                    <td>{{ data.createDate }}</td>
                                    <td>{{ data.client }}</td>
                                    <td>{{ data.wayToPay }}</td>
                                    <td>{{ data.totalPurchase }}</td>
                                    <td>{{ data.pendingValue }}</td>
                                    <td>{{ data.countDetails }}</td>
                                    <td>{{ data.countQuotes }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="d-flex justify-content-between align-items-end">
                            <div class="mb-3 form-check">
                                <input class="form-check-input" type="checkbox" id="markExported" v-model="v$.form.markExported.$model">

                                <label class="form-check-label" for="markExported">
                                    Mostrar las obligaciones como exportados al generar el archivo?
                                </label>
                            </div>

                            <div class="d-flex align-items-end gap-2">
                                <div style="width: 15rem;">
                                    <AppFormField :form-control="v$.form.exportEntityId" :label="'Plantilla'">
                                        <div class="d-flex align-items-center">
                                            <AppAutocomplete
                                                :options="templatesEnabled"
                                                v-model="v$.form.exportEntityId.$model"
                                                style="width: 90%;"
                                                :label="'title'"
                                            ></AppAutocomplete>
                                            
                                            <AppButton
                                                v-tooltip="'Configurar pantalla de exportado'"
                                                @click="openExportTemplateSettings"
                                                variant="primary"
                                                :icon="'cog'"
                                                outlined
                                            ></AppButton>
                                        </div>
                                    </AppFormField>
                                </div>

                                <AppButton
                                    :disabled="!v$.form.starDate.$model || !v$.form.endDate.$model"
                                    @click="exportCollections"
                                    :label="'exportar'"
                                    class="text-white mb-3"
                                ></AppButton>
                            </div>
                        </div>
                    </div>

                    <div v-if="urlFile || loadingExport" >
                        <hr>

                        <div class="border border-primary border-opacity-10 rounded bg-primary bg-opacity-25 p-2 d-flex align-items-center gap-1 mt-2">
                            <div v-if="loadingExport" class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>

                            <div>
                                <p class="m-0" v-if="loadingExport">Estamos generando el reporte</p>
                                <p class="m-0" v-if="urlFile && urlFile.file">Reporte generado correctamente</p>

                                <div class="mt-2">
                                    <AppButton
                                        v-if="urlFile && urlFile.file"
                                        :href="urlFile.file" target="_blank"
                                        :label="'Ver reporte'"
                                        class="text-white"
                                    ></AppButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </AppCard>

            <AppModal v-model="exportTemplateSettingsModal" :size="'lg'">
                <ExportTemplateSettings
                    v-if="exportTemplateSettingsModal && currentTemplate"
                    :data="currentTemplate"
                    @close="closeExportTemplateSettings"
                ></ExportTemplateSettings>
            </AppModal>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from "vue";
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import ExportTemplateSettings from '../components/ExportTemplateSettings.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { ExportCollectionDto } from "../dtos/exportCollection.dto";
import { TemplatesEnabledDto } from "../dtos/templatesEnabled.dto";

import { ExportInvoicesService } from "../services/exportInvoices.service";
import { GenerateSummaryBeforeExportingPortfolioService } from "../services/generateSummaryBeforeExportingPortfolio.service";
import { GetTemplatesEnabledForExportingPortfolioService } from "../services/getTemplatesEnabledForExportingPortfolio.service";
import { useHeaderStore } from "../../../stores/header.store";

const getTemplatesEnabledForExportingPortfolioService = new GetTemplatesEnabledForExportingPortfolioService();
const generateSummaryBeforeExportingPortfolioService = new GenerateSummaryBeforeExportingPortfolioService();
const exportInvoicesService = new ExportInvoicesService();

export default defineComponent({
    name: "ExportCollection",
    components: {
        ExportTemplateSettings,
        AppAutocomplete,
        AppButtonBack,
        AppFormField,
        AppBaseList,
        AppLoading,
        AppButton,
        AppModal,
        AppCard,
    },

    setup() {
        const { t } = useI18n();

        const title = 'Exportar cartera';
        useMeta({title: title});
        const routes = [
            {
                name: 'Sincronizar cartera',
                url: {
                    name: 'collections.syncCollections',
                },
            },
            { 
                name: title 
            }
        ];

        const urlFile = ref();

        const summaryBeforeExporting: Ref<ExportCollectionDto[]> = ref([]);
        const currentTemplate: Ref<TemplatesEnabledDto | null> = ref(null);
        const templatesEnabled: Ref<TemplatesEnabledDto[]> = ref([]);

        const exportTemplateSettingsModal = ref(false);
        const loadingStepTwo = ref(false);
        const loadingExport = ref(false);
        const showStepTwo = ref(false);
        const loading = ref(true);

        const form = reactive({
            starDate: null,
            endDate: null,
            showExported: false,
            exportEntityId: null as any,
            markExported: false,
        });
        const v$ = useVuelidate({
        form: {
            starDate: {required},
            endDate: {required},
            showExported: {},
            exportEntityId: {required},
            markExported: {},
        },
        }, {form});

        onMounted(async () => {
            try {
                const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: 'Sincronizar Cartera', url: '' };
      headerStorage.moduleSubItem = { name: title, url: '' };
                templatesEnabled.value = await getTemplatesEnabledForExportingPortfolioService.run();

                form.exportEntityId = templatesEnabled.value[0].id;
                currentTemplate.value = templatesEnabled.value[0];
            } catch (e) {}

            loading.value = false;
        });

        watch(() => form.exportEntityId, async (value) => {
            if (value) {
                templatesEnabled.value.forEach(template => {
                    if (template.id == value) {
                        currentTemplate.value = template;
                    }
                });
            }
        });

        const search = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            showStepTwo.value = false;
            loadingStepTwo.value = true;

            try {
                summaryBeforeExporting.value = await generateSummaryBeforeExportingPortfolioService.run(form);
            } catch (e) {}

            loadingStepTwo.value = false;
            showStepTwo.value = true;
        }

        const exportCollections = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            loadingExport.value = true;
            urlFile.value = null;

            try {
                urlFile.value = await exportInvoicesService.run(form);
            } catch (e) {}

            loadingExport.value = false;
        }

        const openExportTemplateSettings = () => {
            exportTemplateSettingsModal.value = true;
        };
        const closeExportTemplateSettings = () => {
            exportTemplateSettingsModal.value = false;
        };

        return {
            loading,
            routes,
            title,
            v$,
            t,

            exportTemplateSettingsModal,
            summaryBeforeExporting,
            templatesEnabled,
            currentTemplate,
            loadingStepTwo,
            loadingExport,
            showStepTwo,
            urlFile,

            closeExportTemplateSettings,
            openExportTemplateSettings,
            exportCollections,
            search,
        };
    },
});
</script>

<style scoped>
</style>