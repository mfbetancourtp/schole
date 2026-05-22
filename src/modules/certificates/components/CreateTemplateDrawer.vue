<template>
  <div class="create-drawer">
    <!-- Form section -->
    <div class="create-drawer__form">
      <AppFormField :label="t('Nombre de la plantilla')">
        <AppInput v-model="form.name" :placeholder="t('Ej: Trabajo de Suficiencia Profesional')" />
      </AppFormField>

      <AppFormField :label="t('Descripción')">
        <AppVoiceInput v-model="form.description" :placeholder="t('Describe brevemente la modalidad...')" :rows="3" textareaClass="form-control" />
      </AppFormField>

      <div class="create-drawer__row">
        <!-- Icon picker (inline accordion) -->
        <AppFormField :label="t('Ícono')">
          <div class="icon-picker">
            <div class="icon-picker__trigger" @click="iconDropdownOpen = !iconDropdownOpen">
              <div class="icon-picker__swatch" :style="{ backgroundColor: iconBg, color: form.color }">
                <AppIcon :icon="form.icon" />
              </div>
              <span class="icon-picker__label">{{ form.icon }}</span>
              <AppIcon icon="chevron-down" class="icon-picker__chevron" :class="{ 'icon-picker__chevron--open': iconDropdownOpen }" />
            </div>
            <div v-if="iconDropdownOpen" class="icon-picker__panel">
              <div class="icon-grid">
                <div
                  v-for="icon in AVAILABLE_ICONS"
                  :key="icon"
                  class="icon-grid__option"
                  :class="{ 'icon-grid__option--selected': form.icon === icon }"
                  :style="
                    form.icon === icon
                      ? {
                          backgroundColor: iconBg,
                          color: form.color,
                          borderColor: form.color,
                        }
                      : {}
                  "
                  :title="icon"
                  @click="
                    form.icon = icon;
                    iconDropdownOpen = false;
                  "
                >
                  <AppIcon :icon="icon" />
                </div>
              </div>
            </div>
          </div>
        </AppFormField>

        <!-- Color picker -->
        <AppFormField :label="t('Color')">
          <input type="color" v-model="form.color" class="create-drawer__color-input" />
        </AppFormField>
      </div>
    </div>

    <!-- Header preview -->
    <div class="create-drawer__preview-section">
      <p class="create-drawer__preview-label">{{ t('Vista previa') }}</p>
      <div class="create-drawer__preview-card" :style="{ backgroundColor: headerBg }">
        <div class="create-drawer__preview-icon-wrap" :style="{ backgroundColor: iconBg }">
          <AppIcon :icon="form.icon || 'graduation-cap'" :style="{ color: form.color }" />
        </div>
        <div class="create-drawer__preview-text">
          <span class="create-drawer__preview-name" :style="{ color: form.color }">
            {{ form.name || t('Nombre de la plantilla') }}
          </span>
          <span class="create-drawer__preview-desc">
            {{ form.description || t('Descripción de la plantilla') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="milestone-drawer__instructions">
      <h5 class="milestone-drawer__instructions-title">
        {{ t('Instrucciones:') }}
      </h5>
      <ul class="milestone-drawer__instructions-list">
        <li>
          {{ t('Define cada hito que debe cumplir el estudiante durante su proceso') }}
        </li>
        <li>
          {{ t('La duración se cuenta en días desde la fecha de aprobación de la postulación') }}
        </li>
        <li>
          {{ t('Puedes agregar, editar o eliminar hitos según las necesidades académicas') }}
        </li>
        <li>
          {{ t('Los cambios se aplicarán a las nuevas postulaciones aprobadas') }}
        </li>
      </ul>
    </div>

    <!-- Milestones header -->
    <div class="milestone-drawer__header">
      <h4 class="milestone-drawer__section-title">
        {{ t('Hitos de la Plantilla') }}
      </h4>
      <AppButton :label="t('Agregar Hito')" variant="primary" outlined icon="plus" @click="addMilestone" />
    </div>

    <!-- Empty state -->
    <div v-if="!milestones.length" class="milestones-empty">
      <AppIcon icon="clipboard-list" class="milestones-empty__icon" />
      <p class="milestones-empty__title">
        {{ t('No hay hitos configurados') }}
      </p>
      <p class="milestones-empty__subtitle">
        {{ t('Haz clic en "Agregar hito" para comenzar') }}
      </p>
    </div>

    <!-- Milestone cards -->
    <div v-else ref="milestoneListRef" class="milestone-drawer__list">
      <div v-for="(milestone, index) in milestones" :key="index" class="milestone-card">
        <div class="milestone-card__header">
          <div class="milestone-card__order-badge" :style="{ backgroundColor: iconBg, color: form.color }">
            {{ index + 1 }}
          </div>
          <span class="milestone-card__header-label">{{ t('Hito') }} {{ index + 1 }}</span>
          <div class="milestone-card__spacer"></div>
          <AppButton variant="danger" @click="milestones.splice(index, 1)">
            <AppIcon icon="trash" />
          </AppButton>
        </div>

        <AppFormField :label="t('Nombre del hito')">
          <AppInput v-model="milestone.name" :placeholder="t('Ej: Entrega de propuesta inicial')" />
        </AppFormField>

        <AppFormField :label="t('Descripción')">
          <AppInput v-model="milestone.description" :placeholder="t('Descripción del hito')" />
        </AppFormField>

        <AppFormField :label="t('Plazo (días desde aprobación)')">
          <AppInput v-model="milestone.approvalDeadline" type="number" :placeholder="t('Días')" />
          <span class="milestone-card__hint">
            <AppIcon icon="info-circle" />
            {{ t('Este hito debe completarse') }}
            {{ milestone.approvalDeadline }}
            {{ t('días después de la aprobación') }}
          </span>
        </AppFormField>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="milestones.length" class="milestone-drawer__summary">
      <h5 class="milestone-drawer__summary-title">
        {{ t('Resumen del cronograma:') }}
      </h5>
      <div class="milestone-drawer__summary-stats">
        <div class="milestone-drawer__summary-stat">
          <span class="milestone-drawer__summary-label">{{ t('Total de hitos') }}</span>
          <span class="milestone-drawer__summary-value">{{ milestones.length }}</span>
        </div>
        <div class="milestone-drawer__summary-stat">
          <span class="milestone-drawer__summary-label">{{ t('Duración total estimada') }}</span>
          <span class="milestone-drawer__summary-value">{{ totalDuration }} {{ t('días') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MilestoneFormItem } from '../dtos/scheduleConfig.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const AVAILABLE_ICONS = [
  'graduation-cap',
  'book',
  'book-open',
  'book-medical',
  'university',
  'school',
  'certificate',
  'scroll',
  'award',
  'medal',
  'trophy',
  'star',
  'chalkboard',
  'chalkboard-teacher',
  'clipboard-list',
  'clipboard-check',
  'file-signature',
  'file-contract',
  'file-alt',
  'file',
  'file-pdf',
  'tasks',
  'project-diagram',
  'sitemap',
  'layer-group',
  'chart-line',
  'chart-bar',
  'chart-pie',
  'brain',
  'search-plus',
  'calendar-check',
  'calendar-alt',
  'clock',
  'history',
  'handshake',
  'briefcase',
  'user-tie',
  'users',
  'globe',
  'id-card',
  'pen',
];

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = (hex || '#1b55e2').replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) || 27;
  const g = parseInt(cleaned.slice(2, 4), 16) || 85;
  const b = parseInt(cleaned.slice(4, 6), 16) || 226;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default defineComponent({
  name: 'CreateTemplateDrawer',
  components: { AppIcon, AppButton, AppFormField, AppInput, AppVoiceInput },
  setup(_, { expose }) {
    const { t } = useI18n();

    const form = reactive({
      name: '',
      description: '',
      icon: 'graduation-cap',
      color: '#1b55e2',
    });

    const milestones = ref<MilestoneFormItem[]>([]);
    const iconDropdownOpen = ref(false);
    const milestoneListRef = ref<HTMLElement | null>(null);

    const headerBg = computed(() => hexToRgba(form.color, 0.07));
    const iconBg = computed(() => hexToRgba(form.color, 0.12));
    const totalDuration = computed(() => {
      if (!milestones.value.length) return 0;
      return Math.max(...milestones.value.map((m) => m.approvalDeadline));
    });

    const addMilestone = async () => {
      const last = milestones.value.length > 0 ? milestones.value[milestones.value.length - 1].approvalDeadline : 0;
      milestones.value.push({
        id: 0,
        name: '',
        description: '',
        approvalDeadline: last + 30,
      });
      await nextTick();
      const cards = milestoneListRef.value?.querySelectorAll<HTMLElement>('.milestone-card');
      if (cards?.length)
        cards[cards.length - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    };

    const reset = () => {
      form.name = '';
      form.description = '';
      form.icon = 'graduation-cap';
      form.color = '#1b55e2';
      milestones.value = [];
    };

    const getFormData = () => ({
      name: form.name,
      description: form.description,
      icon: form.icon,
      color: form.color,
      milestones: milestones.value.slice(),
    });

    expose({ getFormData, reset });

    return {
      t,
      form,
      milestones,
      headerBg,
      iconBg,
      totalDuration,
      addMilestone,
      AVAILABLE_ICONS,
      iconDropdownOpen,
      milestoneListRef,
    };
  },
});
</script>

<style scoped>
.create-drawer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 1.5rem;
}

/* Form */
.create-drawer__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.create-drawer__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: start;
}

