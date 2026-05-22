<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" :routes="routes">
      <template v-slot:content>
        <AppLoading v-if="loadingFilters"></AppLoading>
        <div v-else>
          <div class="card-body">
            <label><b>Configuración General</b></label>
            <div class="form-row">
              <AppFormField :form-control="v$.form.educationLevelId">
                <label for="name">Nivel Académico</label>
                <v-select
                  class="tw-flex-1"
                  inputId="levelList"
                  v-model="v$.form.educationLevelId.$model"
                  :options="levelsList"
                  label="name"
                  :reduce="(level: EducationLevelsDto) => level.id"
                ></v-select>
              </AppFormField>

              <AppFormField :form-control="v$.form.educationSublevelId">
                <label for="name">.</label>
                <v-select
                  class="tw-flex-1"
                  inputId="subLevelsList"
                  v-model="v$.form.educationSublevelId.$model"
                  :options="subLevelsList"
                  label="name"
                  :reduce="(sub: EducationSublevelsDto) => sub.id"
                ></v-select>
              </AppFormField>

              <div>
                <div class="NewPrograms__section_text">
                  <p>
                    Matricular todas las asignaturas del grado al promover al estudiate
                    <b>{{ v$.form.autoEnrollDegreeSubjects.$model ? 'Habilitado' : 'Deshabilitado' }}</b>
                  </p>
                  <p>
                    Matricular todas las asignaturas del programa al inscribir el estudiante
                    <b>{{ v$.form.autoEnrollLevelSubjects.$model ? 'Habilitado' : 'Deshabilitado' }}</b>
                  </p>
                  <p>
                    Usar creditos
                    <b>{{ v$.form.useCredits.$model ? 'Habilitado' : 'Deshabilitado' }}</b>
                  </p>
                  <p>
                    Uso de asignaturas transversales
                    <b>{{ v$.form.useTransversalSubjects.$model ? 'Habilitado' : 'Deshabilitado' }}</b>
                  </p>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" v-model="showInfo" />
                    <label><i>Cambiar configuración</i></label>
                  </div>
                </div>
              </div>
            </div>

            <!--Mostrar/Ocultar Cambiar configuración-->
            <div>
              <br />
              <div class="border" v-if="showInfo">
                <div class="form-row">
                  <AppFormField :form-control="v$.form.autoEnrollDegreeSubjects">
                    <label>Matricular todas las asignaturas del grado al promover el estudiante</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.autoEnrollDegreeSubjects.$model" />
                    </div>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.useTransversalSubjects">
                    <label>Usar asignaturas transversales</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.useTransversalSubjects.$model" />
                    </div>
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.autoEnrollLevelSubjects">
                    <label>Matricular todas las asignaturas del programa al inscribir al estudiante</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.autoEnrollLevelSubjects.$model" />
                    </div>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.useCredits">
                    <label>Usar creditos</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" v-model="v$.form.useCredits.$model" />
                    </div>
                  </AppFormField>
                </div>
              </div>
            </div>

            <!--Formulario Información Personal-->
            <div>
              <br />
              <label><b>Información del Programa</b></label>
              <div class="form-row">
                <AppFormField :form-control="v$.form.code">
                  <label for="title">Código Institucional</label>
                  <input type="text" class="form-control" v-model="v$.form.code.$model" id="title" />
                </AppFormField>
                <AppFormField :form-control="v$.form.name">
                  <label for="title">Nombre</label>
                  <input type="text" class="form-control" v-model="v$.form.name.$model" id="title" />
                </AppFormField>
                <AppFormField :form-control="v$.form.modality">
                  <label for="name">Modalidad</label>
                  <v-select
                    class="tw-flex-1"
                    inputId="modality"
                    v-model="v$.form.modality.$model"
                    :options="modalityList"
                    label="label"
                    :reduce="(modalityList: ModalityDto) => modalityList.key"
                  ></v-select>
                </AppFormField>
              </div>
              <div class="form-row">
                <AppFormField :form-control="v$.form.codeSnies">
                  <label for="title">Código gubernamental</label>
                  <input type="text" class="form-control" v-model="v$.form.codeSnies.$model" id="title" />
                </AppFormField>
                <AppFormField :form-control="v$.form.titleGiven">
                  <label for="title">Título Otorgado</label>
                  <input type="text" class="form-control" v-model="v$.form.titleGiven.$model" id="title" />
                </AppFormField>
              </div>
              <div>
                <AppFormField :form-control="v$.form.faculties" v-if="v$.form.educationLevelId.$model === 2 || v$.form.educationLevelId.$model === 3">
                  <label for="title">Facultades</label>
                  <v-select
                    class="tw-flex-1"
                    inputId="faculties"
                    v-model="v$.form.faculties.$model"
                    :options="facultiesList"
                    label="name"
                    :reduce="(facultiesList: FacultiesDto) => facultiesList.id"
                  ></v-select>
                </AppFormField>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:actions>
        <AppButtonBack :to="{ name: 'academicPrograms.programView' }"></AppButtonBack>
        <AppButton :nativeType="'submit'" :label="'core.save'"></AppButton>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';

