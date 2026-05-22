<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="xxl">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead" v-if="agreement">
        <div class="drawerHead__icon">
          <AppIcon icon="handshake" />
        </div>
        <div class="drawerHead__info">
          <span class="drawerHead__title">{{ agreement.name }}</span>
          <span class="drawerHead__subtitle">{{ agreement.code }}</span>
        </div>
        <span class="statusPill" :class="statusClass(agreement.agreementStatus)">{{ agreement.agreementStatus }}</span>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="drawerBody" v-if="agreement">
        <!-- Mini stat cards -->
        <div class="miniCards">
          <!-- Cupos -->
          <div class="miniCard miniCard--blue">
            <div class="miniCard__top">
              <div class="miniCard__iconWrap miniCard__iconWrap--blue">
                <AppIcon icon="users" />
              </div>
              <span class="miniCard__label miniCard__label--blue">Cupos máximos</span>
            </div>
            <span class="miniCard__value">{{ agreement.maximumCapacity ?? '—' }}</span>
          </div>

          <!-- Vigencia -->
          <div class="miniCard miniCard--green">
            <div class="miniCard__top">
              <div class="miniCard__iconWrap miniCard__iconWrap--green">
                <AppIcon icon="calendar-alt" />
              </div>
              <span class="miniCard__label miniCard__label--green">Vigencia</span>
            </div>
            <span class="miniCard__value miniCard__value--date">{{ formatDate(agreement.starDay) }}</span>
            <span class="miniCard__sub miniCard__sub--green">hasta {{ formatDate(agreement.endDate) }}</span>
          </div>

          <!-- Institución aliada -->
          <div class="miniCard miniCard--orange">
            <div class="miniCard__top">
              <div class="miniCard__iconWrap miniCard__iconWrap--orange">
                <AppIcon icon="university" />
              </div>
              <span class="miniCard__label miniCard__label--orange">Institución aliada</span>
            </div>
            <span class="miniCard__value miniCard__value--institution">{{ agreement.institutionPartner }}</span>
          </div>

          <!-- Tipo -->
          <div class="miniCard miniCard--purple">
            <div class="miniCard__top">
              <div class="miniCard__iconWrap miniCard__iconWrap--purple">
                <AppIcon icon="handshake" />
              </div>
              <span class="miniCard__label miniCard__label--purple">Tipo de convenio</span>
            </div>
            <span class="miniCard__value miniCard__value--institution">{{ agreementTypeName }}</span>
          </div>
        </div>

        <!-- Información general -->
        <div class="detailCard">
          <div class="detailCard__header">
            <div class="detailCard__headerIcon detailCard__headerIcon--green">
              <AppIcon icon="info-circle" />
            </div>
            <span class="detailCard__headerTitle">Información General</span>
          </div>
          <div class="detailCard__body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="infoField">
                  <span class="infoField__label">Código</span>
                  <span class="infoField__value infoField__value--code">{{ agreement.code }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="infoField">
                  <span class="infoField__label">Institución aliada</span>
                  <span class="infoField__value">{{ agreement.institutionPartner }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="infoField">
                  <span class="infoField__label">Fecha de inicio</span>
                  <span class="infoField__value">{{ formatDate(agreement.starDay) }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="infoField">
                  <span class="infoField__label">Fecha de fin</span>
                  <span class="infoField__value">{{ formatDate(agreement.endDate) }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="infoField">
                  <span class="infoField__label">Capacidad máxima</span>
                  <span class="infoField__value">{{ agreement.maximumCapacity ?? '—' }}</span>
                </div>
              </div>
              <div class="col-12" v-if="agreement.descriptionPublic">
                <hr class="infoFieldDivider" />
                <div class="infoField mt-3">
                  <span class="infoField__label">Descripción pública</span>
                  <div class="descriptionBox">
                    {{ agreement.descriptionPublic }}
                  </div>
                </div>
              </div>
              <div class="col-12" v-if="agreement.comments">
                <div class="infoField">
                  <span class="infoField__label">Comentarios internos</span>
                  <div class="descriptionBox">{{ agreement.comments }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alcance académico -->
        <div class="detailCard">
          <div class="detailCard__header">
            <div class="detailCard__headerIcon detailCard__headerIcon--purple">
              <AppIcon icon="graduation-cap" />
            </div>
            <span class="detailCard__headerTitle">Alcance Académico</span>
          </div>
          <div class="detailCard__body">
            <div class="row g-3">
              <div class="col-md-4" v-if="agreement.minimumSemester">
                <div class="infoField">
                  <span class="infoField__label">Semestre mínimo</span>
                  <span class="infoField__value">{{ agreement.minimumSemester }}°</span>
                </div>
              </div>
              <div class="col-md-4" v-if="agreement.maximumSemester">
                <div class="infoField">
                  <span class="infoField__label">Semestre máximo</span>
                  <span class="infoField__value">{{ agreement.maximumSemester }}°</span>
                </div>
              </div>
              <div class="col-md-4" v-if="agreement.maximumAverage">
                <div class="infoField">
                  <span class="infoField__label">Promedio máximo requerido</span>
                  <span class="infoField__value">{{ agreement.maximumAverage }}</span>
                </div>
              </div>
              <div class="col-12">
                <div class="infoField">
                  <span class="infoField__label">Condiciones adicionales</span>
                  <div class="conditionsList">
                    <span class="conditionBadge" :class="agreement.requiresEnrollment ? 'conditionBadge--yes' : 'conditionBadge--no'">
                      <AppIcon :icon="agreement.requiresEnrollment ? 'check' : 'times'" />
                      Matriculado en periodo actual
                    </span>
                    <span class="conditionBadge" :class="agreement.requiresNoDisciplinary ? 'conditionBadge--yes' : 'conditionBadge--no'">
                      <AppIcon :icon="agreement.requiresNoDisciplinary ? 'check' : 'times'" />
                      Sin sanciones disciplinarias
                    </span>
                    <span class="conditionBadge" :class="agreement.requiresNoBlocks ? 'conditionBadge--yes' : 'conditionBadge--no'">
                      <AppIcon :icon="agreement.requiresNoBlocks ? 'check' : 'times'" />
                      Sin bloqueos administrativos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documentos requeridos -->
        <div class="detailCard" v-if="agreement.documents && agreement.documents.length">
          <div class="detailCard__header">
            <div class="detailCard__headerIcon detailCard__headerIcon--teal">
              <AppIcon icon="paperclip" />
            </div>
            <span class="detailCard__headerTitle">Documentos Requeridos</span>
          </div>
          <div class="detailCard__body">
            <div class="requirementsList">
              <div class="requirementItem" v-for="doc in agreement.documents" :key="doc.id ?? doc.name">
                <div class="requirementItem__iconWrap">
                  <AppIcon icon="file-alt" />
                </div>
                <span class="requirementItem__name">{{ doc.name }}</span>
                <span class="reqBadge" :class="doc.required ? 'reqBadge--required' : 'reqBadge--optional'">
                  {{ doc.required ? 'Obligatorio' : 'Opcional' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawerFooter">
        <AppButton outlined @click="$emit('update:isVisible', false)"> Cerrar </AppButton>
        <AppButton variant="primary" @click="onEdit">
          <AppIcon icon="pencil-alt" />
          Editar
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { InstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';

export default defineComponent({
  name: 'AgreementDetailDrawer',
  components: { AppDrawer, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, required: true },
    agreement: {
      type: Object as PropType<InstitutionalAgreementDto | null>,
      default: null,
    },
    agreementTypes: {
      type: Array as PropType<{ id: number; name: string }[]>,
      default: () => [],
    },
  },
  emits: ['update:isVisible', 'edit'],
  setup(props, { emit }) {
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '—';
      const datePart = dateStr.substring(0, 10);
      const [year, month, day] = datePart.split('-');
      if (!year || !month || !day) return '—';
      return `${parseInt(day)}/${parseInt(month)}/${year}`;
    };

    const statusClass = (status: string | undefined): string => {
      const map: Record<string, string> = {
        Activo: 'statusPill--active',
        Borrador: 'statusPill--draft',
        Finalizado: 'statusPill--finished',
        Cerrado: 'statusPill--closed',
      };
      return map[status ?? ''] ?? '';
    };

    const agreementTypeName = computed(() => {
      if (props.agreement?.agreementsType?.name) return props.agreement.agreementsType.name;
      const found = props.agreementTypes.find((t) => t.id === props.agreement?.agreementsTypesId);
      return found?.name ?? '—';
    });

    const onEdit = () => {
      emit('edit', props.agreement);
      emit('update:isVisible', false);
    };

    return {
      formatDate,
      statusClass,
      onEdit,
      agreementTypeName,
    };
  },
});
</script>

<style scoped>
.drawerHead {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.drawerHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
  flex-shrink: 0;
}

.drawerHead__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.drawerHead__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawerHead__subtitle {
  font-size: 0.83rem;
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
  letter-spacing: 0.03em;
}

.statusPill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.statusPill--active {
  background: #dcfce7;
  color: #16a34a;
}
.statusPill--draft {
  background: #fef3c7;
  color: #d97706;
}
.statusPill--finished {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.statusPill--closed {
  background: #fee2e2;
  color: #dc2626;
}

.drawerBody {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.miniCards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .miniCards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .miniCards {
    grid-template-columns: 1fr;
  }
}

.miniCard {
  border-radius: 12px;
  padding: 1rem 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 1.5px solid transparent;
}

.miniCard--blue {
  background: #eff6ff;
  border-color: #93c5fd;
}
.miniCard--purple {
  background: #f5f3ff;
  border-color: #c4b5fd;
}
.miniCard--green {
  background: #f0fdf4;
  border-color: #86efac;
}
.miniCard--orange {
  background: #fff7ed;
  border-color: #fdba74;
}

.miniCard__top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.miniCard__iconWrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.miniCard__iconWrap--blue {
  background: #dbeafe;
  color: #2563eb;
}
.miniCard__iconWrap--purple {
  background: #ede9fe;
  color: #7c3aed;
}
.miniCard__iconWrap--green {
  background: #dcfce7;
  color: #15803d;
}
.miniCard__iconWrap--orange {
  background: #fed7aa;
  color: #c2410c;
}

.miniCard__label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.miniCard__label--blue {
  color: #2563eb;
}
.miniCard__label--purple {
  color: #7c3aed;
}
.miniCard__label--green {
  color: #15803d;
}
.miniCard__label--orange {
  color: #c2410c;
}

.miniCard__value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
}
.miniCard__value--date,
.miniCard__value--institution {
  font-size: 1rem;
  font-weight: 700;
}

.miniCard__sub {
  font-size: 0.73rem;
  font-weight: 500;
}
.miniCard__sub--green {
  color: #16a34a;
}

.detailCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.detailCard__header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 1.1rem;
}

.detailCard__headerIcon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.detailCard__headerIcon--green {
  background: #f0fdf4;
  color: #15803d;
}
.detailCard__headerIcon--purple {
  background: #faf5ff;
  color: #7c3aed;
}
.detailCard__headerIcon--orange {
  background: #fff7ed;
  color: #c2410c;
}
.detailCard__headerIcon--teal {
  background: #f0fdfa;
  color: #0d9488;
}

.detailCard__headerTitle {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
}

.detailCard__body {
  padding: 1rem 1.1rem 1.1rem;
  border-top: 1px solid #f3f4f6;
}

.infoField {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.infoField__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.infoField__value {
  font-size: 0.9rem;
  color: #111827;
  font-weight: 500;
}
.infoField__value--code {
  font-family: monospace;
  color: var(--color-primary);
  font-weight: 700;
}

.infoFieldDivider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0.25rem 0 0;
}

.descriptionBox {
  background: rgba(var(--color-primary-rgb), 0.08);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.88rem;
  color: #374151;
  line-height: 1.6;
}

.conditionsList {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.conditionBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1.5px solid transparent;
}

.conditionBadge--yes {
  background: #dcfce7;
  color: #16a34a;
  border-color: #86efac;
}
.conditionBadge--no {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.requirementsList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirementItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.requirementItem__iconWrap {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: #fff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.requirementItem__name {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 500;
  color: #374151;
}

.reqBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.reqBadge--required {
  background: #fee2e2;
  color: #dc2626;
}
.reqBadge--optional {
  background: #f3f4f6;
  color: #6b7280;
}

.drawerFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.25rem;
}
</style>
