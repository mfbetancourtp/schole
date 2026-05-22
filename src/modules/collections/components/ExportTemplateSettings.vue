<template>
   <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Columna</th>
            <th>Mostrar</th>
            <th>Encabezado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(colmn, index) in colmns" :key="index">
            <td>{{ colmn.defaultHeader }}</td>
            <td>
              <input class="form-check-input" type="checkbox" v-model="colmn.showColumn" />
            </td>
            <td>
              <input
                class="form-control"
                type="text"
                v-model="colmn.renameHeader"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-slot:actions>
      <AppButton :label="'core.save'" :nativeType="'submit'" @click="save"></AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { TemplatesEnabledDto, ColumnDto } from '../dtos/templatesEnabled.dto';

import { ConfigureColumnsOfSelectedTemplateService } from '../services/configureColumnsOfSelectedTemplate.service';

const configureColumnsOfSelectedTemplateService = new ConfigureColumnsOfSelectedTemplateService();

export default defineComponent({
  name: 'ExportTemplateSettings',
  components: { AppFormModal, AppButton, AppLoading },

  props: {
    data: {
      type: Object as PropType<TemplatesEnabledDto>,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const colmns: Ref<ColumnDto[]> = ref(props.data.columns);
    const title = 'Configurar plantilla de exportación';

    const loading = ref(true);

    onMounted(async () => {
      colmns.value.forEach((column) => {
        column.showColumn = column.showColumn ? true : false;
      });

      loading.value = false;
    });

    const save = async () => {
      try {
        await configureColumnsOfSelectedTemplateService.run({
          columns: colmns.value,
        });
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      emit,
      colmns,
    };
  },
});
</script>

<style scoped></style>
