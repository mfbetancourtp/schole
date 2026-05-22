<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'surveys.admissionProcessesList' }" />

      <AppButton
        style="color: white"
        label="Ver detalle"
        :to="{
          name: 'surveys.adminConvocationSummaryInscritos',
          params: { convocationId: convocationId },
        }"
      ></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />
      <template v-else>
        <AppTable>
          <template #head>
            <th scope="col">Tipo</th>
            <th scope="col">Paso</th>
            <th scope="col" class="text-center">#{{ t('academicAdministration.courseAdministration.table.inscribed') }}</th>
            <th scope="col" class="text-center">#Aprobados</th>
            <th scope="col" class="text-center">{{ t('core.actions') }}</th>
          </template>

          <template #body>
            <tr v-for="(step, index) in data" :key="index">
              <td>{{ step.typeName }}</td>
              <td>{{ step.title }}</td>
              <td class="text-center">{{ step.cantEnrolls }}</td>
              <td class="text-center">{{ step.cantEnrollsApproved }}</td>
              <td class="text-center">
                <AppButton
                  v-tooltip="'Ver Inscritos'"
                  icon="users"
                  outlined
                  :to="{
                    name: 'surveys.inscritosByStep',
                    params: {
                      convocationStepId: step.id,
                      convocationId: convocationId,
                    },
                  }"
                ></AppButton>
              </td>
            </tr>
          </template>
        </AppTable>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppTable from '../../../shared/components/Datatable/AppTable.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetConvocationByIdService } from '../services/getConvocationById.service';
import { GetSummaryListStepsService } from '../services/getSummaryListSteps.service';
import { useHeaderStore } from '../../../stores/header.store';

const getSummaryListStepsService = new GetSummaryListStepsService();
const getConvocationByIdService = new GetConvocationByIdService();

export default defineComponent({
  name: 'AdminConvocatoriaPreviewInscritos',

  components: {
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppTable,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();

    useMeta({ title: 'Resumen de Inscritos' });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Admisión y Registro', url: '' };
    headerStorage.moduleItem = {
      name: 'Configuración y procesos de admisión',
      url: '',
    };

    const convocationId = ref();
    const convocation = ref();
    const title = ref();
    const data = ref();

    const loading = ref(true);

    onMounted(async () => {
      try {
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);

        convocation.value = await getConvocationByIdService.run(convocationId.value);
        let res = await getSummaryListStepsService.run(convocationId.value);

        title.value = `Resumen Inscritos "${convocation.value.title}"`;

        data.value = res.convocation.steps;

        headerStorage.moduleSubItem = { name: title.value, url: '' };
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    return {
      loading,
      title,
      t,
      convocationId,
      data,
    };
  },
});
</script>
