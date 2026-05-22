<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility" :size="'lg'">
    <template #head>
      <span class="title-form px-3"> {{ futureAbsence ? 'Editar' : 'Crear' }} inasistencia futura - {{ userName }}</span>
    </template>

    <template #body>
      <div class="card-body">
        <AppLoading v-if="loading" class="d-flex align-items-center h-80" />

        <template v-else>
          <h5 class="under__line">Rango fechas de inasistencia</h5>

          <div class="row">
            <div class="col-6">
              <AppFormField label="Inicio" :form-control="v$.form.startAbsence">
                <input v-model="v$.form.startAbsence.$model" type="date" class="form-control" />
              </AppFormField>
            </div>

            <div class="col-6">
              <AppFormField label="Fin" :form-control="v$.form.endAbsence">
                <input v-model="v$.form.endAbsence.$model" type="date" class="form-control" />
              </AppFormField>
            </div>
          </div>

          <div class="row mb-3">
            <h5 class="under__line">Sesiones a las cuales no asistirá:</h5>

            <div class="session-checkboxes" :class="{ 'is-invalid': v$.form.sesionNumbers.$error }">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="selectAll" :checked="isAllSelected" @change="toggleSelectAll" />
                <label class="form-check-label" for="selectAll"> Seleccionar todas </label>
              </div>

              <template v-for="item in relatedData.sesiones" :key="item.value">
                <div class="form-check">
                  <input v-model="v$.form.sesionNumbers.$model" type="checkbox" class="form-check-input" :value="item.value" :id="'' + item.value" />
                  <label class="form-check-label" :for="'' + item.value">
                    {{ item.name }}
                  </label>
                </div>
              </template>
            </div>

            <div v-if="v$.form.sesionNumbers.$error" class="invalid-feedback d-block">Debe seleccionar al menos una sesión</div>
          </div>

          <h5 class="under__line">Inasistencia</h5>

          <div class="row">
            <div class="col-6">
              <AppFormField :form-control="v$.form.isJustificationAbsence">
                <div class="d-flex gap-1">
                  <div class="form-check form-switch">
                    <input type="checkbox" class="form-check-input" id="isJustificationAbsence1" :checked="v$.form.isJustificationAbsence.$model === true" @change="() => setJustification()" />
                  </div>

                  <label class="form-check-label" for="isJustificationAbsence1">Justificada</label>
                </div>
              </AppFormField>
            </div>
            <div class="col-6">
              <AppFormField :form-control="v$.form.isJustificationAbsence">
                <div class="d-flex gap-1">
                  <div class="form-check form-switch">
                    <input type="checkbox" class="form-check-input" id="isJustificationAbsence0" :checked="v$.form.isJustificationAbsence.$model === false" @change="() => setJustification()" />
                  </div>

                  <label class="form-check-label" for="isJustificationAbsence0">Injustificada</label>
                </div>
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField label="Tipo de inasistencia" :form-control="v$.form.absenceTypeId">
                <AppAutocomplete v-model="v$.form.absenceTypeId.$model" :options="relatedData.absenceTypes" />
              </AppFormField>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <AppFormField label="Justificación" :form-control="v$.form.justificationAbsence">
            <AppVoiceInput v-model="v$.form.justificationAbsence.$model" textareaClass="form-control" />

              </AppFormField>
            </div>
          </div>

          <div class="row">
            <template v-if="form.attachmentAbsenceUrl || selectedFile">
              <div class="d-flex align-items-center justify-content-between gap-2 me-auto">
                <span class="text-truncate text-primary">
                  {{ selectedFile ? selectedFile.name : getFileName(form.attachmentAbsenceUrl) }}
                </span>

                <div>
                  <AppIcon v-tooltip="'Cancelar'" class="cursor text-primary me-2" icon="times" @click="removeFile" />

                  <template v-if="form.attachmentAbsenceUrl && !selectedFile">
                    <a v-tooltip="'Ver archivo'" :href="form.attachmentAbsenceUrl" target="_blank">
                      <AppIcon class="text-primary" icon="eye" />
                    </a>
                  </template>
                </div>
              </div>
            </template>

            <div class="d-flex justify-content-end mt-3">
              <input @change="onFileChange" style="display: none" type="file" id="fileInput" />
              <button @click="openFileSelector" type="button" class="btn btn-dark">
                <AppIcon icon="upload"></AppIcon>
                {{ t('core.upload') }}
              </button>
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
import { defineComponent, onMounted, reactive, ref, watch, PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { DTFutureAbsencesDto, ParamsFormFutureAbsencesDto, RelaDataFormFutureAbsencesDto } from '../dtos/futureAbsences.dto';

import { CreateOrUpdateFutureAbsencesService } from '../services/createOrUpdateFutureAbsences.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateFutureAbsencesService = new CreateOrUpdateFutureAbsencesService();

export default defineComponent({
  name: 'FutureAbsencesFormDrawer',
  components: {
    AppAutocomplete,
    AppFormField,
    AppLoading,
    AppDrawer,
    AppButton,
    AppIcon,
    AppVoiceInput,
  },

  props: {
    futureAbsence: {
      type: [Object, null] as PropType<DTFutureAbsencesDto | null>,
      required: false,
      default: null,
    },
    relatedData: {
      type: Object as PropType<RelaDataFormFutureAbsencesDto>,
      required: true,
    },
    matriculateId: {
      type: Number as PropType<number>,
      required: true,
    },
    userName: {
      type: String as PropType<string>,
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

    const form = reactive<any>({
      matriculateId: props.matriculateId,

      startAbsence: props.futureAbsence?.startAbsence,
      endAbsence: props.futureAbsence?.endAbsence,

      sesionNumbers: props.futureAbsence?.sesionNumbers || [],
      isJustificationAbsence: props.futureAbsence?.isJustificationAbsence || false,

      absenceTypeId: props.futureAbsence?.absenceTypeId,
      justificationAbsence: props.futureAbsence?.justificationAbsence,

      attachmentAbsenceUrl: props.futureAbsence?.attachmentAbsenceUrl || null,
    });
    const v$ = useVuelidate(
      {
        form: {
          matriculateId: { required },

          startAbsence: { required },
          endAbsence: { required },

          sesionNumbers: { required },
          isJustificationAbsence: {},

          absenceTypeId: { required },
          justificationAbsence: {},

          attachmentAbsenceUrl: {},
        },
      },
      { form }
    );

    const selectedFile = ref<File | null>(null);

    const loading = ref(true);

    const isAllSelected = computed(() => {
      return props.relatedData.sesiones.length > 0 && form.sesionNumbers.length === props.relatedData.sesiones.length;
    });

    onMounted(async () => {
      console.log('props', props);
    });

    watch(
      () => props.isVisible,
      async (newVal) => {
        if (newVal) {
          loading.value = true;

          await resetForm();
          console.log('selectedFile.value', selectedFile.value);

          if (props.futureAbsence) await loadForm(props.futureAbsence);

          loading.value = false;
        }
      }
    );

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        form.sesionNumbers = [];
      } else {
        form.sesionNumbers = props.relatedData.sesiones.map((item) => item.value);
      }
    };
    const setJustification = () => {
      form.isJustificationAbsence = !form.isJustificationAbsence;
    };

    const loadForm = async (futureAbsence: DTFutureAbsencesDto) => {
      form.matriculateId = props.matriculateId;

      form.startAbsence = futureAbsence.startAbsence;
      form.endAbsence = futureAbsence.endAbsence;

      form.sesionNumbers = futureAbsence.sesionNumbers.split(',').map(Number);
      form.isJustificationAbsence = !!futureAbsence.isJustificationAbsence;

      form.absenceTypeId = futureAbsence.absenceTypeId;
      form.justificationAbsence = futureAbsence.justificationAbsence;

      form.attachmentAbsenceUrl = futureAbsence.attachmentAbsenceUrl || null;
    };
    const resetForm = () => {
      form.matriculateId = props.matriculateId;

      form.startAbsence = null;
      form.endAbsence = null;

      form.sesionNumbers = [];
      form.isJustificationAbsence = false;

      form.absenceTypeId = null;
      form.justificationAbsence = null;

      form.attachmentAbsenceUrl = null;

      selectedFile.value = null;

      v$.value.$reset();
    };

    const openFileSelector = () => {
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.click();
    };
    const onFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0];
        form.attachmentAbsenceUrl = null; // Limpiar URL existente si hay un nuevo archivo
      }
    };
    const removeFile = () => {
      selectedFile.value = null;
      form.attachmentAbsenceUrl = null;
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    };
    const getFileName = (url: string | null) => {
      if (!url) return '';
      const parts = url.split('/');
      return parts[parts.length - 1];
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

      let dataSend: ParamsFormFutureAbsencesDto = {
        matriculateId: form.matriculateId,

        startAbsence: form.startAbsence,
        endAbsence: form.endAbsence,

        sesionNumbers: form.sesionNumbers.join(','),
        isJustificationAbsence: form.isJustificationAbsence ? 1 : 0,

        absenceTypeId: form.absenceTypeId,
        justificationAbsence: form.justificationAbsence,
      };

      try {
        if (selectedFile.value) {
          const formData = new FormData();

          formData.append('matriculateId', form.matriculateId);
          formData.append('startAbsence', form.startAbsence);
          formData.append('endAbsence', form.endAbsence);
          formData.append('sesionNumbers', form.sesionNumbers);
          formData.append('isJustificationAbsence', form.isJustificationAbsence ? '1' : '0');
          formData.append('absenceTypeId', form.absenceTypeId);
          formData.append('justificationAbsence', form.justificationAbsence);
          formData.append('files', selectedFile.value);

          await createOrUpdateFutureAbsencesService.run(formData as any, props.futureAbsence?.id);
        } else {
          await createOrUpdateFutureAbsencesService.run(dataSend as any, props.futureAbsence?.id);
        }

        updateVisibility(false);

        emit('reload-data');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      v$,
      t,

      isAllSelected,
      loading,

      selectedFile,
      form,

      // Funtions
      setJustification,
      updateVisibility,
      openFileSelector,
      toggleSelectAll,
      onFileChange,
      getFileName,
      removeFile,
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
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}
.cursor {
  cursor: pointer;
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.form-check-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--color-primary-rgb), 0.25);
}
</style>
