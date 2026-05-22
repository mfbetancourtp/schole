<template>
  <form @submit.prevent="save">
    <AppFormModal :title="'¿Deseas inactivar este programa?'">
      <template v-slot:content>
        <div class="deactivate-modal-body">
          <p class="text-muted mb-3" style="font-size: 0.9rem">Esta acción cambiará el estado del programa y no permitirá nuevas matrículas.</p>

          <!-- Program info summary card -->
          <div class="info-card mb-4">
            <div class="row g-2">
              <div class="col-12 mb-1">
                <label class="label-small">Programa</label>
                <div class="value-text fw-bold">{{ program?.name }}</div>
              </div>
              <div class="col-6">
                <label class="label-small">Código</label>
                <div class="value-text">{{ program?.code || '---' }}</div>
              </div>
              <div class="col-6">
                <label class="label-small">Estado actual</label>
                <div>
                  <span class="badge bg-success-light text-success rounded-pill px-2">Activo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert box -->
          <div class="warning-banner mb-4">
            <div class="d-flex align-items-start gap-2">
              <AppIcon icon="exclamation-circle" class="text-danger mt-1" />
              <div>
                <div class="fw-bold text-danger mb-1" style="font-size: 0.85rem">Este programa tiene estudiantes activos</div>
                <p class="m-0 text-danger" style="font-size: 0.8rem; line-height: 1.3">Inactivarlo impedirá nuevas matrículas pero no eliminará información histórica.</p>
              </div>
            </div>
          </div>

          <!-- Form Section -->
          <AppFormField :form-control="v$.form.inactivationReasonId">
            <label>Motivo de inactivación <span class="text-danger">*</span></label>
            <AppAutocomplete
              input-id="inactivationReasonId"
              :modelValue="v$.form.inactivationReasonId.$model"
              :options="inactivationReasons"
              label="name"
              :reduce="(opt: any) => opt.id"
              :clearable="false"
              :multiple="false"
              @update:modelValue="v$.form.inactivationReasonId.$model = $event"
            />
          </AppFormField>

          <AppFormField :form-control="v$.form.inactivationObservations">
            <label>Observaciones (opcional)</label>
            <textarea class="form-control" rows="3" placeholder="Agregar comentarios adicionales sobre la inactivación..." v-model="v$.form.inactivationObservations.$model"></textarea>
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton>Confirmar inactivación</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { ProgramDto } from '../dtos/programs.dto';
import { CreateOrUpdateProgramsService } from '../services/createOrUpdatePrograms.service';
import { GetInactivationReasonsService } from '../services/getInactivationReasons.service';

const createOrUpdateProgramsService = new CreateOrUpdateProgramsService();
const getInactivationReasonsService = new GetInactivationReasonsService();

export default defineComponent({
  name: 'ProgramDeactivateModal',
  components: {
    AppFormModal,
    AppFormField,
    AppAutocomplete,
    AppIcon,
    AppButton,
  },
  props: {
    program: {
      type: Object as PropType<ProgramDto | null>,
      default: null,
    },
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const inactivationReasons = ref<any[]>([]);

    onMounted(async () => {
      const response = await getInactivationReasonsService.run({ noPag: true });
      inactivationReasons.value = response?.data ?? response ?? [];
    });

    const form = reactive({
      inactivationReasonId: null as number | null,
      inactivationObservations: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          inactivationReasonId: { required },
          inactivationObservations: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await createOrUpdateProgramsService.run(
          {
            inactivationReasonId: form.inactivationReasonId ?? undefined,
            inactivationObservations: form.inactivationObservations || undefined,
            state: 'Inactivo',
          },
          props.program?.id
        );
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      v$,
      inactivationReasons,
      save,
    };
  },
});
</script>

<style scoped>
.deactivate-modal-body {
  margin-top: -10px;
}

.info-card {
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 16px;
}

.label-small {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: none;
  margin-bottom: 2px;
}

.value-text {
  font-size: 0.95rem;
  color: #111827;
}

.warning-banner {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 14px;
}

.bg-success-light {
  background-color: #dcfce7;
}
</style>
