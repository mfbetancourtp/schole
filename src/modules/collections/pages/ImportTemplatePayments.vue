<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template v-slot:actions>
            <AppButtonBack 
                :to="{ name: 'collections.syncCollections' }"
            ></AppButtonBack>
        </template>

        <template v-slot:content>
            <AppCard>
                <template #body>
                    <section>
                        <div class="mb-2 d-flex align-items-center gap-3">
                            <span>Paso 1: Descargar Plantilla</span>

                            <AppButton :href="urlTemplate">
                                Descargar
                            </AppButton>
                        </div>

                        <div class="d-flex align-items-center gap-3">
                            <span>Paso 2: Subir Plantilla</span>
                            
                            <div class="col-5">
                                <AppUploadFile
                                    @update:modelValue="uploadTemplate"
                                ></AppUploadFile>
                            </div>
                        </div>
                    </section>

                    <AppLoading v-if="loadingResult"></AppLoading>

                    <section v-else-if="!loadingResult && seeStepTwo" class="mt-3">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Transacción</th>
                                    <th>Oficina</th>
                                    <th>Valor</th>
                                    <th>Referencia</th>
                                    <th>Cédula</th>
                                    <th>Estudiante</th>
                                    <th>Observación</th>
                                    <th>Factura a pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="data, index in responseObject" :key="index">
                                    <td>{{ data.description ?? '---' }}</td>
                                    <td>{{ data.transaction ?? '---' }}</td>
                                    <td>{{ data.office ?? '---' }}</td>
                                    <td>{{ data.valuePayment ?? '---' }}</td>
                                    <td>{{ data.code ?? '---' }}</td>
                                    <td>{{ data.identification ?? '---' }}</td>
                                    <td>{{ data.student ?? '---' }}</td>
                                    <td>{{ data.observation ?? '---' }}</td>
                                    <td>
                                        <AppAutocomplete
                                            v-model="data.invoiceId"
                                            @search="searchInvoice"
                                            :options="invoices"
                                        ></AppAutocomplete>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="d-flex justify-content-end">
                            <AppButton
                                @click="finish()"
                                label="Finalizar"
                            ></AppButton>
                        </div>
                    </section>
                </template>
            </AppCard>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from "vue";
import { debounce } from 'ts-debounce';
import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { ImportPaymentsService } from "../services/importPayments.service";
import { CorrectPaymentsService } from "../services/correctPayments.service";
import { GetInvoicesForSelectByInstitutionService } from "../services/getInvoicesForSelectByInstitution.service";
import { useHeaderStore } from "../../../stores/header.store";

const getInvoicesForSelectByInstitutionService = new GetInvoicesForSelectByInstitutionService();
const correctPaymentsService = new CorrectPaymentsService();
const importPaymentsService = new ImportPaymentsService();

export default defineComponent({
    name: "ImportTemplatePayments",
    components: {
        AppAutocomplete,
        AppButtonBack,
        AppUploadFile,
        AppBaseList,
        AppLoading,
        AppButton,
        AppCard,
    },

    setup() {
        const route = useRoute();
        const {t} = useI18n();

        const title = 'Importar recaudo';
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
        
        const invoices: Ref<any[]> = ref([]);
        const responseObject: Ref<any> = ref();
        const urlTemplate: Ref<string> = ref('https://casurid.s3.us-east-2.amazonaws.com/files/prod/templates/formato_recaudo.xlsx');

        const loadingResult = ref(false);
        const seeStepTwo = ref(false);
        const loading = ref(true);

        onMounted(async () => {
            try {
                const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: 'Sincronizar Cartera', url: '' };
      headerStorage.moduleSubItem = { name: title, url: '' };
            } catch (e) {}

            loading.value = false;
        });

        const uploadTemplate = async (file: any) => {
            seeStepTwo.value = false;
            loadingResult.value = true;

            let dataSend = { files: file };

            try {
                let res: any = await importPaymentsService.run(dataSend);
                responseObject.value = res.data;
            } catch (e) {}

            loadingResult.value = false;
            seeStepTwo.value = true;
        };

        const finish = async () => {
            try {
                responseObject.value.forEach((d: any) => {
                    d.ignore = d.invoiceId ? false : true;
                });

                const dataSend = {
                    payments: responseObject.value,
                }

                await correctPaymentsService.run(dataSend);
            } catch (e) {}

            seeStepTwo.value = false;
        };

        const searchInvoice = debounce(async (search: string, loading: Function) => {
            if (search) {
                loading(true);

                if (search.length >= 2){
                    invoices.value = [];
                    const response = await getInvoicesForSelectByInstitutionService.run({search: search});

                    response.data.forEach((invoice: any) => {
                        invoices.value.push({
                            ...invoice,
                            name: invoice.id,
                        });
                    });
                } else {
                    invoices.value = [];
                }

                loading(false);
            }
        }, 800);

        return {
            loading,
            routes,
            title,
            t,

            responseObject,
            loadingResult,
            urlTemplate,
            seeStepTwo,
            invoices,

            uploadTemplate,
            searchInvoice,
            finish,
        };
    },
});
</script>

<style scoped>
</style>