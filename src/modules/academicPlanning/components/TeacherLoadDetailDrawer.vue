<template>
  <AppDrawer :isVisible="isVisible" size="md" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <AppDrawerHeader
        class="ms-2 pt-2"
        variant="view"
        icon="user-tie"
        :title="data?.teacherName || 'Detalle del docente'"
        :subtitle="data?.contractType || 'Consulta el resumen de carga y las asignaturas asociadas.'"
      >
        <template v-if="data" #meta>
          <AppBadge :label="statusLabel" :variant="statusVariant" />
        </template>
      </AppDrawerHeader>
    </template>

    <template #body>
      <div v-if="isLoading" class="teacherDrawer px-4 py-4 teacherDrawer__loading">
        <span class="text-muted">Cargando información del docente...</span>
      </div>

      <div v-else-if="data" class="teacherDrawer px-4 py-4">
        <!-- Estado / barra de carga -->
        <section class="teacherDrawer__status" :class="`teacherDrawer__status--${statusKey}`">
          <div class="teacherDrawer__statusHead">
            <div>
              <p class="teacherDrawer__eyebrow">Estado actual</p>
              <h4 class="teacherDrawer__headline">
                {{ data.loadSummary.statusLabel }}
              </h4>
            </div>
            <div class="teacherDrawer__percentage">{{ data.loadSummary.percentage }}%</div>
          </div>

          <p class="teacherDrawer__description">{{ data.loadSummary.availableHours }}h disponibles de {{ data.loadSummary.totalMaxHours }}h contratadas para este periodo.</p>

          <div class="teacherDrawer__progress">
            <div class="teacherDrawer__progressBar" :style="{ width: `${data.loadSummary.percentage}%` }"></div>
          </div>
        </section>

        <!-- Métricas -->
        <div class="row g-3 mt-1">
          <div class="col-12 col-sm-4">
            <AppCard>
              <template #title><div class="teacherDrawer__metricTitle">Horas asignadas</div></template>
              <template #body
                ><strong class="teacherDrawer__metricValue">{{ data.loadSummary.assignedHours }}h</strong></template
              >
            </AppCard>
          </div>

          <div class="col-12 col-sm-4">
            <AppCard>
              <template #title><div class="teacherDrawer__metricTitle">Horas disponibles</div></template>
              <template #body
                ><strong class="teacherDrawer__metricValue">{{ data.loadSummary.availableHours }}h</strong></template
              >
            </AppCard>
          </div>

          <div class="col-12 col-sm-4">
            <AppCard>
              <template #title><div class="teacherDrawer__metricTitle">Total de cursos</div></template>
              <template #body
                ><strong class="teacherDrawer__metricValue">{{ data.loadSummary.courseCount }}</strong></template
              >
            </AppCard>
          </div>
        </div>

        <!-- Asignaturas -->
        <AppCard class="mt-4">
          <template #title>
            <div class="teacherDrawer__sectionTitle">
              <AppIcon icon="book-open" class="me-2" />
              Asignaturas asignadas
            </div>
          </template>

          <template #body>
            <div v-if="data.assignedSubjects?.length" class="teacherDrawer__subjectList">
              <article v-for="(subject, index) in data.assignedSubjects" :key="`${subject.code}-${index}`" class="teacherDrawer__subjectCard">
                <div class="teacherDrawer__subjectHead">
                  <h5 class="teacherDrawer__subjectTitle">
                    {{ subject.name }}
                  </h5>
                  <span class="teacherDrawer__subjectHours">{{ subject.hours }}h</span>
                </div>
                <div class="teacherDrawer__subjectMeta">
                  <span v-if="subject.code">{{ subject.code }}</span>
                </div>
              </article>
            </div>

            <AppEmptyResponse v-else :show-image="false" title="Sin asignaciones actuales" subtitle="Este docente todavía no tiene asignaturas registradas para la vista actual." size="xs" />
          </template>
        </AppCard>
      </div>
    </template>

    <template #footer>
      <div class="teacherDrawer__footer">
        <AppButton variant="primary" @click="$emit('update:isVisible', false)">Cerrar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import { GetTeacherContractDetailService } from '../services/getTeacherContractDetail.service';

