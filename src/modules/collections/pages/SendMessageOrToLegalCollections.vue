<template>
    <AppLoading v-if="loading"></AppLoading>

    <FormToSendMessageOrLegalCollections
        v-else-if="relatedData"
        :title="title"
        :routes="routes"
        :quotes-ids="quotesIds"
        :related-data="relatedData"
        :matriculate-id="matriculateId"
    ></FormToSendMessageOrLegalCollections>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import FormToSendMessageOrLegalCollections from '../components/FormToSendMessageOrLegalCollections.vue';

import { PortfolioMonitoringByStudentDto } from '../dtos/portfolioMonitoringByStudent.dto';

import { GetRelatedDataPortfolioMonitoringByStudentService } from '../services/getRelatedDataPortfolioMonitoringByStudent.service';

const getRelatedDataService = new GetRelatedDataPortfolioMonitoringByStudentService();

export default defineComponent({
    name: 'SendMessageOrToLegalCollections',
    components: { FormToSendMessageOrLegalCollections, AppLoading },

    setup() {
        const { t } = useI18n();
        const route = useRoute();
        const goTo = route.params.goTo as string;;

        const title = goTo == 'legal-collections' ? 'Enviar a cobro jurídico' : 'Enviar nuevo mensaje';
        const routes: any[] = [{ name: title }];
        useMeta({ title: t(title) });

        const relatedData: Ref<PortfolioMonitoringByStudentDto | null> = ref(null);
        const quotesIds: Ref<number[]> = ref([]);

        const matriculateId = ref();

        const loading = ref(true);

        onMounted(async () => {
            try {
                matriculateId.value = parseInt(route.params.matriculateId.toString(), 10);

                relatedData.value = await getRelatedDataService.run(matriculateId.value);

                if (route.query.quotesIds) {
                    let quotesIdsAux: any = route.query.quotesIds as string;
                    quotesIdsAux = quotesIdsAux.split(',');

                    quotesIdsAux.forEach((quotesId: string) => {
                        quotesIds.value.push(parseInt(quotesId));
                    });
                }

                await loadRoutes();
            } catch (e) {console.log(e)}

            loading.value = false;
        });

        const loadRoutes = async () => {
            try {
                routes.unshift(
                    {
                        name: `Seguimiento cartera`,
                        url: { name: 'collections.portfolioMonitoring' },
                    },
                    { 
                        name: `Cartera por estudiante "${relatedData.value?.student.names} ${relatedData.value?.student.lastnames}"`,
                        url: { name: 'collections.portfolioMonitoringByStudent' },
                    }
                );
            } catch (e) {}
        };

        return {
            loading,
            routes,
            title,

            matriculateId,
            relatedData,
            quotesIds,
        };
    },
});
</script>
  
<style scoped>

</style>