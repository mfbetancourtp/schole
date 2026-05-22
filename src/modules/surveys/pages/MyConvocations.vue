<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template v-slot:actions>
            <AppButtonBack
                :to="{
                    name: 'surveys.userConvocations',
                    params: { institutionId: institutionId }
                }"
            ></AppButtonBack>
        </template>

        <template v-slot:content>
            <div class="items">
                <AppCard 
                    v-for="convocation, index in convocations" 
                    :image="convocation.thumbnail"
                    class="card-hover"
                    :key="index" 
                >
                    <template #body>
                        <h1 class="h5 lead tw-line-clamp-2">{{ convocation.title }}</h1>
                        <p class="tw-line-clamp-3">{{ convocation.levelName }}</p>

                        <p class="tw-line-clamp-3 mb-0">
                            Ciclo académico: {{ convocation.academicPeriod }}
                        </p>
                        <p class="tw-line-clamp-3">
                            Fecha de cierre: {{ dayjs(convocation.endDate).locale("es").format('D MMMM YYYY') }}
                        </p>
                    </template>

                    <template #footer>
                        <div class="d-flex justify-content-end">
                            <AppButton
                                :label="'Ver Inscripción'"
                                variant="primary"
                                :to="{ 
                                    name: 'surveys.userConvocations.registration',
                                    params: { 
                                        institutionId: institutionId,
                                        convocationId: convocation.id,
                                        convocationEnrollId: convocation.enrol.id,
                                    }
                                }"
                            ></AppButton>
                        </div>
                    </template>
                </AppCard>
            </div>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {useMeta} from 'vue-meta';
import {useRoute} from "vue-router";
import {defineComponent, onMounted, Ref, ref} from "vue";

import dayjs from 'dayjs';
import es from "dayjs/locale/es";
import localeData from "dayjs/plugin/localeData";

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

dayjs.locale("es");
dayjs.extend(localeData);

import { GetMyConvocationsService } from '../services/getMyConvocations.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import {AcademicPeriodsForConvocationsService} from '../services/academicPeriodsForConvocations.service';

const academicPeriodsForConvocationsService = new AcademicPeriodsForConvocationsService();
const getInstitutionByIdService = new GetInstitutionByIdService();
const getMyConvocationsService = new GetMyConvocationsService();

export default defineComponent({
    name: "MyConvocations",
    components: {
        AppButtonBack,
        AppBaseList,
        AppLoading,
        AppButton,
        AppCard,
    },

    setup() {
        const routes: any[] = [{name: ''}];
        const title = "Mis procesos de matriculación";
        useMeta({title: title});
        const {t} = useI18n();

        const convocations: Ref<any[]> = ref([]);
        const institutionId = ref();
        const loading = ref(true);
        const route = useRoute();

        onMounted(async () => {
            try {
                institutionId.value = parseInt(route.params.institutionId.toString(), 10);

                let academicPeriods: any[] = await academicPeriodsForConvocationsService.run(institutionId.value);
                convocations.value = await getMyConvocationsService.run();

                convocations.value.forEach((convocation: any) => {
                    academicPeriods.forEach((academicPeriod: any) => {
                        if (academicPeriod.id == convocation.academicPeriodId) {
                            convocation.academicPeriod = academicPeriod.name;
                        }
                    })
                });

                await loadRoutes();
            } catch (e) {}

            loading.value = false;
        });

        const loadRoutes = async () => {
            let response = await getInstitutionByIdService.run(institutionId.value);
            routes[0].name = title;

            routes.unshift(
                {
                    name: `Procesos de matriculación colegio ${response.institution.name}`,
                    url: { 
                        name: 'surveys.userConvocations',
                        params: { institutionId: institutionId.value },
                    }
                }
            );
        };

        return {
            loading,
            routes,
            title,
            t,

            institutionId,
            convocations,

            dayjs,
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
</style>