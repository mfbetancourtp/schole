<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template v-slot:content>
            <AppCard>
                <template #body>
                    <p>¿Que deseas hacer?</p>

                    <h4 class="m-0">Importar</h4>
                    <div>
                        <AppButton
                            :to="{ name:'collections.syncCollectionsImportCollection' }"
                            :link="true"
                        >Cartera</AppButton> 

                        <span>Inserte o actualice la información de las cuotas adeudados por los estudiantes a partir de una planilla de excel.</span>
                    </div>
                    <div class="mb-3">
                        <AppButton
                            :to="{ name:'collections.syncCollectionsImportPayments' }"
                            :link="true"
                        >Recaudo</AppButton> 

                        <span>Inserte o actualice la información de los pagos realizados por los estudiantes a partir de una planilla de excel.</span>
                    </div>

                    <h4 class="m-0">Exportar</h4>
                    <div>
                            <!-- :to="{ name:'academicPlanning.importTemplateTeachers' }"  -->
                        <AppButton 
                            :to="{ name:'collections.exportCollection' }"
                            :link="true"
                        >Cartera</AppButton> 

                        <span>Genere un archivo de excel con la información de las obligaciones creadas en el sistema en un tiempo determinado.</span>
                    </div>
                    <div class="mb-3">
                            <!-- :to="{ name:'academicPlanning.importTemplateStudents' }"  -->
                        <AppButton
                        :to="{ name:'collections.exportPayments' }"
                        :link="true"
                        >Recaudo</AppButton> 
                        
                        <span>Genere un archivo de excel con la información de los pagos realizados por pasarela en un tiempo determinado.</span>
                    </div>
                </template>
            </AppCard>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { useHeaderStore } from "../../../stores/header.store";

export default defineComponent({
    name: "SyncCollection",
    components: {
        AppBaseList,
        AppLoading,
        AppButton,
        AppCard,
    },

    setup() {
        const route = useRoute();
        const {t} = useI18n();

        const title = 'Sincronizar cartera';
        const routes = [{ name: title }];
        useMeta({title: title});
        
        const loading = ref(true);

        onMounted(async () => {
            try {
                const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
            } catch (e) {}

            loading.value = false;
        });

        return {
            loading,
            routes,
            title,
            t,
        };
    },
});
</script>

<style scoped>
</style>