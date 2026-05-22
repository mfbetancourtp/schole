<template>
  <AppFormModal title="Licencias usadas">
    <template v-slot:content>
      <table class="table table-bordered table-hover">
        <thead>
        <tr>
          <td>Nombre</td>
          <td>Fecha</td>
          <td>Activo</td>
        </tr>
        </thead>

        <tbody>
        <tr v-if="!licenses.value.length | loading">
          <td colspan="3">
            <span v-if="!licenses.value.length && !loading">
              No se han encontrado licencias
            </span>
            <span v-if="loading">
              <AppLoading></AppLoading>
            </span>
          </td>
        </tr>
        <tr v-else v-for="license in licenses.value" >
          <td>{{ license.ownerPeople }}</td>
          <td>{{ license.registerDate }}</td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" v-model="license.active">
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import {GetUsedLicensesService} from '../services/getUsedLicenses.service';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import {LicensesDto} from '../dtos/licenses.dto';
import AppLoading from '../../../shared/components/AppLoading.vue';

const getUsedLicensesService = new GetUsedLicensesService();

export default defineComponent({
  name: 'usedLicenses',
  components: {AppLoading, AppDatatable, AppFormModal},
  props: ['productId'],
  setup(props) {
    const licenses: { value: LicensesDto[] } = reactive({
      value: [],
    });
    const loading = ref(true);

    onMounted(async () => {

      licenses.value = await getUsedLicensesService.run(props.productId);
      licenses.value.forEach((license) => {
        license.active = Boolean(license.active);
      });

      loading.value = false;
    });

    return {
      licenses,
      loading,
    };
  },
});
</script>

<style scoped>

</style>