<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" :subtitle="subtitle" isCard>
      <template v-slot:actions>
        <AppButtonBack :to="{ name: 'casurid.plansList' }"></AppButtonBack>

        <AppButton style="color: white;" @click="saveAndCreate"> Guardar y crear otro </AppButton>

        <AppButton style="color: white;" @click="saveAndExit"> Guardar </AppButton>
      </template>
      <template v-slot:content>
        <div  >
          <div class="card-body">
            <AppLoading v-if="loading"></AppLoading>
            <div v-else class="row">
              <div class="col-12 col-md-6">
                <AppFormField :form-control="v$.form.title">
                  <label for="title">Título</label>
                  <input type="text" class="form-control" v-model="v$.form.title.$model" id="title" />
                </AppFormField>

                <AppFormField :form-control="v$.form.description">
                  <label for="description">Descripción</label>
                  <AppVoiceInput  v-model="v$.form.description.$model" id="description" textareaClass="form-control"  />
                </AppFormField>

                <AppFormField :form-control="v$.form.fileIndex">
                  <label for="index">Indice temático (PDF, Imagen)</label>
                  <AppUploadFile input-id="index" v-model="v$.form.fileIndex.$model" :current-file="currentIndex"></AppUploadFile>
                </AppFormField>

                <div class="form-row">
                  <AppFormField :form-control="v$.form.defaultUnitValue">
                    <label for="defaultUnitValue">Valor</label>
                    <input type="number" class="form-control" v-model="v$.form.defaultUnitValue.$model" id="defaultUnitValue" />
                  </AppFormField>

                  <AppFormField :form-control="v$.form.validityPeriod">
                    <label for="validityPeriod">Vigencia (Meses)</label>
                    <input type="number" class="form-control" v-model="v$.form.validityPeriod.$model" id="validityPeriod" />
                  </AppFormField>
                </div>

                <AppFormField :form-control="v$.form.fileThumbnail">
                  <label for="thumbnail">Carátula</label>
                  <AppUploadImage v-model="v$.form.fileThumbnail.$model" :current-thumbnail="currentThumbnail" input-id="thumbnail"></AppUploadImage>
                </AppFormField>
              </div>

              <div class="col-12 col-md-6">
                <AppFormField :form-control="v$.form.contentsIds">
                  <label for="contentsIds" class="lead">Contenidos</label>
                  <v-select inputId="contentsIds" v-model="v$.form.contentsIds.$model" :options="contents.value" multiple label="title" :reduce="(content) => content.id"></v-select>
                </AppFormField>
              </div>
            </div>
          </div>
        </div>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { numeric, required, defaultImage, maxSize } from '../../../shared/plugins/vuelidate.plugin';

import { GetRelatedDataPlansFormService } from '../services/getRelatedDataPlansForm.service';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { ContentDto } from '../dtos/content.dto';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import { CreateOrUpdatePlanService } from '../services/createOrUpdatePlan.service';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getRelatedDataPlansFormService = new GetRelatedDataPlansFormService();
const createOrUpdatePlanService = new CreateOrUpdatePlanService();

export default defineComponent({
  name: 'PlansForm',
  components: {
    AppUploadFile,
    AppUploadImage,
    AppButtonBack,
    AppButton,
    AppFormField,
    AppLoading,
    AppBaseList,
    AppVoiceInput,
  },
  props: ['title', 'routes', 'data'],
  setup(props) {
    const titlePage = ref(props.title);
    const route = useRoute();
    const router = useRouter();
    const { levelId, degreeId, subjectId } = route.query as any;
    const data = ref(props.data);
    const loading = ref(true);
    const subtitle = ref('');
    const contents: { value: ContentDto[] } = reactive({
      value: [],
    });
    const routeBack = ref('casurid.plansList');
    const query = reactive({
      value: {},
    });

    const currentThumbnail = data.value?.thumbnail;
    const currentIndex = data.value?.index;

    useMeta({
      titlePage,
    });

    const form = reactive({
      title: data.value?.title,
      description: data.value?.description,
      defaultUnitValue: data.value?.defaultUnitValue,
      validityPeriod: data.value?.validityPeriod,
      fileIndex: null,
      fileThumbnail: null,
      contentsIds: data.value?.contentsIds ?? [],
    });

    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          description: {},
          fileIndex: {
            maxSize: maxSize(),
          },
          defaultUnitValue: { required, numeric },
          validityPeriod: { required, numeric },
          fileThumbnail: {
            required: !data.value?.id ? required : false,
            defaultImage,
          },
          contentsIds: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      if (levelId && degreeId && subjectId) {
        const params: any = {
          levelId: parseInt(levelId.toString()),
          degreeId: parseInt(degreeId.toString()),
          subjectId: parseInt(subjectId.toString()),
          productId: data.value?.id,
        };

        const response = await getRelatedDataPlansFormService.run(params);

        subtitle.value = `${response.subject.name} - ${response.degree.name} - ${response.level.name}`;
        contents.value = response.contents;

        response.contents.forEach((content) => {
          if (content.checked) {
            form.contentsIds.push(content.id);
          }
        });
      }
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Casurid', url: '' };
      headerStorage.moduleItem = { name: 'Planes', url: '' };
      headerStorage.moduleSubItem = { name: titlePage, url: '' };
      loading.value = false;
    });

    const saveAndCreate = async () => {
      routeBack.value = 'casurid.plansCreate';
      query.value = route.query;
      await save();
    };

    const saveAndExit = async () => {
      routeBack.value = 'casurid.plansList';
      query.value = {};
      await save();
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid || !degreeId || !levelId || !subjectId) return;

      try {
        await createOrUpdatePlanService.run(
          {
            levelId,
            degreeId,
            subjectId,
            ...form,
          },
          data.value?.id
        );

        await router.push({
          name: routeBack.value,
          query: query.value,
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      titlePage,
      v$,
      loading,
      subtitle,
      contents,
      currentThumbnail,
      currentIndex,
      save,
      saveAndCreate,
      saveAndExit,
    };
  },
});
</script>

<style scoped></style>
