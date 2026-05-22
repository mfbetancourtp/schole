<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" isCard>
      <template #actions>
        <AppButtonBack :to="{ name: 'casurid.contentsList' }"></AppButtonBack>
        <AppButton style="color: white;">Guardar</AppButton>
      </template>

      <template #content>
        <AppLoading v-if="loadingFilters"></AppLoading>
        <div>
          <div class="form-row">
            <AppFormField :form-control="v$.form.degreeId">
              <label for="degreeId">Nivel - Grado</label>
              <v-select
                class="tw-flex-1"
                inputId="degreeId"
                v-model="v$.form.degreeId.$model"
                :options="levelsDegrees.value"
                label="levelDegreeName"
                :reduce="(levelDegree) => levelDegree.degreeId"
              ></v-select>
            </AppFormField>

            <AppFormField :form-control="v$.form.subjectId">
              <label for="subjectId">Asignatura</label>
              <v-select class="tw-flex-1" inputId="subjectId" v-model="v$.form.subjectId.$model" :options="subjects.value" label="name" :reduce="(subject) => subject.id"></v-select>
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.contentTypeId">
              <label for="contentTypeId">Tipo</label>
              <v-select
                class="tw-flex-1"
                inputId="contentTypeId"
                v-model="v$.form.contentTypeId.$model"
                :options="contentTypes.value"
                label="name"
                :reduce="(contentType) => contentType.id"
              ></v-select>
            </AppFormField>

            <AppFormField :form-control="v$.form.title">
              <label for="title">Título</label>
              <input type="text" class="form-control" v-model="v$.form.title.$model" id="title" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.description">
            <label for="description">Descripción</label>
             <AppVoiceInput v-model="v$.form.description.$model" id="description" textareaClass="form-control"  />
          </AppFormField>

          <div class="form-row">
            <AppFormField :form-control="v$.form.contentPdf">
              <label for="contentPdf">Indice temático (PDF, Imagen)</label>
              <AppUploadFile input-id="contentPdf" v-model="v$.form.contentPdf.$model" :current-file="currentContentPdf"></AppUploadFile>
            </AppFormField>
            <AppFormField :form-control="v$.form.isFile">
              <label for="contentPdf">Subir un archivo?</label>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" v-model="v$.form.isFile.$model" />
              </div>
            </AppFormField>
            <AppFormField v-if="v$.form.isFile.$model" :form-control="v$.form.contentZip">
              <label for="contentZip">Contenido (zip, rar)</label>
              <AppUploadFile input-id="contentZip" v-model="v$.form.contentZip.$model" :current-file="currentContentZip"></AppUploadFile>
            </AppFormField>
            <AppFormField v-else :form-control="v$.form.urlLocation">
              <label for="urlLocation">Url contenido</label>
              <input type="text" class="form-control" v-model="v$.form.urlLocation.$model" id="urlLocation" />
            </AppFormField>
            <AppFormField :form-control="v$.form.duration">
              <label for="duration">Duración (Horas)</label>
              <input type="number" class="form-control" v-model="v$.form.duration.$model" id="duration" />
            </AppFormField>
          </div>
        </div>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf, numeric, maxSize, extensions } from '../../../shared/plugins/vuelidate.plugin';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';

import { ContentTypeDto } from '../dtos/contentType.dto';
import { SubjectDto } from '../dtos/subject.dto';
import { LevelsDegreeDto } from '../dtos/levelsDegree.dto';
import { GetFiltersContentForm } from '../services/getFiltersContentForm.service';
import { CreateOrUpdateContentService } from '../services/createOrUpdateContent.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getFiltersContentForm = new GetFiltersContentForm();
const createOrUpdateContentService = new CreateOrUpdateContentService();

export default defineComponent({
  name: 'ContentsForm',
  components: {
    AppUploadFile,
    AppLoading,
    AppButton,
    AppFormField,
    AppButtonBack,
    AppBaseList,
    AppVoiceInput,
  },
  props: ['title', 'routes', 'data'],
  setup(props) {
    const titlePage = ref(props.title);
    const routesPage = ref(props.routes);
    const dataPage = ref(props.data);
    useMeta({
      titlePage,
    });
    const router = useRouter();
    const contentTypes: { value: ContentTypeDto[] } = reactive({
      value: [],
    });
    const subjects: { value: SubjectDto[] } = reactive({
      value: [],
    });
    const levelsDegrees: { value: LevelsDegreeDto[] } = reactive({
      value: [],
    });
    const currentContentZip = dataPage.value?.urlLocation;
    const currentContentPdf = dataPage.value?.index;
    const loadingFilters = ref(true);
    const form = reactive({
      degreeId: dataPage.value?.degreeId,
      subjectId: dataPage.value?.subjectId,
      title: dataPage.value?.title,
      description: dataPage.value?.description ? dataPage.value?.description : null,
      contentTypeId: dataPage.value?.contentTypeId,
      contentZip: null,
      urlLocation: dataPage.value?.urlLocation ? dataPage.value?.urlLocation : null,
      contentPdf: null,
      duration: dataPage.value?.duration,
      isFile: false,
    });
    const v$ = useVuelidate(
      {
        form: {
          degreeId: { required },
          subjectId: { required },
          title: { required },
          description: {},
          isFile: {},
          contentZip: {
            required: !dataPage.value?.id && form.isFile ? required : false,
            maxSize: maxSize(30),
            extensions: extensions(['zip', 'rar']),
          },
          urlLocation: { requiredIf: requiredIf(() => !form.isFile) },
          contentPdf: {
            maxSize: maxSize(10),
          },
          contentTypeId: { required },
          duration: { required, numeric },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const response = await getFiltersContentForm.run();
        contentTypes.value = response.contentTypes;
        subjects.value = response.subjects;
        levelsDegrees.value = response.levelsDegrees;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Casurid', url: '' };
        headerStorage.moduleItem = { name: 'Contenidos', url: '' };
        headerStorage.moduleSubItem = { name: props.title, url: '' };
      } catch (e) {
        console.log('This init component', e);
      }
      loadingFilters.value = false;
    });

    watch(
      () => form.isFile,
      (valor) => {
        if (valor) {
          form.urlLocation = null;
        } else {
          form.contentZip = null;
        }
      }
    );
    const save = async () => {
      let levelId = 0;
      if (form.degreeId) {
        levelsDegrees.value.forEach((levelDegree) => {
          if (levelDegree.degreeId === form.degreeId) {
            levelId = levelDegree.levelId;
          }
        });
      }
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        let dataSend = {
          degreeId: form.degreeId,
          subjectId: form.subjectId,
          title: form.title,
          description: form.description,
          contentTypeId: form.contentTypeId,
          contentZip: form.contentZip,
          urlLocation: form.urlLocation,
          contentPdf: form.contentPdf,
          duration: form.duration,
        };
        console.log('dataPage send', dataSend);

        await createOrUpdateContentService.run(
          {
            ...dataSend,
            levelId,
          },
          dataPage.value?.id
        );

        await router.push({
          name: 'casurid.contentsList',
        });
      } catch (e) {
        console.log('This error send dataPage', e);
      }
    };

    return {
      titlePage,
      routesPage,
      loadingFilters,
      contentTypes,
      subjects,
      levelsDegrees,
      v$,
      currentContentZip,
      currentContentPdf,
      save,
    };
  },
});
</script>

<style scoped></style>
