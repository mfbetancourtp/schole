<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <div>
            <AppFormField :form-control="v$.form.lmsInstitutionPlatformId" label="Plataforma">
              <AppAutocomplete v-model="v$.form.lmsInstitutionPlatformId.$model" :options="lmsInstPlatform" :input-id="'typePlatform'" :clearable="false"></AppAutocomplete>
            </AppFormField>
          </div>
          <div class="form-row">
            <AppFormField :form-control="v$.form.typeSynchronization" label="Tipo de sincronización">
              <AppAutocomplete v-model="v$.form.typeSynchronization.$model" :options="synchronizationTypes" :input-id="'typeSynchronization'" :clearable="false"></AppAutocomplete>
            </AppFormField>

            <template v-if="v$.form.typeSynchronization.$model == 1">
              <AppFormField :form-control="v$.form.categoryId" label="Categoría destino en el lMS">
                <AppAutocomplete v-model="v$.form.categoryId.$model" :options="lmsCategories" :input-id="'categoryId'" :clearable="false"></AppAutocomplete>
              </AppFormField>
            </template>
          </div>

          <template v-if="v$.form.typeSynchronization.$model == 2">
            <AppFormField :form-control="v$.form.nameUseCourseCreated" label="Curso destino en el LMS (nombre corto)*">
              <input
                v-model="v$.form.nameUseCourseCreated.$model"
                id="nameUseCourseCreated"
                class="form-control"
                type="text"
                required
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
          </template>

          <div class="form-row">
            <AppFormField :form-control="v$.form.forceCreationCourse" :label="'Forzar la creación del curso'" class="form-check form-switch">
              <input v-model="v$.form.forceCreationCourse.$model" id="forceCreationCourse" class="form-check-input" type="checkbox" />
            </AppFormField>

            <AppFormField :form-control="v$.form.forceCreationUsers" :label="'Forzar la creación de los usuarios'" class="form-check form-switch">
              <input v-model="v$.form.forceCreationUsers.$model" id="forceCreationUsers" class="form-check-input" type="checkbox" />
            </AppFormField>
          </div>
          <div>
            <label for="identification">Metodos de sincronización</label>
            <div class="form-row">
              <AppFormField :form-control="v$.form.activities" :label="'Actividades'" class="form-check form-switch">
                <input v-model="v$.form.activities.$model" id="forceCreationCourse" class="form-check-input" type="checkbox" />
              </AppFormField>

              <AppFormField :form-control="v$.form.syncLmsNew" :label="'Clasificación de actividades'" class="form-check form-switch">
                <input v-model="v$.form.syncLmsNew.$model" id="forceCreationUsers" class="form-check-input" type="checkbox" />
              </AppFormField>
            </div>
          </div>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, ref, Ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CategoryMoodleDto } from '../dtos/customizeSynchronization.dto';
import { ISyncClassroomAndLmsService } from '../services/syncClassroomAndLms.service';

import { SyncClassroomAndLmsService } from '../services/syncClassroomAndLms.service';
import { GetCategoriesMoodleService } from '../services/getCategoriesMoodle.service';
import { GetLmsInstitutionPlatformsService } from '../services/getLmsInstitutionPlatforms.service';

const syncClassroomAndLmsService = new SyncClassroomAndLmsService();
const getCategoriesMoodleService = new GetCategoriesMoodleService();
const getLmsInstitutions = new GetLmsInstitutionPlatformsService();

