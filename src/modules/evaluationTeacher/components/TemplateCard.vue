<template>
  <div class="tCard">
    <div class="tCard__top">
      <div class="tCard__left">
        <!-- Icon -->
        <div class="tCard__iconWrap">
          <svg class="tCard__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path d="M9 12h6M9 16h6" />
          </svg>
        </div>

        <!-- Content -->
        <div class="tCard__content">
          <div class="tCard__header">
            <h3 class="tCard__title">{{ template.name }}</h3>
            <span class="tCard__status" :class="statusClass">{{ template.status || 'Sin estado' }}</span>
          </div>
          <p class="tCard__desc">{{ template.description }}</p>

          <!-- Stats -->
          <div class="tCard__stats">
            <div class="tCard__stat">
              <svg class="tCard__statIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>{{ template.dimensionCount }} dimensiones</span>
            </div>

            <div class="tCard__stat">
              <svg class="tCard__statIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{{ template.questionCount }} preguntas</span>
            </div>

            <div class="tCard__statSmall">
              Usada {{ template.usageCount }}
              {{ template.usageCount === 1 ? 'vez' : 'veces' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions menu dropdown -->
      <AppCheckPermission permission="surveyManagement.changeStatus">
        <div class="tCard__menuWrapper">
          <button type="button" class="tCard__moreBtn" title="Más opciones" @click="toggleMenu">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          <div v-if="menuOpen" class="tCard__dropdown">
            <div class="tCard__dropdownHeader">Cambiar estado</div>
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              class="tCard__dropdownItem"
              :class="{
                'tCard__dropdownItem--active': currentStatus === opt.value,
              }"
              @click="changeStatus(opt.value)"
            >
              <span class="tCard__dropdownIcon" v-html="opt.icon"></span>
              {{ opt.label }}
            </button>
          </div>
          <div v-if="menuOpen" class="tCard__overlay" @click="closeMenu"></div>
        </div>
      </AppCheckPermission>
    </div>

    <!-- Footer -->
    <div class="tCard__footer">
      <div class="tCard__modified">Modificada: {{ template.lastModified }}</div>

      <div class="tCard__actions">
        <AppCheckPermission permission="surveyManagement.delete">
          <button type="button" class="tBtn tBtn--danger" @click="$emit('delete', template)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Eliminar
          </button>
        </AppCheckPermission>

        <AppCheckPermission permission="surveyManagement.duplicate">
          <button type="button" class="tBtn tBtn--ghost" @click="$emit('duplicate', template)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Duplicar
          </button>
        </AppCheckPermission>

        <AppCheckPermission permission="surveyManagement.edit">
          <button
            type="button"
            class="tBtn tBtn--primary"
            :disabled="!canEdit"
            :title="canEdit ? 'Editar plantilla' : 'No se pueden editar plantillas publicadas'"
            @click="canEdit && $emit('edit', template)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
        </AppCheckPermission>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import type { EvaluationTemplateResponseDto } from '../dtos/evaluationTemplate.dto';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

export type TemplateStatusValue = 'draft' | 'published' | 'archived' | 'inactive';

/**
 * @deprecated Use EvaluationTemplateResponseDto from dtos instead
 */
export type Template = EvaluationTemplateResponseDto & {
  lastModified?: string; // Computed from updatedAt
};

const STATUS_OPTIONS = [
  {
    value: 'draft' as TemplateStatusValue,
    label: 'Borrador',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>',
  },
  {
    value: 'published' as TemplateStatusValue,
    label: 'Publicado',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>',
  },
  {
    value: 'archived' as TemplateStatusValue,
    label: 'Archivado',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>',
  },
  {
    value: 'inactive' as TemplateStatusValue,
    label: 'Inactivo',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>',
  },
];

export default defineComponent({
  name: 'TemplateCard',
  components: {
    AppCheckPermission,
  },
  props: {
    template: {
      type: Object as PropType<Template>,
      required: true,
    },
  },
  emits: ['edit', 'duplicate', 'delete', 'changeStatus'],
  setup(props, { emit }) {
    const menuOpen = ref(false);
    const statusOptions = STATUS_OPTIONS;

    const statusClass = computed(() => {
      const status = (props.template.status || '').toLowerCase();
      if (status === 'borrador' || status === 'draft') return 'tCard__status--draft';
      if (status === 'publicado' || status === 'published') return 'tCard__status--published';
      if (status === 'archivado' || status === 'archived') return 'tCard__status--archived';
      if (status === 'inactivo' || status === 'inactive') return 'tCard__status--inactive';
      return 'tCard__status--default';
    });

    const currentStatus = computed(() => {
      const status = (props.template.status || '').toLowerCase();
      if (status === 'borrador' || status === 'draft') return 'draft';
      if (status === 'publicado' || status === 'published') return 'published';
      if (status === 'archivado' || status === 'archived') return 'archived';
      if (status === 'inactivo' || status === 'inactive') return 'inactive';
      return 'draft';
    });

    const canEdit = computed(() => {
      const status = (props.template.status || '').toLowerCase();
      return status !== 'published' && status !== 'publicado' && status !== 'publicada';
    });

    const canDelete = computed(() => {
      const status = (props.template.status || '').toLowerCase();
      return status !== 'published' && status !== 'publicado' && status !== 'publicada';
    });

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
    };

    const closeMenu = () => {
      menuOpen.value = false;
    };

    const changeStatus = (newStatus: TemplateStatusValue) => {
      if (newStatus !== currentStatus.value) {
        emit('changeStatus', props.template, newStatus);
      }
      closeMenu();
    };

    return {
      statusClass,
      canEdit,
      canDelete,
      menuOpen,
      statusOptions,
      currentStatus,
      toggleMenu,
      closeMenu,
      changeStatus,
    };
  },
});
</script>

