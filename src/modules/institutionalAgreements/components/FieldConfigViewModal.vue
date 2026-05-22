<template>
  <AppFormModal :title="`Configuración de Convenio: ${data?.code}`">
    <template v-slot:content>
      <div v-if="data" class="fieldConfigView">
        <!-- Identificación -->
        <div class="fieldConfigView__header">
          <p class="fieldConfigView__subtitle">{{ data.code }} - {{ data.name }}</p>
          <div class="fieldConfigView__infoRow">
            <span class="fieldConfigView__infoItem">
              <span class="fieldConfigView__infoLabel">Total Campos Configurados:</span>
              <span class="fieldConfigView__infoValue">{{ data.totalConfiguredFields }}</span>
            </span>
            <span class="fieldConfigView__infoItem">
              <span class="fieldConfigView__infoLabel">Estado:</span>
              <span class="fieldConfigView__infoValue">{{ data.isActive ? 'Activo' : 'Inactivo' }}</span>
            </span>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs fieldConfigView__tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'fields' }" id="fields-tab" @click="activeTab = 'fields'" type="button" role="tab">
              <AppIcon icon="file-alt" class="me-2" />
              Campos del Formulario
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'sections' }" id="sections-tab" @click="activeTab = 'sections'" type="button" role="tab">
              <AppIcon icon="list" class="me-2" />
              Secciones
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'attachments' }" id="attachments-tab" @click="activeTab = 'attachments'" type="button" role="tab">
              <AppIcon icon="paperclip" class="me-2" />
              Adjuntos Requeridos
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content fieldConfigView__tabContent">
          <!-- Tab 1: Campos del Formulario -->
          <div v-if="activeTab === 'fields'" role="tabpanel" class="fieldConfigView__sections">
            <div v-for="section in data.sections" :key="section.id" class="fieldConfigView__section">
              <div class="fieldConfigView__sectionHead">
                <span class="fieldConfigView__sectionTitle">{{ section.name }}</span>
                <span class="fieldConfigView__sectionCount"> {{ section.totalVisible }} de {{ section.totalFields }} campos visibles </span>
              </div>

              <table class="fieldConfigView__table">
                <thead>
                  <tr>
                    <th class="fieldConfigView__th fieldConfigView__th--field">Campo</th>
                    <th class="fieldConfigView__th fieldConfigView__th--check">Visible</th>
                    <th class="fieldConfigView__th fieldConfigView__th--check">Obligatorio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in section.fields" :key="field.id" class="fieldConfigView__tr">
                    <td class="fieldConfigView__td">{{ field.name }}</td>
                    <td class="fieldConfigView__td fieldConfigView__td--center">
                      <AppIcon v-if="field.visible" icon="check-circle" class="fieldConfigView__iconCheck" />
                      <AppIcon v-else icon="minus-circle" class="fieldConfigView__iconMinus" />
                    </td>
                    <td class="fieldConfigView__td fieldConfigView__td--center">
                      <AppIcon v-if="field.required" icon="check-circle" class="fieldConfigView__iconCheck" />
                      <AppIcon v-else icon="minus-circle" class="fieldConfigView__iconMinus" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty state -->
            <div v-if="!data.sections || data.sections.length === 0" class="emptyState">
              <AppIcon icon="file-alt" class="emptyState__icon" />
              <p class="emptyState__title">No hay campos configurados</p>
              <p class="emptyState__text">Los campos del formulario aparecerán aquí cuando se configuren</p>
            </div>
          </div>

          <!-- Tab 2: Secciones del Formulario -->
          <div v-if="activeTab === 'sections'" role="tabpanel" class="fieldConfigView__grid">
            <div v-for="section in data.sections" :key="section.id" class="fieldConfigView__card">
              <div class="fieldConfigView__cardHead">
                <h4 class="fieldConfigView__cardTitle">{{ section.name }}</h4>
              </div>
              <div class="fieldConfigView__cardBody">
                <div class="fieldConfigView__cardRow">
                  <span class="fieldConfigView__label">Campos Totales:</span>
                  <span class="fieldConfigView__value">{{ section.totalFields }}</span>
                </div>
                <div class="fieldConfigView__cardRow">
                  <span class="fieldConfigView__label">Campos Visibles:</span>
                  <span class="fieldConfigView__value">{{ section.totalVisible }}</span>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="!data.sections || data.sections.length === 0" class="emptyState">
              <AppIcon icon="layer-group" class="emptyState__icon" />
              <p class="emptyState__title">No hay secciones configuradas</p>
              <p class="emptyState__text">Las secciones del formulario aparecerán aquí cuando se configuren</p>
            </div>
          </div>

          <!-- Tab 3: Adjuntos Requeridos -->
          <div v-if="activeTab === 'attachments'" role="tabpanel" class="fieldConfigView__grid">
            <div v-for="attachment in data.attachments" :key="attachment.id" class="fieldConfigView__card">
              <div class="fieldConfigView__cardHead">
                <h4 class="fieldConfigView__cardTitle">
                  {{ attachment.name }}
                </h4>
                <span v-if="attachment.required === 1" class="fieldConfigView__badge">Obligatorio</span>
              </div>
              <div class="fieldConfigView__cardBody">
                <div v-if="attachment.description" class="fieldConfigView__cardRow">
                  <span class="fieldConfigView__label">Descripción:</span>
                  <span class="fieldConfigView__value">{{ attachment.description }}</span>
                </div>
                <div class="fieldConfigView__cardRow">
                  <span class="fieldConfigView__label">Estado:</span>
                  <span
                    class="fieldConfigView__badge"
                    :class="{
                      'fieldConfigView__badge--active': attachment.isActive === 1,
                    }"
                  >
                    {{ attachment.isActive === 1 ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="!data.attachments || data.attachments.length === 0" class="emptyState">
              <AppIcon icon="file-alt" class="emptyState__icon" />
              <p class="emptyState__title">No hay adjuntos configurados</p>
              <p class="emptyState__text">Los archivos requeridos para postularse aparecerán aquí</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { AgreementTypeDto } from '../dtos/agreementType.dto';

export default defineComponent({
  name: 'FieldConfigViewModal',
  components: {
    AppFormModal,
    AppIcon,
  },
  props: {
    data: {
      type: Object as PropType<AgreementTypeDto>,
      required: true,
    },
  },
  setup() {
    const activeTab = ref<'fields' | 'sections' | 'attachments'>('fields');

    return {
      activeTab,
    };
  },
});
</script>

<style scoped>
.fieldConfigView {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Header */
.fieldConfigView__header {
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(var(--color-gray-600-rgb), 0.15);
}

.fieldConfigView__subtitle {
  margin: 0 0 0.6rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark, #111827);
}

.fieldConfigView__infoRow {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background-color: rgba(var(--color-primary-rgb), 0.04);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 6px;
  font-size: 0.95rem;
  color: var(--color-dark, #374151);
}

.fieldConfigView__infoItem {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.fieldConfigView__infoLabel {
  font-weight: 500;
  color: var(--color-gray-600, #6b7280);
}

.fieldConfigView__infoValue {
  font-weight: 700;
  color: var(--color-dark, #111827);
}

/* Tabs Navigation */
.fieldConfigView__tabs {
  border-bottom: 2px solid rgba(var(--color-gray-600-rgb), 0.15);
  gap: 0;
}

.fieldConfigView__tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-gray-600, #6b7280);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  margin-bottom: -2px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.fieldConfigView__tabs .nav-link:hover {
  color: var(--color-primary);
  border-bottom-color: rgba(var(--color-primary-rgb), 0.3);
}

.fieldConfigView__tabs .nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Tab Content */
.fieldConfigView__tabContent {
  padding-top: 1rem;
}

/* Secciones */
.fieldConfigView__sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.fieldConfigView__section {
  border: 1px solid rgba(var(--color-gray-600-rgb), 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.fieldConfigView__sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background-color: rgba(var(--color-primary-rgb), 0.04);
  gap: 0.5rem;
  flex-wrap: wrap;
}

.fieldConfigView__sectionTitle {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
}

.fieldConfigView__sectionCount {
  font-size: 0.88rem;
  color: var(--color-gray-600, #6b7280);
}

/* Tabla */
.fieldConfigView__table {
  width: 100%;
  border-collapse: collapse;
}

.fieldConfigView__th {
  padding: 0.6rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-gray-600, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background-color: rgba(var(--color-gray-600-rgb), 0.04);
  border-bottom: 1px solid rgba(var(--color-gray-600-rgb), 0.1);
  text-align: left;
}

.fieldConfigView__th--check {
  text-align: center;
  width: 110px;
}

.fieldConfigView__tr:not(:last-child) {
  border-bottom: 1px solid rgba(var(--color-gray-600-rgb), 0.08);
}

.fieldConfigView__td {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  color: var(--color-dark, #374151);
}

.fieldConfigView__td--center {
  text-align: center;
}

.fieldConfigView__iconCheck {
  color: var(--color-success, #16a34a);
  font-size: 1.1rem;
}

.fieldConfigView__iconMinus {
  color: rgba(var(--color-gray-600-rgb), 0.35);
  font-size: 1.1rem;
}

/* Grid Layout */
.fieldConfigView__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Cards */
.fieldConfigView__card {
  border: 1px solid rgba(var(--color-gray-600-rgb), 0.15);
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.2s ease;
  overflow: hidden;
}

.fieldConfigView__card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.fieldConfigView__cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: rgba(var(--color-primary-rgb), 0.04);
  border-bottom: 1px solid rgba(var(--color-gray-600-rgb), 0.1);
  gap: 0.5rem;
}

.fieldConfigView__cardTitle {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark, #111827);
  flex: 1;
}

.fieldConfigView__cardBody {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fieldConfigView__cardRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.88rem;
}

.fieldConfigView__label {
  font-weight: 600;
  color: var(--color-gray-600, #6b7280);
}

.fieldConfigView__value {
  font-weight: 500;
  color: var(--color-dark, #111827);
}

/* Badges */
.fieldConfigView__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.fieldConfigView__badge--active {
  background-color: #dcfce7;
  color: #16a34a;
}

/* Empty State */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-gray-600, #6b7280);
}

.emptyState__icon {
  font-size: 3rem;
  color: rgba(var(--color-gray-600-rgb), 0.2);
  margin-bottom: 1rem;
}

.emptyState__title {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark, #111827);
}

.emptyState__text {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-gray-600, #6b7280);
}

@media (max-width: 768px) {
  .sectionsGrid,
  .attachmentsGrid {
    grid-template-columns: 1fr;
  }

  .fieldConfigView__infoRow {
    flex-direction: column;
    gap: 0.5rem;
  }

  .fieldConfigView__tabs .nav-link {
    font-size: 0.85rem;
    padding: 0.6rem 0.75rem;
  }
}
</style>
