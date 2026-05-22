<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template #content>
        <AppFormField :formControl="v$.form.code" label="core.code">
          <input id="code" v-model="v$.form.code.$model" type="text" class="form-control" />
        </AppFormField>

        <AppFormField :formControl="v$.form.name" label="core.name">
          <input id="name" v-model="v$.form.name.$model" type="text" class="form-control" />
        </AppFormField>

        <div class="row mt-3">
          <div class="col-12">
            <AppFormField :formControl="v$.form.description" label="core.description">
              <textarea id="description" v-model="v$.form.description.$model" class="form-control"></textarea>
            </AppFormField>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton :label="'core.save'" :nativeType="'submit'" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import { CreateOrUpdatePeriodTemplateService } from '../services/createOrUpdateSmesterTemplate.service';

const createOrUpdatePeriodTemplateService = new CreateOrUpdatePeriodTemplateService();

export default defineComponent({
  name: 'ManageSemesterTemplateForm',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
  },
  props: {
    semesterTemplate: {
      type: Object,
      default: null,
    },
    numberSemesters: {
      type: Number,
      default: 0,
    },
    operationalScheme: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const form = reactive({
      id: null as number | null,
      name: '',
      code: '',
      description: '',
      operationalSchemeId: null as number | null,
    });

    const title = computed(() => (form.id ? 'Editar semestre' : 'Nuevo semestre'));

    const assignFormData = () => {
      form.id = props.semesterTemplate?.id ?? null;
      form.name = props.semesterTemplate?.name ?? '';
      form.code = props.semesterTemplate?.code ?? '';
      form.description = props.semesterTemplate?.description ?? '';
      form.operationalSchemeId = props.semesterTemplate?.operationalSchemeId ?? props.operationalScheme?.id ?? null;
    };

    watch(
      () => [props.semesterTemplate, props.operationalScheme],
      () => {
        assignFormData();
      },
      { deep: true, immediate: true }
    );

    const v$ = useVuelidate(
      {
        form: {
          id: {},
          name: { required },
          code: { required },
          description: {},
          operationalSchemeId: { required },
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const payload = {
          name: form.name.trim(),
          code: form.code.trim(),
          description: form.description,
          operationalSchemeId: form.operationalSchemeId ?? props.operationalScheme?.id,
        };

        await createOrUpdatePeriodTemplateService.run(payload, form.id ?? undefined);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      v$,
      save,
    };
  },
});
</script>