<style scoped>
.tCard {
  position: relative;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  transition: box-shadow 0.15s ease;
}
.tCard:hover {
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.tCard__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.tCard__left {
  display: flex;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.tCard__iconWrap {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tCard__icon {
  width: 24px;
  height: 24px;
  color: #2563eb;
}

.tCard__content {
  flex: 1;
  min-width: 0;
}

.tCard__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.tCard__title {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
  color: #0f172a;
}

.tCard__status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: capitalize;
  white-space: nowrap;
}

.tCard__status--draft {
  background: #fef3c7;
  color: #92400e;
}

.tCard__status--published {
  background: #d1fae5;
  color: #065f46;
}

.tCard__status--archived {
  background: #e2e8f0;
  color: #475569;
}

.tCard__status--inactive {
  background: #fee2e2;
  color: #991b1b;
}

.tCard__status--default {
  background: #f1f5f9;
  color: #64748b;
}

.tCard__desc {
  margin: 0 0 10px;
  font-size: 13px;
  color: #475569;
}

.tCard__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  font-size: 13px;
  color: #64748b;
}

.tCard__stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tCard__statIcon {
  width: 16px;
  height: 16px;
  color: #64748b;
  opacity: 0.75;
}

.tCard__statSmall {
  font-size: 12px;
  color: #64748b;
}

.tCard__moreBtn {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: all 0.15s ease;
}
.tCard__moreBtn svg {
  width: 20px;
  height: 20px;
}
.tCard__moreBtn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tCard__menuWrapper {
  position: relative;
}

.tCard__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  min-width: 180px;
  z-index: 100;
  padding: 6px 0;
}

.tCard__dropdownHeader {
  padding: 8px 14px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}

.tCard__dropdownItem {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.tCard__dropdownItem:hover {
  background: #f1f5f9;
}

.tCard__dropdownItem--active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.tCard__dropdownItem--active:hover {
  background: #dbeafe;
}

.tCard__dropdownIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}
.tCard__dropdownIcon svg {
  width: 16px;
  height: 16px;
}

.tCard__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
}

.tCard__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.tCard__modified {
  font-size: 12px;
  color: #64748b;
}

.tCard__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tBtn {
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}
.tBtn svg {
  flex-shrink: 0;
}

.tBtn--ghost {
  border-color: #cbd5e1;
  background: #fff;
  color: #334155;
}
.tBtn--ghost:hover {
  background: #f8fafc;
}

.tBtn--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}
.tBtn--primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}
.tBtn--primary:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.6;
}

.tBtn--danger {
  border-color: #dc2626;
  background: #fff;
  color: #dc2626;
}
.tBtn--danger:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .tCard {
    padding: 14px;
  }

  .tCard__top {
    flex-direction: column;
    gap: 10px;
  }

  .tCard__left {
    width: 100%;
  }

  .tCard__menuWrapper {
    position: absolute;
    top: 14px;
    right: 14px;
  }

  .tCard__iconWrap {
    width: 40px;
    height: 40px;
  }

  .tCard__icon {
    width: 20px;
    height: 20px;
  }

  .tCard__title {
    font-size: 15px;
  }

  .tCard__header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .tCard__stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tCard__footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .tCard__modified {
    text-align: center;
  }

  .tCard__actions {
    justify-content: center;
    width: 100%;
  }

  .tBtn {
    flex: 1;
    justify-content: center;
    padding: 10px 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .tCard__left {
    flex-direction: column;
    align-items: flex-start;
  }

  .tCard__content {
    width: 100%;
  }

  .tCard__actions {
    flex-direction: column;
  }

  .tBtn {
    width: 100%;
  }

  .tCard__dropdown {
    right: auto;
    left: 0;
  }
}
</style>
