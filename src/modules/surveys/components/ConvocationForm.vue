<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" isCard>
      <template #actions>
        <AppButtonBack :to="{ name: 'surveys.convocationsList' }"></AppButtonBack>
        <AppButton style="color: white">{{ 'Guardar' }}</AppButton>
      </template>

      <template #content>
        <AppLoading v-if="loading"></AppLoading>

        <div v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.title" :label="'Nombre'">
              <input id="title" type="text" class="form-control" v-model="v$.form.title.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.startDate" :label="'Fecha inicio'">
              <input id="startDate" type="date" class="form-control" v-model="v$.form.startDate.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.endDate" :label="'Fecha cierre'">
              <input id="endDate" type="date" class="form-control" v-model="v$.form.endDate.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.thumbnail" :label="'Miniatura'">
              <AppUploadImage input-id="thumbnail" :current-thumbnail="currentThumbnail" v-model="v$.form.thumbnail.$model"></AppUploadImage>
            </AppFormField>

            <AppFormField :form-control="v$.form.banner" :label="'Banner'">
              <AppUploadImage input-id="banner" :current-thumbnail="currentBanner" v-model="v$.form.banner.$model"> </AppUploadImage>
            </AppFormField>

            <AppFormField :form-control="v$.form.defaultRoleId" :label="'Rol por defecto'">
              <AppAutocomplete v-model="v$.form.defaultRoleId.$model" :options="roles"></AppAutocomplete>
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.description" :label="'Descripción'">
            <AppVoiceInput v-model="v$.form.description.$model"
               id="description" textareaClass="form-control"  />
          </AppFormField>

          <div class="form-row">
            <AppFormField class="col-5" :form-control="v$.form.degreeIds" label="Dirigido a:">
              <AppAutocomplete v-model="v$.form.degreeIds.$model" :options="levelsAndDegreesSelect" :multiple="true"> </AppAutocomplete>
            </AppFormField>

            <AppFormField class="col-5" :form-control="v$.form.userNotification" label="Funcionario a notificar">
              <AppUsersForSelect :id="v$.form.userNotification.$model" @user-data="(data) => (v$.form.userNotification.$model = data.id)"></AppUsersForSelect>
            </AppFormField>

            <div class="d-flex gap-3">
                <AppFormField :form-control="v$.form.active" label="Activar?">
                  <div class="mt-2 form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="active" v-model="v$.form.active.$model" />
                    <label class="form-check-label" for="active">{{ v$.form.active.$model ? 'Sí' : 'No' }}</label>
                  </div>
                </AppFormField>
                <div>
                  <AppFormField :form-control="v$.form.requiredOrder" label="Requiere Orden?">
                    <div class="mt-2 form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="activeRequiredOrden" v-model="v$.form.requiredOrder.$model" />
                      <label class="form-check-label text-lg-start" for="activeRequiredOrden">{{ v$.form.requiredOrder.$model ? 'Sí' : 'No' }}</label>
                    </div>
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
import { required, defaultImage, maxSize } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppUsersForSelect from '../../../shared/components/Forms/AppUsersForSelect.vue';

import { LevelDto } from '../../../shared/dto/level.dto';
import { DegreeDto } from '../../../shared/dto/degree.dto';

import { GetRolesService } from '../services/getRoles.service';
import { CreateOrUpdateConvocationService } from '../services/createOrUpdateConvocation.service';
import { GetLevelsWithDegreesService } from '../../../shared/services/getLevelsWithDegrees.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateConvocationService = new CreateOrUpdateConvocationService();
const getLevelsWithDegreesService = new GetLevelsWithDegreesService();
const getRolesService = new GetRolesService();

export default defineComponent({
  name: 'ConvocationForm',

  components: {
    AppUsersForSelect,
    AppAutocomplete,
    AppUploadImage,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppVoiceInput
  },

  props: ['title', 'routes', 'data'],

  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const data = props.data ?? null;

    useMeta({ title: props.title });

    const academicPeriodId = route.query.academicPeriodId;
    const currentThumbnail = data?.thumbnail;
    const currentBanner = data?.urlBanner;

    const levelsAndDegreesSelect: Ref<any[]> = ref([]);
    const roles: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      academicPeriodId: data?.academicPeriodId ?? academicPeriodId,

      title: data?.title,
      startDate: data?.startDate,
      endDate: data?.endDate,

      thumbnail: null,
      banner: null,
      defaultRoleId: data?.defaultRoleId,

      description: data?.description ?? '',

      degreeIds: [] as any,
      userNotification: data?.userNotification ?? null,
      active: data?.active ? true : false,
      requiredOrder: props.data?.requiredOrder ? true : false,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },

          title: { required },
          startDate: { required },
          endDate: { required },
          requiredOrder: {},

          thumbnail: {
            required: !data?.id ? required : false,
            defaultImage,
            maxSize: maxSize(100),
          },
          banner: { defaultImage, maxSize: maxSize(100) },
          defaultRoleId: { required },

          description: {},

          degreeIds: { required },
          userNotification: { required },
          active: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Formularios', url: '' };
      headerStorage.moduleItem = {
        name: 'Configuración y procesos de admisión',
        url: '',
      };
      headerStorage.moduleSubItem = { name: props.title, url: '' };

      let levelsWithDegrees: any[] = await getLevelsWithDegreesService.run();
      roles.value = await getRolesService.run();

      if (data?.degreeIds) {
        let ids: any[] = data.degreeIds.split(',');
        ids.forEach((id: any) => form.degreeIds.push(parseInt(id)));
      }

      levelsWithDegrees.forEach((level: LevelDto) => {
        level.degrees.forEach((degree: DegreeDto) => {
          levelsAndDegreesSelect.value.push({
            id: degree.id,
            name: `${level.name} - ${degree.name}`,
          });
        });
      });

      loading.value = false;
    });

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        const newData = {
          ...form,
          degreeIds: form.degreeIds.join(','),
          active: form.active ? 1 : 0,
          requiredOrder: form.requiredOrder ? 1 : 0,
        };

        if (!newData.banner) {
          // @ts-ignore
          delete newData.banner;
        }

        if (!newData.thumbnail) {
          // @ts-ignore
          delete newData.thumbnail;
        }

        await createOrUpdateConvocationService.run(newData, data?.id);

        await router.push({ name: 'surveys.convocationsList' });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      save,
      v$,

      levelsAndDegreesSelect,
      currentThumbnail,
      currentBanner,
      roles,
    };
  },
});
</script>
