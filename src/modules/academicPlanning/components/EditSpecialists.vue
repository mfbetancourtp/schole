<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <div v-else>
          <AppFormField :form-control="v$.form.specialistUserId" label="core.generalTerms.academic.specialist.singular">
            <v-select
              input-id="specialistId"
              class="disabled"
              placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
              v-model="v$.form.specialistUserId.$model"
              :reduce="(teacher: any) => teacher.id"
              :options="teachers.value"
              @search="searchTeachers"
              label="name"
            ></v-select>
          </AppFormField>

          <AppFormField :form-control="v$.form.areaId" label="core.generalTerms.academic.area.singular">
            <v-select input-id="areaId" v-model="v$.form.areaId.$model" :reduce="(area: any) => area.id" :options="areasProps" label="name"></v-select>
          </AppFormField>

          <AppFormField :form-control="v$.form.levelId" label="core.generalTerms.academic.level.singular">
            <v-select input-id="levelId" v-model="v$.form.levelId.$model" :reduce="(level: any) => level.id" :options="levelsProps" label="name" @option:selected="getDegreesForLevel()"></v-select>
          </AppFormField>

          <AppFormField :form-control="v$.form.degreeId" label="core.generalTerms.academic.degree.plural">
            <v-select input-id="degreeId" v-model="v$.form.degreeId.$model" :reduce="(degree: any) => degree.id" :options="degreesProps.value" label="name"></v-select>
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
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { EditSpecialistService } from '../services/editSpecialist.service';
import { GetTeachersSelectService } from '../services/getTeachersSelect.service';

const getTeachersSelectService = new GetTeachersSelectService();
const editSpecialistService = new EditSpecialistService();

export default defineComponent({
  name: 'CreateSpecialistsForm',
  components: { AppFormModal, AppButton, AppFormField, AppLoading },

  props: ['academicPeriodId', 'data', 'areas', 'levels', 'degrees'],
  emits: ['close'],

  setup(props, { emit }) {
    const specialistTranslation = 'core.generalTerms.academic.specialist.plural';
    let title = `core.new ${specialistTranslation}`;

    const levelsProps: any[] = props.levels ?? [];
    const academicPeriodIdProps = props.academicPeriodId ?? '';
    const data = props.data ?? [];
    const areasProps: [] = props.areas ?? '';

    const form = reactive({
      academicPeriodId: academicPeriodIdProps,
      degreeId: data.degree.id,
      levelId: data.level.id,
      specialistUserId: null,
      areaId: data.area.id,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          specialistUserId: { required },
          degreeId: { required },
          levelId: { required },
          areaId: { required },
        },
      },
      { form }
    );

    const loading = ref(true);

    const teachers: { value: any[] } = reactive({
      value: [],
    });
    const degreesProps: { value: any[] } =
      reactive({
        value: [],
      }) ?? '';

    onMounted(async () => {
      if (data.specialistUser) {
        await selectTeacher();
      }

      getDegreesForLevel(true);

      loading.value = false;
    });

    const getDegreesForLevel = async (onMounted: boolean = false) => {
      degreesProps.value = props.degrees;

      if (!onMounted) {
        form.degreeId = null;
      }

      let auxDegrees: any = [];

      degreesProps.value.forEach((degree: any) => {
        if (form.levelId == degree.levelId) {
          auxDegrees.push(degree);
        }
      });

      degreesProps.value = auxDegrees;
    };

    const selectTeacher = async () => {
      let name = data.specialistUser.name;
      const response = await getTeachersSelectService.run({ search: name });

      response.data.forEach((teacher: any) => {
        teachers.value.push({
          ...teacher,
          name: teacher.people.names + ' ' + teacher.people.lastnames,
        });
      });

      form.specialistUserId = data.specialistUser.id;
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
        const dataSend = {
          academicPeriodId: form.academicPeriodId,
          specialistUserId: form.specialistUserId,
          degreeId: form.degreeId,
          areaId: form.areaId,
        };

        await editSpecialistService.run(dataSend, data.id);
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
      emit,

      teachers,
      degreesProps,
      levelsProps,
      areasProps,

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
