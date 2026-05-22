<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'casurid.contentsImportList' }"></AppButtonBack>
      <AppButton style="color: white;" v-if="historyUploadId && dataError.length" label="core.save" @click="saveJsonResponse"></AppButton>
      <AppButton style="color: white;" v-if="historyUploadId" :disabled="!(recordsWithErrors === 0)" @click="saveAndUpload"> Guardar y Subir </AppButton>
    </template>

    <template #content>
      <div>
        <AppLoading v-if="loading"></AppLoading>
        <template v-else>
          <form @submit.prevent="uploadContent" v-if="!historyUploadId">
            <AppFormField :form-control="v$.form.file">
              <label for="file">Subir archivo</label>
              <AppUploadFile input-id="file" v-model="v$.form.file.$model"></AppUploadFile>
            </AppFormField>

            <AppButton label="core.upload"></AppButton>
          </form>

          <div v-if="currentStatus" class="alert alert-info mt-2 d-flex justify-content-center align-content-center gap-2">
            <AppSpinner></AppSpinner>
            <div class="d-flex flex-column">
              <span>{{ states[currentStatus] }}</span>
              <span v-if="totalFormat">
                {{ loadedFormat }} / {{ totalFormat }} ({{ percentageLoaded }}
                %)
              </span>
            </div>
          </div>

          <div v-if="dataError.length" class="mt-4">
            <h2 class="lead">Registros con errores: {{ dataError.length }}, registros corregidos: {{ dataError.length - recordsWithErrors }}</h2>
            <table class="table table-contents">
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Grado</th>
                  <th>Asignatura</th>
                  <th>Contenido</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in dataError" :key="index">
                  <td>
                    <AppAutocomplete v-model="data.levelId" :options="levels"></AppAutocomplete>
                    <small v-if="!data.levelId" class="form-text"> No se ha encontrado el nivel {{ data.level }} </small>
                  </td>
                  <td>
                    <AppAutocomplete v-model="data.degreeId" :options="degrees[i]"></AppAutocomplete>
                    <small v-if="!data.degreeId" class="form-text"> No se ha encontrado el grado {{ data.degree }} </small>
                  </td>
                  <td>
                    <AppAutocomplete v-model="data.subjectId" :options="subjects" :selectable="(option) => !option.isArea"></AppAutocomplete>
                    <small v-if="!data.subjectId" class="form-text"> No se ha encontrado la asignatura {{ data.subject }} </small>
                  </td>
                  <td>
                    <input type="text" v-model="data.content" class="form-control" />
                  </td>
                  <td>
                    <div class="d-flex justify-content-center">
                      <span
                        class="badge"
                        :class="{
                          'bg-danger': !isValidRecord(data),
                          'bg-primary': isValidRecord(data),
                        }"
                      >
                        <AppIcon v-if="!isValidRecord(data)" icon="times"></AppIcon>
                        <AppIcon v-if="isValidRecord(data)" icon="check"></AppIcon>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="dataOk.length">
            <h2 class="lead">Registros OK: {{ dataOk.length }}</h2>

            <table class="table">
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Grado</th>
                  <th>Asignatura</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in dataOk" :key="index">
                  <td>
                    {{ data.level }}
                  </td>
                  <td>
                    {{ data.degree }}
                  </td>
                  <td>
                    {{ data.subject }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useVuelidate } from '@vuelidate/core';
import { useRoute, useRouter } from 'vue-router';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppSpinner from '../../../shared/components/AppSpinner.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetRelatedDataImportContentService, SubjectRelatedData } from '../services/getRelatedDataImportContent.service';
import { extensions, maxSize, required } from '../../../shared/plugins/vuelidate.plugin';
import { JsonResponseDTO } from '../dtos/historyUploadContent.dto';
import { LevelDto } from '../../../shared/dto/level.dto';
import { ImportContentsService } from '../services/importContents.service';
import { GetHistoryUploadContentByIdService } from '../services/getHistoryUploadContentById.service';
import { UpdateHistoryUploadContentService } from '../services/updateHistoryUploadContent.service';
import { UploadContentsService } from '../services/uploadContents.service';

const getRelatedDataImportContentService = new GetRelatedDataImportContentService();
const importContentsService = new ImportContentsService();
const getHistoryUploadContentByIdService = new GetHistoryUploadContentByIdService();
const updateHistoryUploadContentService = new UpdateHistoryUploadContentService();
const uploadContentsService = new UploadContentsService();

