<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <span class="title-form tw-text-white tw-font-semibold">Jornadas Personalizadas</span>
    </template>

    <template #body>
      <div class="p-3">
        <!-- Info callout -->
        <div class="info-callout mb-4">
          <div class="info-callout__icon">
            <AppIcon icon="circle-info" />
          </div>
          <div>
            <p class="fw-semibold small mb-1">¿Cómo funciona?</p>
            <p class="small text-muted mb-0">
              Crea y administra tus bloques de horario personalizado. Si editas una jornada que ya tienes asignada a un día, el cambio se reflejará automáticamente en tu disponibilidad semanal.
            </p>
          </div>
        </div>

        <!-- Formulario nueva / editar jornada -->
        <p class="small fw-semibold mb-2">
          {{ editingId ? 'Editar jornada' : 'Nueva jornada' }}
        </p>
        <div class="d-flex gap-2 align-items-end mb-1">
          <div class="flex-fill">
            <label class="form-label form-label-sm mb-1">Hora de inicio</label>
            <input v-model="form.timeSince" type="time" class="form-control form-control-sm" />
          </div>
          <div class="flex-fill">
            <label class="form-label form-label-sm mb-1">Hora de fin</label>
            <input v-model="form.timeUntil" type="time" class="form-control form-control-sm" />
          </div>
          <div class="d-flex gap-1 pb-0">
            <AppButton variant="primary" :outlined="false" :disabled="!canSave || isSaving" v-tooltip="editingId ? 'Guardar cambios' : 'Agregar jornada'" @click="handleSave">
              <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status"></span>
              <AppIcon v-else :icon="editingId ? 'check' : 'plus'" />
            </AppButton>
            <AppButton v-if="editingId" variant="ghost" v-tooltip="'Cancelar edición'" @click="cancelEdit">
              <AppIcon icon="times" />
            </AppButton>
          </div>
        </div>
        <div v-if="timeError" class="text-danger small mb-3">
          {{ timeError }}
        </div>

        <hr class="my-3" />

        <!-- Tabla de jornadas registradas -->
        <p class="small fw-semibold mb-2">Jornadas registradas</p>
        <div v-if="isLoading" class="text-center py-3">
          <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
        </div>
        <p v-else-if="journeys.length === 0" class="text-muted small text-center py-2 mb-0">Aún no tienes jornadas personalizadas.</p>
        <table v-else class="table table-sm table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th class="small fw-semibold">Inicio</th>
              <th class="small fw-semibold">Fin</th>
              <th class="small fw-semibold text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="j in journeys" :key="j.id" :class="{ 'table-primary': editingId === j.id }">
              <td class="small align-middle">{{ formatTime(j.timeSince) }}</td>
              <td class="small align-middle">{{ formatTime(j.timeUntil) }}</td>
              <td class="text-end align-middle">
                <div class="d-flex gap-1 justify-content-end">
                  <AppButton icon="pen" variant="ghost" v-tooltip="'Editar'" @click="startEdit(j)" />
                  <AppButton icon="trash" variant="ghost" v-tooltip="'Eliminar'" @click="handleDelete(j.id)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template #footer>
      <div class="d-flex py-1 px-3">
        <AppButton variant="ghost" :disabled="isSaving" @click="$emit('update:isVisible', false)"> Cerrar </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { GetPersonalizedJourneysTeachersService } from '../services/getPersonalizedJourneysTeachers.service';
import { CreatePersonalizedJourneyTeacherService } from '../services/createPersonalizedJourneyTeacher.service';
import { UpdatePersonalizedJourneyTeacherService } from '../services/updatePersonalizedJourneyTeacher.service';
import { DeletePersonalizedJourneyTeacherService } from '../services/deletePersonalizedJourneyTeacher.service';
import type { PersonalizedJourneyTeacherDto } from '../dtos/teacherJourney.dto';

const getService = new GetPersonalizedJourneysTeachersService();
const createService = new CreatePersonalizedJourneyTeacherService();
const updateService = new UpdatePersonalizedJourneyTeacherService();
const deleteService = new DeletePersonalizedJourneyTeacherService();

export default defineComponent({
  name: 'PersonalizedJourneyDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
  },
  emits: ['update:isVisible', 'saved', 'updated', 'deleted'],
  setup(props, { emit }) {
    const form = ref({ timeSince: '', timeUntil: '' });
    const isSaving = ref(false);
    const isLoading = ref(false);
    const journeys = ref<PersonalizedJourneyTeacherDto[]>([]);
    const editingId = ref<number | null>(null);

    const formatTime = (t: string) => t?.slice(0, 5) ?? '';

    const timeError = computed(() => {
      if (form.value.timeSince && form.value.timeUntil && form.value.timeSince >= form.value.timeUntil) {
        return 'La hora de fin debe ser mayor a la hora de inicio';
      }
      return '';
    });

    const canSave = computed(() => !!form.value.timeSince && !!form.value.timeUntil && !timeError.value);

    const resetForm = () => {
      form.value = { timeSince: '', timeUntil: '' };
      editingId.value = null;
    };

    const loadJourneys = async () => {
      isLoading.value = true;
      try {
        const data = await getService.run();
        journeys.value = Array.isArray(data) ? data : (data as any)?.data ?? [];
      } catch {
        journeys.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    watch(
      () => props.isVisible,
      (val) => {
        if (val) {
          resetForm();
          loadJourneys();
        }
      }
    );

    const startEdit = (j: PersonalizedJourneyTeacherDto) => {
      editingId.value = j.id;
      form.value = {
        timeSince: j.timeSince.slice(0, 5),
        timeUntil: j.timeUntil.slice(0, 5),
      };
    };

    const cancelEdit = () => resetForm();

    const handleSave = async () => {
      if (!canSave.value) return;
      isSaving.value = true;
      try {
        const payload = {
          timeSince: form.value.timeSince + ':00',
          timeUntil: form.value.timeUntil + ':00',
        };
        if (editingId.value) {
          const updatedId = editingId.value;
          await updateService.run(updatedId, payload);
          resetForm();
          await loadJourneys();
          emit('updated', {
            id: updatedId,
            ...payload,
          } as PersonalizedJourneyTeacherDto);
        } else {
          await createService.run(payload);
          await loadJourneys();
          const found = journeys.value.find((j) => j.timeSince === payload.timeSince && j.timeUntil === payload.timeUntil);
          resetForm();
          if (found) emit('saved', found);
        }
      } catch (error) {
        console.error('Error saving journey', error);
      } finally {
        isSaving.value = false;
      }
    };

    const handleDelete = async (id: number) => {
      try {
        await deleteService.run(id);
        if (editingId.value === id) resetForm();
        emit('deleted', id);
        await loadJourneys();
      } catch (error) {
        console.error('Error deleting journey', error);
      }
    };

    return {
      form,
      isSaving,
      isLoading,
      journeys,
      editingId,
      timeError,
      canSave,
      formatTime,
      startEdit,
      cancelEdit,
      handleSave,
      handleDelete,
    };
  },
});
</script>

<style scoped>
.info-callout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(var(--color-primary-rgb), 0.08);
  border-left: 3px solid var(--color-primary);
  border-radius: 8px;
  padding: 12px 14px;
}

.info-callout__icon {
  color: var(--color-primary);
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
