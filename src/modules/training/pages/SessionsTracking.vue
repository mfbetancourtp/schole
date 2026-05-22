<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template v-slot:content>
      <AppEmptyResponse v-if="!periodsNames.length" :show-image="true" subtitle="Sin periodo de planeacion asignado"></AppEmptyResponse>
      <template v-else>
        <div class="d-flex flex-row-reverse">
          <div class="w-25">
            <AppFilter v-model="periodsNamesId" :filter-name="'SessionsTracking.periodsNamesId'">
              <label>Selecciona el periodo de planeación</label>
              <AppAutocomplete :options="periodsNames" label="title" v-model="periodsNamesId"></AppAutocomplete>
            </AppFilter>
          </div>
        </div>
        <AppEmptyResponse v-if="!dataSession.length" :show-image="true" subtitle="Sin sesiones asignadas"></AppEmptyResponse>
        <template v-else>
          <table class="table">
            <thead>
              <tr>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Fecha</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Nombre-Temas</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Asistentes</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Retrasos</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Ausencias</th>
                <th style="font-size: 0.8rem" class="p-1 pe-0">Opciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in dataSession" :key="index">
                <td class="p-1 pe-0 w-3">
                  <span style="font-size: 0.8rem">{{ item.dateSinceDate }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ item.name }} - {{ item.description }}</span>
                </td>

                <td class="p-1 pe-0 w-2">
                  <span style="font-size: 0.8rem">{{ item.countAttendances }}</span>
                </td>

                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem">{{ item.attendancesIsAbscense }}</span>
                </td>
                <td class="p-1 pe-0 w-1">
                  <span style="font-size: 0.8rem">{{ item.attendancesIsDelayArrival }}</span>
                </td>
                <td>
                  <AppButton @click="openViewEvidencieSessionsModal(data)" v-tooltip="'Asistencia'" variant="primary" icon="clipboard-list" outlined></AppButton>
                  <AppUpload v-if="!item.urlEvidence" v-model="file" @update:model-value="(file: any) => getFile(item.id, file)"></AppUpload>
                  <AppButton v-else @click="openViewEvidencieModal(item)" v-tooltip="'Ver evidencia'" variant="primary" icon="eye"></AppButton>
                </td>
              </tr>
            </tbody>
          </table>
          <AppModal v-model="viewEvidencieModal" :size="'xl'">
            <ViewEvidencieModal v-if="viewEvidencieModal" :urlFile="currentEvidence.urlEvidence" title-modal="Evidencia Sesiones" @delete="deleteFile"> </ViewEvidencieModal>
          </AppModal>
          <!-- <AppModal v-model="viewAssistanceModal" :size="'l'"> -->
          <!-- <ViewAssistanceModal v-if="viewAssistanceModal" :data="currentAssistance" @close="closeViewEvidencieModal"> </ViewAssistanceModal> -->
          <!-- </AppModal> -->
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { debounce } from 'ts-debounce';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppUpload from '../../../shared/components/Forms/AppUpload.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import ViewEvidencieModal from '../components/ViewEvidencieModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetAllPeriodsWithPaginationService } from '../services/getAllPeriodsWithPagination.service';
import { GetSessionsByCourseIdService } from '../services/getSessionsByCourseId.service';
import { SessionsDto } from '../dtos/sessionTracking.dto';
import { LoadEvidenceSessionsService } from '../services/loadEvidenceSessions.service';
import { DeleteEvidenceSessionsService } from '../services/deleteEvidenceSessions.service';

const getAllPeriodsWithPaginationService = new GetAllPeriodsWithPaginationService();
const getSessionsByCourseIdService = new GetSessionsByCourseIdService();
const loadEvidenceSessionsService = new LoadEvidenceSessionsService();
const deleteEvidenceSessionsService = new DeleteEvidenceSessionsService();

export default defineComponent({
  name: 'SessionTracking',
  components: {
    AppBaseList,
    AppLoading,
    AppFilter,
    AppAutocomplete,
    AppEmptyResponse,
    AppUpload,
    ViewEvidencieModal,
    AppButton,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'Evidencia de sesiones';

    const periodsNames = ref();
    const dataSession = ref<any[]>([]);
    const sessions: Ref<SessionsDto[]> = ref([]);

    const periodsNamesId = ref(null);
    const planningWeekId = ref();

    const courseId = parseInt(route.params.courseId.toString(), 10);

    const loadingData = ref(false);
    const loading = ref(true);
    const file: Ref<any> = ref(null);
    const viewEvidencieModal = ref(false);
    const currentEvidence = ref();
    const viewEvidencieModalAssistance = ref(false);
    const currentEvidenceAssistance = ref();
    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Seguimiento',
        url: { name: 'training.courseTracking' },
      },
      {
        name: title,
      },
    ];

    onMounted(async () => {
      try {
        let response = await getAllPeriodsWithPaginationService.run({ perPage: 100 }, courseId);
        periodsNames.value = response.data;

        const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

        if (localfilters && !!localfilters['SessionsTracking.periodsNamesId']) {
          if (periodsNames.value.length) {
            for (let i = 0; i < periodsNames.value.length; i++) {
              if (localfilters['SessionsTracking.periodsNamesId'] == periodsNames.value[i].id) {
                periodsNamesId.value = await periodsNames.value[i].id;
              }
            }
          }
        } else {
          if (periodsNames.value.length) periodsNamesId.value = await periodsNames.value[0].id;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(periodsNamesId, async (valor) => {
      await getdata();
      console.log('prueba', valor);
    });

    const searchPeriods = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);
        const response = await getPeriodsNames(search);
        periodsNames.value = response.data;
        loading(false);
      }
    }, 800);

    const getPeriodsNames = (search?: string) => {
      return getAllPeriodsWithPaginationService.run({ search }, courseId);
    };

    const getdata = async () => {
      loadingData.value = true;
      console.log('data2', periodsNamesId.value);
      dataSession.value = await getSessionsByCourseIdService.run(courseId, periodsNamesId.value);
      loadingData.value = false;
    };

    const getFile = async (sessionsId: number, file: any) => {
      let fileSend: any = { files: file };
      await loadEvidenceSessionsService.run(fileSend, sessionsId);
      await getdata();
    };
    const openViewEvidencieModal = async (data: any) => {
      console.log('datos', data);
      currentEvidence.value = data;
      viewEvidencieModal.value = true;
    };

    const deleteFile = async () => {
      await deleteEvidenceSessionsService.run(currentEvidence.value.id);
      viewEvidencieModal.value = false;
      await getdata();
    };
    const openViewEvidencieSessionsModal = async (data: any) => {
      console.log('datos', data);
      currentEvidenceAssistance.value = data;
      viewEvidencieModalAssistance.value = true;
    };

    return {
      loading,
      routes,
      title,
      t,

      periodsNamesId,
      periodsNames,
      planningWeekId,
      loadingData,
      dataSession,
      searchPeriods,
      sessions,
      getFile,
      file,
      viewEvidencieModal,
      openViewEvidencieModal,
      currentEvidence,
      deleteFile,
      openViewEvidencieSessionsModal,
      currentEvidenceAssistance,
      viewEvidencieModalAssistance,
    };
  },
});
</script>

<style scoped>
.icon_Container {
  align-content: flex-start;
  display: block;
}

.table td {
  vertical-align: middle;
  text-align: center;
}

.table tr {
  vertical-align: middle;
  text-align: center;
}
</style>