export default defineComponent({
  name: 'ContentsImportForm',
  components: {
    AppIcon,
    AppAutocomplete,
    AppSpinner,
    AppLoading,
    AppButton,
    AppFormField,
    AppUploadFile,
    AppButtonBack,
    AppBaseList,
  },
  props: ['title', 'routes'],
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    useMeta({
      title: props.title,
    });

    const loading = ref(true);
    const form = reactive({
      file: null,
    });

    const states = {
      UPLOAD: 'Estamos subiendo el archivo',
      PROCESSING: 'Estamos procesando el archivo',
    };

    const statusError = 'ERROR';

    const currentStatus = ref('');

    const historyUploadId = ref(route.params.importId as string);
    const dataResponse = ref<JsonResponseDTO[]>();

    const levels = ref<LevelDto[]>([]);
    const subjects = ref<SubjectRelatedData[]>([]);

    const total = ref(0);
    const loaded = ref(0);

    const getSize = (size: number) => {
      const limitMb = 1000000;
      const limitGb = 1000000000;

      if (size > limitGb) {
        return (size / limitGb).toFixed(2) + ' GB';
      }

      if (size > limitMb) {
        return (size / limitMb).toFixed(2) + ' MB';
      }

      return size;
    };

    const totalFormat = computed(() => {
      return getSize(total.value);
    });

    const loadedFormat = computed(() => {
      const limitMb = 1000000;
      const limitGb = 1000000000;

      if (total.value > limitGb) {
        return (loaded.value / limitGb).toFixed(2) + ' GB';
      }

      if (total.value > limitMb) {
        return (loaded.value / limitMb).toFixed(2) + ' MB';
      }

      return loaded.value;
    });

    const percentageLoaded = computed(() => Math.floor((loaded.value * 100) / total.value));

    const getLevelById = (levelId: number) => {
      const localLevels = levels.value.filter((level) => level.id === levelId);

      if (localLevels.length) return localLevels[0];

      return null;
    };

    const degrees = computed(() => {
      if (!dataError.value?.length) return [];

      const localDegrees: any = [];

      dataError.value?.forEach((data, index) => {
        if (!data.levelId) {
          localDegrees[index] = [];
        } else {
          const level = getLevelById(data.levelId);
          localDegrees[index] = level?.degrees;
        }
      });

      return localDegrees;
    });

    const v$ = useVuelidate(
      {
        form: {
          file: {
            required,
            maxSize: maxSize(10000),
            extensions: extensions(['zip', 'rar']),
          },
        },
      },
      { form }
    );

    const getHistoryById = async () => {
      const response = await getHistoryUploadContentByIdService.run(historyUploadId.value);

      if (response.status === 'Pendiente') {
        currentStatus.value = 'PROCESSING';
        await verifyStatus();
      } else {
        dataResponse.value = response.jsonResponse;
      }
    };

    const verifyStatus = async () => {
      setTimeout(async () => {
        try {
          const response = await getHistoryUploadContentByIdService.run(historyUploadId.value);

          if (response.status === 'Pendiente') {
            currentStatus.value = 'PROCESSING';
            await verifyStatus();
          } else {
            currentStatus.value = '';
            dataResponse.value = response.jsonResponse;
          }
        } catch (e) {
          console.log('error', e);
        }
      }, 5000);
    };

    const dataOk = computed(() => {
      if (!dataResponse.value) return [];

      return dataResponse.value.filter((data) => data.status !== statusError);
    });

    const dataError = computed<JsonResponseDTO[]>(() => {
      if (!dataResponse.value) return [];

      return dataResponse.value.filter((data) => data.status === statusError);
    });

    onMounted(async () => {
      if (historyUploadId.value) {
        await getHistoryById();
      }

      const response = await getRelatedDataImportContentService.run();

      levels.value = response.levels;
      subjects.value = response.subjects;

      loading.value = false;
    });

    const recordsWithErrors = computed(() => {
      let amount = 0;

      dataError.value.forEach((data) => {
        if (!isValidRecord(data)) {
          amount += 1;
        }
      });

      return amount;
    });

    const isValidRecord = (data: JsonResponseDTO) => {
      return !(!data.levelId || !data.degreeId || !data.subjectId);
    };

    const saveJsonResponse = async () => {
      try {
        await updateHistoryUploadContentService.run({ jsonResponse: dataResponse.value }, parseInt(historyUploadId.value));
      } catch (e) {
        console.log('error', e);
      }
    };

    const processUploadContent = async (progressEvent: ProgressEvent) => {
      loaded.value = progressEvent.loaded;
      total.value = progressEvent.total;
    };

    const uploadContent = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      currentStatus.value = 'UPLOAD';

      try {
        const response = await importContentsService.run(form.file as unknown as File, processUploadContent);

        await router.push({
          name: 'casurid.contentsImportEdit',
          params: {
            importId: response.historyUploadId,
          },
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    const saveAndUpload = async () => {
      try {
        await saveJsonResponse();
        await uploadContentsService.run(parseInt(historyUploadId.value));

        await router.push({
          name: 'casurid.contentsImportList',
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      v$,
      states,
      historyUploadId,
      currentStatus,
      dataError,
      dataOk,
      levels,
      degrees,
      subjects,
      recordsWithErrors,
      totalFormat,
      loadedFormat,
      percentageLoaded,
      uploadContent,
      isValidRecord,
      saveJsonResponse,
      saveAndUpload,
    };
  },
});
</script>

<style scoped>
table {
  --num-columns-table-import-contents: 4;
}

.table-contents > thead > tr > th {
  width: calc(100% / var(--num-columns-table-import-contents));
  max-width: calc(100% / var(--num-columns-table-import-contents));
}
</style>