/* Icon picker (inline accordion) */
.icon-picker__trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 8px;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s;
  user-select: none;
}

.icon-picker__trigger:hover {
  border-color: var(--color-primary);
}

.icon-picker__swatch {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.icon-picker__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  flex: 1;
}

.icon-picker__chevron {
  font-size: 12px;
  color: #919eab;
  transition: transform 0.2s;
}

.icon-picker__chevron--open {
  transform: rotate(180deg);
}

.icon-picker__panel {
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 10px;
  max-height: 220px;
  overflow-y: auto;
  padding: 10px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.icon-grid__option {
  width: 36px;
  height: 36px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1.5px solid transparent;
  color: #637381;
  font-size: 14px;
  transition: background-color 0.12s, color 0.12s;
}

.icon-grid__option:hover {
  background: rgba(145, 158, 171, 0.12);
  color: #212b36;
}

.icon-grid__option--selected {
  border-style: solid;
  border-width: 1.5px;
}

/* Color */
.create-drawer__color-input {
  -webkit-appearance: none;
  width: 44px;
  height: 44px;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  display: block;
}

.create-drawer__color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.create-drawer__color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

/* Preview */
.create-drawer__preview-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.create-drawer__preview-label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #212b36;
  margin: 0;
}

.create-drawer__preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 12px;
}

