<template>
  <AppFormField :form-control="v$.form.organizationalJobs">
    <div class="d-flex justify-content-between align-items-center">
      <h4 class="m-0">Cargos</h4>
      <AppButton label="Agregar" @click="addOrganizationalJob"></AppButton>
    </div>
  </AppFormField>

  <table class="table">
    <thead>
      <tr>
        <th class="col-2">Código</th>
        <th>Nombre</th>
        <th class="col-2 text-center">Nivel</th>
        <th class="col-1 text-center">Opciones</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="item, index in v$.form.organizationalJobs.$model" :key="index">
        <td>
          <input
            :class="{ 'is-invalid': v$.form.organizationalJobs.$each.$response.$errors[index].code.length  }"
            type="text" class="form-control" v-model="item.code"
          >
        </td>

        <td>
          <input 
            :class="{ 'is-invalid': v$.form.organizationalJobs.$each.$response.$errors[index].name.length }"
            type="text" class="form-control" v-model="item.name"
          >
        </td>

        <td>
          <input 
            :class="{ 'is-invalid': v$.form.organizationalJobs.$each.$response.$errors[index].hierarchicalLevel.length }"
            type="number" class="form-control" v-model="item.hierarchicalLevel"
          >
        </td>

        <td class="text-center">
          <AppButtonDelete @click="deleteItem(index)"></AppButtonDelete>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';

export default defineComponent({
  name: 'OrganizationalJobsTableForm',
  components: {
    AppButtonDelete,
    AppFormField,
    AppButton,
  },

  props: {
    v$: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const addOrganizationalJob = () => {
      props.v$.form.organizationalJobs.$model.push({
        code: null,
        name: null,
        hierarchicalLevel: null,
      });
    };

    const deleteItem = (index: number) => {
      props.v$.form.organizationalJobs.$model.splice(index, 1);
    };

    return {
      addOrganizationalJob,
      deleteItem,
    };
  },
});
</script>

<style scoped></style>