const getTeacherContractDetailService = new GetTeacherContractDetailService();

const resolveStatusKey = (statusLabel: string): 'disponible' | 'cercano' | 'completo' => {
  const normalized = statusLabel?.toLowerCase() ?? '';
  if (normalized.includes('normal') || normalized.includes('disponible')) return 'disponible';
  if (normalized.includes('cercano') || normalized.includes('límite') || normalized.includes('limite')) return 'cercano';
  if (normalized.includes('completo') || normalized.includes('lleno') || normalized.includes('máximo')) return 'completo';
  return 'disponible';
};

const STATUS_VARIANT_MAP: Record<string, string> = {
  disponible: 'success',
  cercano: 'warning',
  completo: 'danger',
};

export default defineComponent({
  name: 'TeacherLoadDetailDrawer',
  components: {
    AppBadge,
    AppButton,
    AppCard,
    AppDrawer,
    AppDrawerHeader,
    AppEmptyResponse,
    AppIcon,
  },
  props: {
    isVisible: { type: Boolean, default: false },
    userId: { type: Number as any, default: null },
    academicPeriodId: { type: Number as any, default: null },
  },
  emits: ['update:isVisible'],
  setup(props) {
    const data = ref<any>(null);
    const isLoading = ref(false);

    const statusKey = computed(() => resolveStatusKey(data.value?.loadSummary?.statusLabel ?? ''));
    const statusLabel = computed(() => data.value?.loadSummary?.statusLabel || '');
    const statusVariant = computed(() => STATUS_VARIANT_MAP[statusKey.value] ?? 'dark');

    const loadDetail = async () => {
      if (!props.userId || !props.academicPeriodId) {
        data.value = null;
        return;
      }

      isLoading.value = true;
      try {
        data.value = await getTeacherContractDetailService.run(props.userId, props.academicPeriodId);
      } catch (error) {
        console.log(error);
        data.value = null;
      } finally {
        isLoading.value = false;
      }
    };

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) void loadDetail();
        else data.value = null;
      }
    );

    return { data, isLoading, statusKey, statusLabel, statusVariant };
  },
});
</script>

<style scoped>
.teacherDrawer__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.teacherDrawer__status {
  border-radius: 20px;
  padding: 1.25rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.teacherDrawer__status--disponible {
  background: linear-gradient(135deg, #ecfdf3, #ffffff);
  border-color: #bbf7d0;
}

.teacherDrawer__status--cercano {
  background: linear-gradient(135deg, #fffbeb, #ffffff);
  border-color: #fde68a;
}

.teacherDrawer__status--completo {
  background: linear-gradient(135deg, #fef2f2, #ffffff);
  border-color: #fecaca;
}

.teacherDrawer__statusHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.teacherDrawer__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.teacherDrawer__headline {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}

.teacherDrawer__description {
  margin: 0.75rem 0 0;
  color: #475569;
}

.teacherDrawer__percentage {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--color-primary);
}

.teacherDrawer__progress {
  width: 100%;
  height: 0.7rem;
  background: rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  margin-top: 1rem;
  overflow: hidden;
}

.teacherDrawer__progressBar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.teacherDrawer__metricTitle {
  font-size: 0.9rem;
  color: #64748b;
}

.teacherDrawer__metricValue {
  font-size: 1.7rem;
  color: #0f172a;
}

.teacherDrawer__sectionTitle {
  display: flex;
  align-items: center;
  color: #0f172a;
}

.teacherDrawer__subjectList {
  display: grid;
  gap: 0.85rem;
}

.teacherDrawer__subjectCard {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 1rem;
}

.teacherDrawer__subjectHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.teacherDrawer__subjectTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.teacherDrawer__subjectHours {
  color: var(--color-primary);
  font-weight: 700;
}

.teacherDrawer__subjectMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.65rem;
  color: #64748b;
  font-size: 0.88rem;
}

.teacherDrawer__footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 576px) {
  .teacherDrawer__statusHead,
  .teacherDrawer__subjectHead {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
