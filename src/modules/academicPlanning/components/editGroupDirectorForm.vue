<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.directorPeopleId">
          <label>Director de Grupo</label>
          <v-select
            placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
            v-model="v$.form.directorPeopleId.$model"
            :reduce="(director) => director.people.id"
            :options="people.value"
            @search="searchPeople"
            label="name"
          ></v-select>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { debounce } from 'ts-debounce';
import { defineComponent, reactive } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetDirectorsSelectService } from '../services/getDirectorsSelect.service';
import { CreateOrUpdateAcademicPeriodGroupsService } from '../services/createOrUpdateAcademicPeriodGroups.service';

const createOrUpdateAcademicPeriodGroupsService = new CreateOrUpdateAcademicPeriodGroupsService();
const getDirectorsSelectService = new GetDirectorsSelectService();

export default defineComponent({
  name: 'EditGroupDirectorForm',
  components: { AppFormModal, AppButton, AppFormField },

  props: ['academicPeriodGroup'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'Editar Oferta Académica';

    const form = reactive({
      directorPeopleId: null,
      id: props.academicPeriodGroup.id,
    });
    const v$ = useVuelidate(
      {
        form: {
          directorPeopleId: { required },
          id: { required },
        },
      },
      { form }
    );

    const people: { value: any[] } = reactive({
      value: [],
    });

    const searchPeople = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          people.value = [];
        }

        if (search.length >= 2) {
          people.value = [];
          const response = await getDirectorsSelectService.run({
            search: search,
          });

          response.data.forEach((person: any) => {
            people.value.push({
              ...person,
              name: person.people.names + ' ' + person.people.lastnames,
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
        await createOrUpdateAcademicPeriodGroupsService.run(form, props.academicPeriodGroup?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      people,
      title,
      save,
      v$,

      searchPeople,
    };
  },
});
</script>

<style scoped></style>
