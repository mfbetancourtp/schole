<template>
  <div class="modality-step">
    <div class="step-section">
      <h4 class="step-section__title">{{ t('Modalidad') }}</h4>
      <p class="step-section__subtitle">
        {{ t('Seleccione el tipo de trabajo de grado que desea realizar') }}
      </p>
    </div>

    <!-- Search -->
    <div class="modality-step__search">
      <AppInput v-model="search" :placeholder="t('Buscar modalidad...')" icon="search" @input="onSearch" />
    </div>

    <AppLoading v-if="loading" />

    <div v-else-if="options.length" class="modality-grid">
      <div v-for="opt in options" :key="opt.id" class="mcard" :class="{ 'mcard--active': scheduleSettingsId === opt.id }" @click="selectModality(opt.id)">
        <!-- Colored header -->
        <div class="mcard__header" :style="{ backgroundColor: headerBg(opt.color) }">
          <div class="mcard__icon-wrap" :style="{ backgroundColor: iconBg(opt.color), color: opt.color }">
            <AppIcon :icon="opt.icon" />
          </div>
          <div class="mcard__header-text">
            <h4 class="mcard__name" :style="{ color: opt.color }">
              {{ opt.name }}
            </h4>
          </div>
          <div class="mcard__radio">
            <span class="radio-dot" :class="{ 'radio-dot--checked': scheduleSettingsId === opt.id }" :style="scheduleSettingsId === opt.id ? { borderColor: opt.color } : {}">
              <span v-if="scheduleSettingsId === opt.id" class="radio-dot__fill" :style="{ backgroundColor: opt.color }"></span>
            </span>
          </div>
        </div>

        <!-- Description (full, no ellipsis) -->
        <div class="mcard__body">
          <p class="mcard__description">{{ opt.description }}</p>
          <div class="mcard__meta">
            <AppIcon icon="list-alt" />
            <span>{{ opt.totalMilestones }} {{ t('hitos') }}</span>
            <span class="mcard__sep">·</span>
            <AppIcon icon="clock" />
            <span>{{ opt.maxApprovalDeadline }} {{ t('días') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="modality-step__empty">
      <AppIcon icon="search" class="modality-step__empty-icon" />
      <p>{{ t('No se encontraron modalidades') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pageCount > 1" class="modality-step__pagination">
      <AppButton variant="ghost" icon="chevron-left" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)" />
      <span class="modality-step__page-info">{{ pagination.page }} / {{ pagination.pageCount }}</span>
      <AppButton variant="ghost" icon="chevron-right" :disabled="pagination.page >= pagination.pageCount" @click="changePage(pagination.page + 1)" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import type { PostulationFormData } from '../dtos/postulation.dto';
import type { ScheduleSettingDto } from '../dtos/scheduleConfig.dto';
import { GetScheduleSettingsService } from '../services/getScheduleSettings.service';

function hexToRgba(hex: string, alpha: number): string {
  const c = (hex || '#1b55e2').replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) || 27;
  const g = parseInt(c.slice(2, 4), 16) || 85;
  const b = parseInt(c.slice(4, 6), 16) || 226;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default defineComponent({
  name: 'ModalityStep',
  components: { AppIcon, AppInput, AppButton, AppLoading },
  props: {
    form: {
      type: Object as PropType<PostulationFormData>,
      required: true,
    },
  },
  emits: ['update:form'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const loading = ref(false);
    const search = ref('');
    const options = ref<ScheduleSettingDto[]>([]);
    const pagination = reactive({ page: 1, pageCount: 1 });

    const scheduleSettingsId = computed({
      get: () => props.form.scheduleSettingsId,
      set: (v: number | null) => emit('update:form', { ...props.form, scheduleSettingsId: v }),
    });

    const headerBg = (color: string) => hexToRgba(color, 0.07);
    const iconBg = (color: string) => hexToRgba(color, 0.12);

    const selectModality = (id: number) => {
      scheduleSettingsId.value = id;
    };

    const loadOptions = async (page = 1) => {
      loading.value = true;
      try {
        const result = await new GetScheduleSettingsService().run({
          page,
          perPage: 10,
          search: search.value || undefined,
        });
        options.value = result.data ?? [];
        pagination.page = result.pagination?.page ?? page;
        pagination.pageCount = result.pagination?.pageCount ?? 1;
      } finally {
        loading.value = false;
      }
    };

    let searchTimer: ReturnType<typeof setTimeout>;
    const onSearch = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadOptions(1), 350);
    };

    const changePage = (page: number) => loadOptions(page);

    onMounted(() => loadOptions());

    return {
      t,
      loading,
      search,
      options,
      pagination,
      scheduleSettingsId,
      headerBg,
      iconBg,
      selectModality,
      onSearch,
      changePage,
    };
  },
});
</script>

<style scoped>
.step-section {
  margin-bottom: 16px;
}

.step-section__title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #212b36;
  margin-bottom: 4px;
}

.step-section__subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.modality-step__search {
  margin-bottom: 16px;
}

/* Grid with subgrid for equal header heights */
.modality-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 16px;
  row-gap: 16px;
}

.mcard {
  border: 2px solid #e4e7ec;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 2;
  row-gap: 0;
}

.mcard:hover {
  border-color: #919eab;
}

.mcard--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 27, 85, 226), 0.12);
}

.mcard__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(145, 158, 171, 0.16);
}

.mcard__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.mcard__header-text {
  flex: 1;
  min-width: 0;
}

.mcard__name {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.mcard__radio {
  flex-shrink: 0;
}

.radio-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e4e7ec;
}

.radio-dot--checked {
  border-width: 2px;
}

.radio-dot__fill {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mcard__body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mcard__description {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  line-height: 1.6;
  margin: 0;
}

.mcard__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.mcard__sep {
  color: #d0d5dd;
}

/* Pagination */
.modality-step__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.modality-step__page-info {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
}

/* Empty */
.modality-step__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: #919eab;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}

.modality-step__empty-icon {
  font-size: 28px;
}

@media (max-width: 576px) {
  .modality-grid {
    grid-template-columns: 1fr;
  }
}
</style>
