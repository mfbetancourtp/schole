<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template #content>
        <AppFormField :form-control="v$.form.formIds" :label="'core.menu.surveys'">
          <AppAutocomplete
            v-model="v$.form.formIds.$model"
            :label="'title'"
            :options="forms"
            :multiple="true"
          ></AppAutocomplete>
        </AppFormField>
      </template>

      <template #actions>
        <AppButton>
          {{ t('core.save') }}
        </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import {defineComponent, reactive} from 'vue';
import {useVuelidate} from '@vuelidate/core';
import {useI18n} from 'vue-i18n';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {SaveFormsByDocumentIdService} from '../services/saveFormsByDocumentId.service';
import {PredefinedFormDto} from '../dtos/predefinedForm.dto';

const saveFormsByDocumentIdService = new SaveFormsByDocumentIdService();

export default defineComponent({
  name: 'FormsDocument',
  components: {AppButton, AppFormField, AppFormModal, AppAutocomplete},
  props: ['document', 'forms'],
  emits: ['close'],

  setup(props, {emit}) {
    const title = 'Seleccione los formularios';
    const forms = props.forms;
    const {t} = useI18n();

    const defaultFormsIds: any = [];
    forms.forEach((f: PredefinedFormDto) => {
      if (f.checked) {
        defaultFormsIds.push(f.id);
      }
    });

    const form: any = reactive({
      formIds: defaultFormsIds,
    });

    const v$ = useVuelidate({
      form: {
        formIds: {},
      },
    }, {form});

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        await saveFormsByDocumentIdService.run({
          documentId: props.document.id,
          ...form,
        });
        emit('close');
      } catch (e) {

      }
    };

    return {
      title,
      v$,
      t,

      save,
    };
  },
});
</script>

<style scoped>

</style>