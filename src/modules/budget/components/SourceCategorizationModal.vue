<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title + (v$.form.name.$model === undefined ? '' : v$.form.name.$model)">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>
        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.name">
              <label for="name">Nombre</label>
              <input type="text" class="form-control" v-model="v$.form.name.$model" />
            </AppFormField>
          </div>
          <div class="form-row">
            <AppFormField :form-control="v$.form.description">
              <label for="naspareKgme">Descripción</label>
              <input type="text" class="form-control" v-model="v$.form.description.$model" />
            </AppFormField>
          </div>
          <div class="form-row">
            <AppFormField :form-control="v$.form.subCategoryId" label="Subcategoria">
              <AppAutocomplete v-model="v$.form.subCategoryId.$model" label="value" :options="subcategoryList" :clearable="false" :reduce="(d: any) => d.label"></AppAutocomplete>
            </AppFormField>
          </div>
        </template>
      </template>
      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, toRefs } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdateSourceCategorizationService } from '../services/createOrUpdateSourceCategorization.service';
import { GetAllSubcategorizationService } from '../services/getAllSubcategorization.service';

const createOrUpdateSourceCategorizationService = new CreateOrUpdateSourceCategorizationService();
const getAllSubcategorizationService = new GetAllSubcategorizationService();
export default defineComponent({
  name: 'SourceCategorizationModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    AppAutocomplete,
    AppLoading,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { data } = toRefs(props);
    let title = 'Agregar categorización de fuentes ';
    if (props.data?.id) {
      title = 'Editar categorización de fuentes ';
    }
    const loading = ref(true);
    const subcategoryList = ref();
    const form: any = reactive({
      name: data.value?.name,
      description: data.value?.description,
      subCategoryId: data.value?.subCategoryId,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
          subCategoryId: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      subcategoryList.value = await getAllSubcategorizationService.run();
      loading.value = false;
    });
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
      try {
        await createOrUpdateSourceCategorizationService.run(form, data.value?.id);
        loading.value = false;
        emit('close');
      } catch (error) {
        console.log('This is error', error);
        loading.value = false;
      }
    };
    return {
      title,
      loading,
      v$,
      save,
      subcategoryList,
    };
  },
});
</script>