.create-drawer__preview-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.create-drawer__preview-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.create-drawer__preview-name {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.create-drawer__preview-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #637381;
  line-height: 1.4;
}

/* Empty state */
.milestones-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 36px 24px;
  border: 2px dashed rgba(145, 158, 171, 0.32);
  border-radius: 12px;
  background: transparent;
}

.milestones-empty__icon {
  font-size: 32px;
  color: #c4cdd6;
}

.milestones-empty__title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #637381;
  margin: 0;
}

.milestones-empty__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  margin: 0;
}

/* Shared milestone styles */
.milestone-drawer__instructions {
  background: #f4f6f8;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  padding: 16px 20px;
}

.milestone-drawer__instructions-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
  margin: 0 0 10px 0;
}

.milestone-drawer__instructions-list {
  margin: 0;
  padding: 0 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.milestone-drawer__instructions-list li {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

.milestone-drawer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.milestone-drawer__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.milestone-drawer__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.milestone-card {
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #ffffff;
}

.milestone-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.milestone-card__order-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.milestone-card__header-label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.milestone-card__spacer {
  flex: 1;
}

.milestone-card__hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: var(--color-success, #36b37e);
  margin-top: 2px;
}

.milestone-drawer__summary {
  border-top: 1px solid rgba(145, 158, 171, 0.16);
  padding-top: 20px;
}

.milestone-drawer__summary-title {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
  margin: 0 0 12px 0;
}

.milestone-drawer__summary-stats {
  display: flex;
  gap: 40px;
}

.milestone-drawer__summary-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.milestone-drawer__summary-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.milestone-drawer__summary-value {
  font-family: 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #212b36;
}
</style>
