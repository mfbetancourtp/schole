<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <div class="d-flex align-items-center gap-3 w-100">
        <div class="drawer-edit-icon">
          <AppIcon icon="pencil-alt" />
        </div>
        <div>
          <h6 class="mb-0 text-white fw-bold">Editar Área</h6>
          <div v-if="area" class="d-flex align-items-center gap-2 mt-1">
            <span class="code-badge">{{ area.abbreviation || '—' }}</span>
            <span class="text-white-50 small">Código actual</span>
          </div>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form @submit.prevent="save" id="edit-area-form">
        <div class="drawer-section">
          <div class="section-number">1</div>
          <div class="flex-grow-1">
            <h6 class="section-title">Información General</h6>
            <p class="section-subtitle">Datos básicos del área de conocimiento</p>
            <div class="section-card">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="field-label">Código del área <span class="text-danger">*</span></label>
                  <input class="form-control" type="text" v-model="form.code" placeholder="Ej: CB" />
                  <p class="field-hint">Identificador único del área</p>
                </div>
                <div class="col-md-6">
                  <label class="field-label">Nombre del área <span class="text-danger">*</span></label>
                  <input class="form-control" type="text" v-model="form.name" placeholder="Ej: Ciencias Básicas" />
                  <p class="field-hint">Nombre descriptivo del área</p>
                </div>
              </div>

              <div class="mt-3">
                <label class="field-label">Descripción</label>
                <textarea class="form-control" rows="3" v-model="form.description" placeholder="Describe el propósito y alcance de esta área académica..."></textarea>
                <p class="field-hint">Información adicional sobre el área (opcional)</p>
              </div>

              <div class="mt-3 d-flex align-items-center justify-content-between">
                <div>
                  <label class="field-label mb-0">Estado del área</label>
                  <p class="field-hint mb-0">
                    {{ form.isActive ? 'El área está activa' : 'El área está inactiva' }}
                  </p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input switch-lg" type="checkbox" v-model="form.isActive" role="switch" />
                </div>
              </div>

              <div class="info-bottom-notice mt-3">
                <div class="info-bottom-title">
                  <AppIcon icon="info-circle" class="me-2" />
                  <span>Información</span>
                </div>
                <ul class="info-bottom-list">
                  <li>El área creada estará disponible para asociar asignaturas</li>
                  <li>El código debe ser único en el sistema</li>
                  <li>Podrás editar esta información posteriormente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Asignaturas asociadas -->
        <div class="drawer-section" v-if="area && area.subjects?.length">
          <div class="section-number">2</div>
          <div class="flex-grow-1">
            <h6 class="section-title">Gestión de Asignaturas Asociadas</h6>
            <p class="section-subtitle">Administra las asignaturas vinculadas a esta área</p>
            <div class="section-card p-0">
              <div class="subject-list-header px-3 pt-3 pb-2 d-flex justify-content-between align-items-center">
                <div>
                  <span class="fw-bold">{{ area.subjects.length }} asignaturas asociadas</span>
                </div>
              </div>
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>NOMBRE</th>
                    <th>TIPO</th>
                    <th>CRÉDITOS</th>
                    <th>HORAS</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sub in area.subjects" :key="sub.id">
                    <td class="small text-primary fw-semibold">
                      {{ sub.abbreviation || '—' }}
                    </td>
                    <td class="small">{{ sub.name }}</td>
                    <td>
                      <span class="badge-type">{{ sub.subjectType || '—' }}</span>
                    </td>
                    <td class="small">{{ sub.credits ?? '—' }}</td>
                    <td class="small">
                      {{ sub.totalHours ? sub.totalHours + 'h' : '—' }}
                    </td>
                    <td>
                      <button type="button" class="btn-desasociar"><AppIcon icon="trash" class="me-1" />Desasociar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <AppButton label="core.cancel" outlined variant="secondary" @click="$emit('update:isVisible', false)"></AppButton>
        <AppButton label="Guardar cambios" variant="primary" :outlined="false" nativeType="submit" form="edit-area-form"></AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { AreaDto } from '../../../shared/dto/area.dto';
import { CreateOrUpdateAreaService } from '../services/createOrUpdateArea.service';

const createOrUpdateAreaService = new CreateOrUpdateAreaService();

export default defineComponent({
  name: 'AreaEditDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    area: { type: Object as PropType<AreaDto | null>, default: null },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const form = reactive({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });

    watch(
      () => props.area,
      (area) => {
        if (area) {
          form.name = area.name ?? '';
          form.code = area.abbreviation ?? '';
          form.description = (area as any).description ?? '';
          form.isActive = (area as any).isActive !== false;
        } else {
          form.name = '';
          form.code = '';
          form.description = '';
          form.isActive = true;
        }
      },
      { immediate: true }
    );

    const save = async () => {
      try {
        await createOrUpdateAreaService.run({ name: form.name, code: form.code }, props.area?.id);
        emit('saved');
        emit('update:isVisible', false);
      } catch (e) {
        console.error(e);
      }
    };

    return { form, save };
  },
});
</script>

<style scoped>
.drawer-edit-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
}

.code-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

/* Secciones */
.drawer-section {
  display: flex;
  gap: 16px;
  padding: 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8f0fe;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.section-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.section-subtitle {
  color: #6b7280;
  font-size: 0.82rem;
  margin-bottom: 12px;
}

.section-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
}

.field-label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
  display: block;
}

.field-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
  margin-bottom: 0;
}

.switch-lg {
  width: 2.8em;
  height: 1.5em;
  cursor: pointer;
}

/* Subject table inside drawer */
.subject-list-header {
  border-bottom: 1px solid #e5e7eb;
}

.table thead th {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  background: #f9fafb;
  padding: 8px 12px;
}

.table tbody td {
  font-size: 0.85rem;
  vertical-align: middle;
  padding: 8px 12px;
}

.badge-type {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.btn-desasociar {
  background: transparent;
  border: none;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
}
.btn-desasociar:hover {
  text-decoration: underline;
}

/* Info al final del form */
.info-bottom-notice {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 14px 16px;
}
.info-bottom-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.88rem;
  color: #1d4ed8;
  margin-bottom: 10px;
}
.info-bottom-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.info-bottom-list li {
  font-size: 0.82rem;
  color: #1e40af;
}
</style>
