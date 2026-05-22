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

                    <section v-else class="mt-3">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Fila</th>
                                    <th>Hoja</th>
                                    <th>Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="data, index in responseObject" :key="index">
                                    <td>{{ data.row }}</td>
                                    <td>{{ data.sheet }}</td>
                                    <td>{{ data.error }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </template>
            </AppCard>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { ImportInvoiceService } from "../services/importInvoice.service";
import { useHeaderStore } from "../../../stores/header.store";

const importInvoiceService = new ImportInvoiceService();

export default defineComponent({
    name: "ImportTemplateCollection",
    components: {
        AppButtonBack,
        AppUploadFile,
        AppBaseList,
        AppLoading,
        AppButton,
        AppCard,
    },

    setup() {
        const {t} = useI18n();

        const title = 'Importar cartera';
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
        
        const responseObject: Ref<any> = ref();
        const urlTemplate: Ref<string> = ref('https://casurid.s3.us-east-2.amazonaws.com/files/prod/templates/PlantillaFacturas.xlsx');

        const loadingResult = ref(false);
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
            loadingResult.value = true;

            let dataSend = { files: file };

            try {
                let res: any = await importInvoiceService.run(dataSend);
                responseObject.value = res.data;
            } catch (e) {}

            loadingResult.value = false;
        }

        return {
            loading,
            routes,
            title,
            t,

            responseObject,
            loadingResult,
            urlTemplate,

            uploadTemplate,
        };
    },
});
</script>

<style scoped>
</style>