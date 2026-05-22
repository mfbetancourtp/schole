<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.code">
          <label>{{ t('disciplinaryControl.offenseTemplates.form.code') }}</label>
          <AppInput type="text" v-model="v$.form.code.$model"></AppInput>
        </AppFormField>

        <AppFormField :form-control="v$.form.name">
          <label>{{ t('disciplinaryControl.offenseTemplates.form.name') }}</label>
          <AppVoiceInput v-model="v$.form.name.$model" :cols="40" :rows="2" textareaClass="form-control"  />
        </AppFormField>
        <div class="mb-3">
          <label>Naturaleza de la observación</label>

          <div class="d-flex">
            <label v-bind:class="{ 'text-primary': !v$.form.isPositive.$model }" class="form-check-label pe-2" for="isPositive">Negativa</label>

            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="isPositive" v-model="v$.form.isPositive.$model" />
            </div>

            <label v-bind:class="{ 'text-primary': v$.form.isPositive.$model }" class="form-check-label" for="isPositive">Positiva</label>
          </div>
        </div>
        <AppFormField :form-control="v$.form.searchName">
          <label>{{ t('Nombre de búsqueda') }}</label>
          <AppInput type="text" v-model="v$.form.searchName.$model"></AppInput>
        </AppFormField>
        <AppLoading v-if="loading" />
        <template v-else>
          <AppFormField :form-control="v$.form.levelOffenseId" label="core.generalTerms.academic.observationLevel.singular">
            <AppAutocomplete v-model="v$.form.levelOffenseId.$model" :options="levelOffenses" :clearable="false"></AppAutocomplete>
          </AppFormField>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton>{{ t('core.save') }}</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength } from '../../../shared/plugins/vuelidate.plugin';

import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdateOffenseTemplatesService } from '../services/createOrUpdateOffenseTemplates.service';
import { GetLevelOffensesService } from '../services/getLevelOffenses.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateOffenseTemplatesService = new CreateOrUpdateOffenseTemplatesService();
const getLevelOffensesService = new GetLevelOffensesService();

export default defineComponent({
  name: 'OffenseTemplatesForm',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppInput,
    AppAutocomplete,
    AppLoading,
    AppVoiceInput,
  },

  props: ['data'],
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const data = props.data ?? null;
    let title = `${!data ? t('core.newFemale') : t('core.edit')} ${t('disciplinaryControl.offenseTemplates.singular')}`;
    const levelOffenses = ref([]);
    const loading = ref(true);
    const form = reactive({
      code: data ? data.code : null,
      name: data ? data.name : null,
      isPositive: data ? (data.isPositive ? true : false) : false,
      searchName: data ? data.searchName : null,
      levelOffenseId: data ? data.levelOffenseId : null,
    });
    const v$ = useVuelidate(
      {
        form: {
          code: { required, maxLength: maxLength(10) },
          name: { required },
          isPositive: {},
          searchName: { required },
          levelOffenseId: { required },
        },
      },
      { form }
    );
    onMounted(async () => {
      try {
        levelOffenses.value = await getLevelOffensesService.run();
      } catch (e) {
        console.error(e);
      }
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend = {
          code: form.code,
          name: form.name,
          isPositive: form.isPositive ? 1 : 0,
          searchName: form.searchName,
          levelOffenseId: form.levelOffenseId,
        };
        await createOrUpdateOffenseTemplatesService.run(dataSend, data?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      t,
      levelOffenses,
      loading,
    };
  },
});
</script>

<style scoped></style>
