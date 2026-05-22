<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility" :size="'lg'">
    <template #head>
      <span class="title-form px-3">
        {{ medicalRecord ? t('core.edit') : t('core.new') }}
        {{ t('access.medicalRecord.singular') }}
      </span>
    </template>

    <template #body>
      <div class="card-body">
        <AppLoading v-if="loading" class="d-flex align-items-center h-80" />

        <template v-else>
          <div class="row">
            <div class="col-12">
              <AppFormField :form-control="v$.form.annotations" label="access.medicalRecord.form.annotations">
                <AppVoiceInput v-model="v$.form.annotations.$model" textareaClass="form-control" :rows="2"></AppVoiceInput>
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField :form-control="v$.form.consultationDate" label="access.medicalRecord.form.consultationDate">
                <input v-model="v$.form.consultationDate.$model" class="form-control" type="datetime-local" />
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField :form-control="v$.form.wellnessAreaId" label="core.generalTerms.academic.wellnessAreas.singular">
                <AppAutocomplete v-model="v$.form.wellnessAreaId.$model" :options="wellnessAreasList" />
              </AppFormField>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="buttons-form d-flex gap-3 justify-content-between">
        <div>
          <AppButton label="core.save" @click="save()" />
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch, PropType } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

import { MedicalRecordDto } from '../../access/dtos/medicalRecord.dto';
import { ParamsFormMedicalRecordDto } from '../dtos/medicalRecord.dto';

import { CreateOrUpdateMedicalRecordService } from '../../access/services/createOrUpdateMedicalRecord.service';

const createOrUpdateMedicalRecordService = new CreateOrUpdateMedicalRecordService();

export default defineComponent({
  name: 'ObseByUserMediRecoFormDrawer',
  components: {
    AppAutocomplete,
    AppFormField,
    AppDrawer,
    AppButton,
    AppVoiceInput,
  },

  props: {
    medicalRecord: {
      type: Object as PropType<MedicalRecordDto | null>,
      default: null,
    },
    wellnessAreasList: {
      type: Array,
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },

    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:isVisible', 'reload-data'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const loading = ref(true);

    const form = reactive<ParamsFormMedicalRecordDto>({
      userId: props.userId,

      annotations: props.medicalRecord?.annotations ?? '',
      consultationDate: props.medicalRecord?.consultationDate ?? null,
      wellnessAreaId: props.medicalRecord?.wellnessAreaId ?? null,
    });
    const v$ = useVuelidate(
      {
        form: {
          userId: { required },

          annotations: { required },
          consultationDate: { required },
          wellnessAreaId: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      console.log('props', props);
    });
    watch(
      () => props.isVisible,
      async (newVal) => {
        if (newVal) {
          loading.value = true;

          await resetForm();

          if (props.medicalRecord) await loadForm(props.medicalRecord);

          loading.value = false;
        }
      }
    );

    const loadForm = async (medicalRecord: MedicalRecordDto) => {
      form.userId = props.userId;

      form.annotations = medicalRecord.annotations;
      form.consultationDate = medicalRecord.consultationDate;
      form.wellnessAreaId = medicalRecord.wellnessAreaId;
    };
    const resetForm = () => {
      form.userId = props.userId;

      form.annotations = '';
      form.consultationDate = null;
      form.wellnessAreaId = null;

      v$.value.$reset();
    };

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value);

      if (!value) {
        setTimeout(() => {
          resetForm();
        }, 300);
      }
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend: any = {
        userId: form.userId,

        annotations: form.annotations,
        consultationDate: form.consultationDate,
        wellnessAreaId: form.wellnessAreaId,
      };

      try {
        await createOrUpdateMedicalRecordService.run(dataSend, props.medicalRecord?.id);

        updateVisibility(false);

        emit('reload-data');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      v$,
      t,

      loading,

      updateVisibility,
      save,
    };
  },
});
</script>

<style scoped>
.title-form {
  margin-left: auto;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
.h-80 {
  height: 80% !important;
}
.overflow-clip {
  overflow-x: clip;
}
</style>