import { ModalityDto } from '../../dtos/programs/modality.dto';
import { FacultiesDto } from '../../dtos/programs/faculties.dto';
import { EducationSublevelsDto } from '../../dtos/programs/educationSublevels.dto';
import { EducationLevelsDto } from '../../dtos/programs/educationLevels.dto';

import { CreateOrUpdateProgramsService } from '../../services/programs/createOrUpdatePrograms.service';
import { GetFiltersContentForm } from '../../services/programs/getFiltersContentForm.service';

const getFiltersContentForm = new GetFiltersContentForm();
const createOrUpdateProgramsService = new CreateOrUpdateProgramsService();

export default defineComponent({
  name: 'ProgramsForm',
  components: {
    AppLoading,
    AppButton,
    AppFormField,
    AppButtonBack,
    AppBaseList,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    data: {
      type: Object as PropType<any>,
    },
  },
  setup(props) {
    useMeta({ title: props.title });
    const data: any | null = props.data ?? null;
    const showInfo = ref(false);
    const router = useRouter();

    const subLevelsList = ref<EducationSublevelsDto[]>([]);
    const levelsList = ref<EducationLevelsDto[]>([]);
    const modalityList = ref<ModalityDto[]>([]);
    const facultiesList = ref<FacultiesDto[]>([]);
    const dataPrograms = ref<any>();

    const loadingFilters = ref(true);
    const form = reactive({
      id: data?.id ?? '',
      name: data?.name ?? '',
      code: data?.code ?? '',
      codeSnies: data?.codeSnies ?? '',

      educationLevelId: data?.educationLevelId ?? '',
      educationSublevelId: data?.educationSublevelId ?? '',

      useCredits: data?.defaultUseCredits == 1 ? true : false,
      useTransversalSubjects: data?.defaultUseTransversalSubjects == 1 ? true : false,
      autoEnrollLevelSubjects: data?.defaultAutoEnrollLevelSubjects == 1 ? true : false,
      autoEnrollDegreeSubjects: data?.defaultAutoEnrollDegreeSubjects == 1 ? true : false,

      titleGiven: data?.titleGiven ?? '',

      modality: data?.modality ?? '',
      faculties: data?.facultyId ?? '',
    });
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          code: {},
          codeSnies: {},
          name: {},

          educationLevelId: {},
          educationSublevelId: {},

          useCredits: {},
          useTransversalSubjects: {},
          autoEnrollLevelSubjects: {},
          autoEnrollDegreeSubjects: {},
          titleGiven: {},
          modality: {},
          faculties: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        dataPrograms.value = await getFiltersContentForm.run();
        levelsList.value = dataPrograms.value.educationLevels;
        facultiesList.value = dataPrograms.value.faculties;
        modalityList.value = dataPrograms.value.modalities;
        console.log('Sublevels:', subLevelsList.value);
      } catch (e) {
        console.log('This init component', e);
      }
      loadingFilters.value = false;
    });

    watch(
      () => form.educationLevelId,
      (valor) => {
        if (valor) {
          let data = levelsList.value.filter((item: EducationLevelsDto) => item.id === valor)[0];
          subLevelsList.value = [];
          subLevelsList.value = data.educationSublevels;

          form.autoEnrollDegreeSubjects = data.defaultAutoEnrollDegreeSubjects === 1 ? true : false;
          form.autoEnrollLevelSubjects = data.defaultAutoEnrollLevelSubjects === 1 ? true : false;
          form.useCredits = data.defaultUseCredits === 1 ? true : false;
          form.useTransversalSubjects = data.defaultUseTransversalSubjects === 1 ? true : false;

          console.log(valor);
          console.log('SubLevels', subLevelsList.value);
          console.log('Levels', levelsList);
        } else {
          subLevelsList.value = [];
        }
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      try {
        const dataSend = {
          code: form.code,
          codeSnies: form.codeSnies,
          name: form.name,

          educationLevelId: form.educationLevelId,
          educationSublevelId: form.educationSublevelId,

          useCredits: form.useCredits,
          useTransversalSubjects: form.useTransversalSubjects,
          autoEnrollLevelSubjects: form.autoEnrollLevelSubjects,
          autoEnrollDegreeSubjects: form.autoEnrollDegreeSubjects,
          titleGiven: form.titleGiven,
          modality: form.modality,
          facultyId: form.faculties,
        };
        console.log('data send', dataSend);

        let dataResponse = await createOrUpdateProgramsService.run(dataSend, data?.id);
        await router.push({
          name: 'academicPrograms.degreesCreate',
          params: {
            levelId: dataResponse.data.idLevel,
          },
        });
      } catch (e) {
        console.log('This error send data', e);
      }
    };

    return {
      loadingFilters,
      subLevelsList,
      levelsList,
      facultiesList,
      modalityList,
      v$,
      save,

      showInfo,
    };
  },
});
</script>

<style scoped>
.NewPrograms__section_text {
  background-color: #b6d7a8;
  color: black;
  border-radius: 10px;
}
</style>
