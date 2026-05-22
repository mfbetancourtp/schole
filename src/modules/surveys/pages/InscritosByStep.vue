<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack
        :to="{
          name: 'surveys.previewInscritos',
          params: { convocationId: convocationId },
        }"
      ></AppButtonBack>
    </template>

    <template v-slot:content>
      <InscritosStepForm v-if="convocationStepTypeId == 1" :convocationStepId="convocationStepId" :service="service" :filters="filters"></InscritosStepForm>

      <InscritosStepCobro
        v-if="convocationStepTypeId == 2"
        :convocationStepId="convocationStepId"
        :service="service"
        :filters="filters"
        :convocationTitle="stepTypes.convocation.title"
        :stepType="stepType"
        :convocationStepTitle="filters.convocationStep.title"
      ></InscritosStepCobro>

      <InscritosStepDocument v-if="convocationStepTypeId == 3" :convocationStepId="convocationStepId" :service="service" :filters="filters"></InscritosStepDocument>

      <InscritosStepAttachment v-if="convocationStepTypeId == 4" :convocationStepId="convocationStepId" :service="service" :filters="filters"></InscritosStepAttachment>
      <!-- <InscritosStepDiscounts v-if="convocationStepTypeId == 5" :convocationStepId="convocationStepId" :service="service" :filters="filters"></InscritosStepDiscounts> -->
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import InscritosStepForm from '../components/InscritosStepForm.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import InscritosStepCobro from '../components/InscritosStepCobro.vue';
import InscritosStepDocument from '../components/InscritosStepDocument.vue';
import InscritosStepAttachment from '../components/InscritosStepAttachment.vue';
// import InscritosStepDiscounts from '../components/InscritosStepDiscounts.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetConvocationStepsService } from '../services/getConvocationSteps.service';
import { GetSummaryinscritosByStepService } from '../services/summaryinscritosByStep.service';
import { GetFiltersSummaryInscritosByStepService } from '../services/getFiltersSummaryInscritosByStep.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersSummaryInscritosByStepService = new GetFiltersSummaryInscritosByStepService();
const getConvocationStepsService = new GetConvocationStepsService();

export default defineComponent({
  name: 'InscritosByStep',
  components: {
    InscritosStepAttachment,
    InscritosStepDocument,
    InscritosStepCobro,
    InscritosStepForm,
    // InscritosStepDiscounts,
    AppButtonBack,
    AppBaseList,
    AppLoading,
  },

  setup() {
    useMeta({ title: 'Resumen de inscrito por paso' });
    const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Admisión y Registro', url: '' };
        headerStorage.moduleItem = { name: 'Configuración y procesos de admisión', url: '' };
        headerStorage.moduleSubItem = { name: 'Resumen de inscrito por paso', url: '' };
    

    const routes: any = [{ name: '' }];

    const convocationStepTypeId = ref();
    const convocationStepId = ref();
    const convocationId = ref();
    const loading = ref(true);
    const route = useRoute();
    const stepTypes = ref();
    const filters = ref();
    const stepType = ref();
    const title = ref();

    const service = new GetSummaryinscritosByStepService();

    onMounted(async () => {

      loading.value = true;

      try {

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

        await loadRoutes();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const loadRoutes = async () => {
      title.value = `Inscritos paso ${stepType.value} "${filters.value.convocationStep.title}"`;
      routes[0].name = title.value;

      routes.unshift(
        {
          name: `Procesos de matriculación`,
          url: { name: 'surveys.convocationsList' },
        },
        {
          name: `Resumen Inscritos hola "${stepTypes.value.convocation.title}"`,
          url: {
            name: 'surveys.previewInscritos',
            params: { convocationId: convocationId.value },
          },
        }
      );
    };

    return {
      convocationStepTypeId,
      convocationStepId,
      convocationId,
      filters,
      loading,
      service,
      routes,
      title,

      stepTypes,
      stepType,
    };
  },
});
</script>

<style scoped></style>
