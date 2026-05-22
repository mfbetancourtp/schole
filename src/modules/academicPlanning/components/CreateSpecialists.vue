<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <div v-else>
          <AppFormField :form-control="v$.form.specialistUserId" label="core.generalTerms.academic.specialist.plural">
            <v-select
              v-bind:class="{ disabled: disabledSelect }"
              placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
              v-model="v$.form.specialistUserId.$model"
              :reduce="(teacher: any) => teacher.id"
              :options="teachers.value"
              @search="searchTeachers"
              label="name"
            ></v-select>
          </AppFormField>

          <AppFormField :form-control="v$.form.areaId">
            <label>Areas</label>
            <v-select v-model="v$.form.areaId.$model" :reduce="(area: any) => area.id" :options="areasProps" label="name"></v-select>
          </AppFormField>

          <AppFormField :form-control="v$.form.levelId">
            <label>Nivel</label>
            <v-select v-model="v$.form.levelId.$model" :reduce="(level: any) => level.id" :options="levelsProps" label="name" @option:selected="getDegreesForLevel()"></v-select>
          </AppFormField>

          <AppFormField :form-control="v$.form.degreeIds">
            <label>Grado</label>
            <v-select v-model="v$.form.degreeIds.$model" :reduce="(degree: any) => degree.id" :options="degreesProps.value" label="name" multiple></v-select>
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { debounce } from 'ts-debounce';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateSpecialistService } from '../services/createSpecialist.service';
import { GetTeachersSelectService } from '../services/getTeachersSelect.service';

const getTeachersSelectService = new GetTeachersSelectService();
const createSpecialistService = new CreateSpecialistService();

export default defineComponent({
  name: 'CreateSpecialistsForm',
  components: { AppFormModal, AppButton, AppFormField, AppLoading },

  props: ['academicPeriodId', 'specialistUser', 'areas', 'levels', 'degrees'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'core.newMale core.generalTerms.academic.specialist.plural';

    const levelsProps: any[] = [{ id: '_', name: 'Todos' }, ...props.levels];
    const academicPeriodIdProps = props.academicPeriodId ?? '';
    const specialistUserProps = props.specialistUser ?? '';
    const areasProps: [] = props.areas ?? [];

    const disabledSelect = specialistUserProps ? true : false;

    const form = reactive({
      academicPeriodId: academicPeriodIdProps,
      specialistUserId: null,
      degreeIds: [] as any,
      areaId: null,
      levelId: '_',
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          specialistUserId: { required },
          degreeIds: { required },
          levelId: { required },
          areaId: { required },
        },
      },
      { form }
    );

    const loading = ref(true);

    const teachers: { value: any[] } =
      reactive({
        value: [],
      }) ?? [];
    const degreesProps: { value: any[] } =
      reactive({
        value: [],
      }) ?? [];

    onMounted(async () => {
      if (specialistUserProps) {
        await selectTeacher();
      }

      getDegreesForLevel();

      loading.value = false;
    });

    const getDegreesForLevel = async () => {
      degreesProps.value = props.degrees;
      form.degreeIds = [];

      if (form.levelId == '_') {
        degreesProps.value.forEach((degree: any) => {
          form.degreeIds.push(degree.id);
        });
      } else {
        let auxDegrees: any = [];

        degreesProps.value.forEach((degree: any) => {
          if (form.levelId == degree.levelId) {
            form.degreeIds.push(degree.id);
            auxDegrees.push(degree);
          }
        });

        degreesProps.value = auxDegrees;
      }
    };

    const selectTeacher = async () => {
      let name = specialistUserProps.name;
      const response = await getTeachersSelectService.run({ search: name });

      response.data.forEach((teacher: any) => {
        teachers.value.push({
          ...teacher,
          name: teacher.people.names + ' ' + teacher.people.lastnames,
        });
      });

      form.specialistUserId = specialistUserProps.id;
    };

    const searchTeachers = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          teachers.value = [];
        }

        if (search.length >= 2) {
          teachers.value = [];
          const response = await getTeachersSelectService.run({
            search: search,
          });

          response.data.forEach((teacher: any) => {
            teachers.value.push({
              ...teacher,
              name: teacher.people.names + ' ' + teacher.people.lastnames,
            });
          });
        }

        loading(false);
      }
    }, 800);

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const data = {
          academicPeriodId: form.academicPeriodId,
          specialistUserId: form.specialistUserId,
          degreeIds: form.degreeIds,
          areaId: form.areaId,
        };

        await createSpecialistService.run(data);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      v$,

      disabledSelect,
      teachers,
      degreesProps,
      levelsProps,
      areasProps,
      emit,
      getDegreesForLevel,
      searchTeachers,
    };
  },
});
</script>

<style scoped>
.disabled {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6;
  border-color: #d1dbe5;
}
</style>