export default defineComponent({
  name: 'CustomizeSynchronization',
  components: {
    AppAutocomplete,
    AppFormModal,
    AppFormField,
    AppLoading,
    AppButton,
  },

  props: {
    subjectAssignmentId: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Personalizar sincronización';

    const synchronizationTypes: Ref<any[]> = ref([
      { id: 1, name: 'Crear un nuevo curso en el LMS' },
      { id: 2, name: 'Usar un curso ya creado en el LMS' },
    ]);
    const lmsCategories: Ref<CategoryMoodleDto[]> = ref([]);
    const lmsInstPlatform: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      typeSynchronization: 1,
      categoryId: null,
      forceCreationUsers: false,
      forceCreationCourse: false,
      activities: false,
      syncLmsNew: false,
      nameUseCourseCreated: null,
      lmsInstitutionPlatformId: props.data.lmsInstitutionPlatformId,
    });
    const v$ = useVuelidate(
      {
        form: {
          typeSynchronization: { required },
          categoryId: {},
          forceCreationUsers: {},
          lmsInstitutionPlatformId: {},
          forceCreationCourse: {},
          activities: {},
          syncLmsNew: {},

          nameUseCourseCreated: {
            requiredIf: requiredIf(() => {
              return form.typeSynchronization == 2;
            }),
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        lmsInstPlatform.value = await getLmsInstitutions.run();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(
      () => form.typeSynchronization,
      async (value) => {
        if (value == 1) {
          form.categoryId = null;
          form.nameUseCourseCreated = null;
        }
      }
    );

    const getCategoriesByPlatformId = async (platformId: any) => {
      const params = {
        subjectAssignmentId: props.subjectAssignmentId,
        lmsInstitutionPlatformId: platformId,
      };
      lmsCategories.value = await getCategoriesMoodleService.run(params);
      console.log('LMS', lmsCategories.value);
    };

    watch(
      () => form.lmsInstitutionPlatformId,
      async () => {
        await getCategoriesByPlatformId(form.lmsInstitutionPlatformId);
      }
    );
    watch(
      () => form.activities,
      (newValue) => {
        if (newValue) {
          form.syncLmsNew = false;
        }
      }
    );

    watch(
      () => form.syncLmsNew,
      (newValue) => {
        if (newValue) {
          form.activities = false;
        }
      }
    );
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend: ISyncClassroomAndLmsService = {
          forceCreationCourse: form.forceCreationCourse ? 1 : 0,
          forceCreationUsers: form.forceCreationUsers ? 1 : 0,
          activities: form.activities ? 1 : 0,
          syncLmsNew: form.syncLmsNew ? 1 : 0,
          categoryId: form.categoryId,
          nameUseCourseCreated: form.nameUseCourseCreated,
          lmsInstitutionPlatformId: form.lmsInstitutionPlatformId,
        };

        const response = await syncClassroomAndLmsService.run(props.subjectAssignmentId, dataSend);
        // const response = {
        //   message: "Información almacenada correctamente",
        //   data: {
        //     courseSynchronization: [
        //       {
        //         process: "Asignar Categoria",
        //         result: "Curso registrado en la categoria Categoría 1",
        //         responseModdle: null,
        //         status: "OK"
        //       }
        //     ],
        //     usersSynchronization: [
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: tmuxworthy0@adobe.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: aazemah@networksolutions.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: wcaddani@ucsd.edu"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: bklezmskij@usgs.gov"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: breutherk@wiley.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: cgarriganl@google.ca"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: sstothartm@addtoany.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: lesmondn@yandex.ru"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: bbruckmano@home.pl"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: dlassellep@360.cn"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: fkristofferssonq@dyndns.org"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: lhablotr@businessinsider.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: dtidbolds@chronoengine.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: ebuckerfieldt@yellowbook.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: esollasu@sfgate.com"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Crear usuario",
        //         result: "No fue posible crear el usuario en el LMS",
        //         responseModdle: {
        //           exception: "invalid_parameter_exception",
        //           errorcode: "invalidparameter",
        //           message: "Detectado valor de parámetro no válido",
        //           debuginfo: "Username already exists: adarbyshirev@php.net"
        //         },
        //         status: "ERROR"
        //       },
        //       {
        //         process: "Registro de usuarios en el curso",
        //         result: "Cantidad de usuarios nuevos registrados en el curso 0",
        //         responseModdle: null,
        //         status: "OK"
        //       },
        //       {
        //         process: "Usuarios eliminados del curso",
        //         result: "",
        //         responseModdle: null,
        //         status: "OK"
        //       }
        //     ],
        //   },
        // };

        emit('close', response.data);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      v$,
      emit,

      synchronizationTypes,
      lmsCategories,
      lmsInstPlatform,
      getCategoriesByPlatformId,
    };
  },
});
</script>

<style scoped></style>
