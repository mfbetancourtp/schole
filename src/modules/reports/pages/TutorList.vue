<template>
  <AppLoading v-if="loading" />
  <BaseReport
    v-else
    :title="title"
    :service="service"
    :v$="v$"
    :routes="routes"
    :params="params"
  >
    <FilterAcademicPeriodWithLevels
      :academic-periods="filters.academicPeriods"
      :permission="permission"
      :v$="v$"
    />

    <div class="form-row">
      <FilterStudentClassification
        :options="filters.studentCategories"
        :v$="v$"
      />
    </div>

    <!-- Trigger del Drawer -->
    <div class="form-row mt-12">
      <AppButton @click="drawerOpen = true">
        Seleccionar campos de información
      </AppButton>
    </div>

    <!-- Resumen de selección (chips) -->
    <div
      class="selection-summary"
      v-if="selectedSectionsLabels.length || selectedOptionsLabels.length"
    >
      <div class="summary-block" v-if="selectedSectionsLabels.length">
        <div class="summary-head">
          <span class="summary-title">Secciones</span>
          <span class="summary-count">{{ selectedSectionsLabels.length }}</span>
        </div>
        <div class="chips">
          <button
            v-for="sec in selectedSectionsLabels"
            :key="sec.key"
            class="chip"
            @click="removeSection(sec.key)"
            :title="`Quitar ${sec.label}`"
          >
          
          {{ t(`reports.filters.${sec.label}`) }} <span aria-hidden>×</span>
          </button>
        </div>
      </div>

      <div
        class="divider"
        v-if="selectedSectionsLabels.length && selectedOptionsLabels.length"
      ></div>

      <div class="summary-block" v-if="selectedOptionsLabels.length">
        <div class="summary-head">
          <span class="summary-title">Opciones</span>
          <span class="summary-count">{{ selectedOptionsLabels.length }}</span>
        </div>
        <div class="chips">
          <button
            v-for="opt in selectedOptionsLabels"
            :key="opt.key"
            class="chip"
            @click="removeOption(opt.key)"
            :title="`Quitar ${opt.label}`"
          >
            {{ t(`reports.filters.${opt.label}`) }} <span aria-hidden>×</span>

          </button>
        </div>
      </div>
    </div>

    <!-- Drawer: secciones + opciones (staging) -->
    <FieldsOptionsDrawer
      v-model:isVisible="drawerOpen"
      :v$="v$"
      :sections="form.showFields"                
      :availableOptions="showResponseOptions"     
      :selectedOptionsMap="form.options"         
      title="Seleccionar campos de información"
      @sections-changed="onSectionsChanged"      
    />
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import BaseReport from '../components/BaseReport.vue';
import FilterStudentClassification from '../components/FilterStudentClassification.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import FieldsOptionsDrawer from '../components/FieldsOptionsDrawer.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import {
  GetFiltersTutorListService,
  IGetFiltersTutorListService,
} from '../services/filters/getFiltersTutorList.service';
import { GenerateReportTutorListService } from '../services/reports/generateReportTutorList.service';
import { GetOptionsRelatedDataTutorService } from '../services/reports/getOptionsRelatedDataTutor.service';
import { useHeaderStore } from '../../../stores/header.store';
import { useI18n } from 'vue-i18n';

const getFiltersTutorListService = new GetFiltersTutorListService();
const getOptionsRelatedDataTutor = new GetOptionsRelatedDataTutorService();

export default defineComponent({
  name: 'TutorList',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    AppLoading,
    BaseReport,
    AppButton,
    FieldsOptionsDrawer,
  },

  setup() {
    const { t } = useI18n();
    const title = 'reports.tutorList';
    const permission = 'reports.listings.tutorList';
    const routes: BreadCrumbsType[] = [
      { name: 'reports.name', url: { name: 'reports.list' } },
      { name: title },
    ];

    const service = new GenerateReportTutorListService();

    const loading = ref(true);
    const drawerOpen = ref(false);
    const showResponseOptions = ref<Record<string, boolean> | null>(null);

    const filters = ref<IGetFiltersTutorListService>({
      academicPeriods: [],
      studentCategories: [],
      options: {},
    });

    const form = reactive({
      academicPeriodId: null as number | null,
      levelId: null as number | null,
      degreeId: null as number | null,
      groupId: null as number | null,
      options: {} as Record<string, boolean>,     // estado comprometido (opciones)
      studentCategories: [] as number[],
      showFields: {} as Record<string, boolean>,  // estado comprometido (secciones)
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          studentCategories: {},
          options: {},
          showFields: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      studentCategoriesIds: form.studentCategories,
      options: form.options,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      const baseFilters = await getFiltersTutorListService.run();
      filters.value = baseFilters;

      // Inicializa secciones comprometidas con lo que venga de filtros
      form.showFields = { ...(filters.value.options || {}) };

      // Si quieres precargar opciones iniciales según secciones por defecto:
      await recomputeCommittedOptions();

      loading.value = false;
    });

    // ————— Utilidades —————
    const keyToLabel = (key: string) => key ? (key.includes('.') ? key.split('.').pop() : key) : key;

    // Recalcular opciones (estado comprometido) cuando cambian secciones comprometidas
    const recomputeCommittedOptions = async () => {
      const sectionSelect = Object.keys(form.showFields || {}).filter((k) => form.showFields[k]);
      const formatted = sectionSelect.map((s) => `"${s}"`);
      const resp = await getOptionsRelatedDataTutor.run({
        sectionSelect: `[${formatted.join(',')}]`,
      });
      showResponseOptions.value = resp.options || {};

      // Purga opciones comprometidas que ya no existan
      const valid = new Set(Object.keys(showResponseOptions.value || {}));
      const next: Record<string, boolean> = {};
      Object.keys(form.options || {}).forEach((k) => {
        if (valid.has(k)) next[k] = form.options[k];
      });
      // @ts-ignore
      v$.value.form.options.$model = next;
    };

    watch(
      () => form.showFields,
      async () => {
        try {
          await recomputeCommittedOptions();
        } catch (e) {
          console.log('Error al obtener opciones relacionadas:', e);
          showResponseOptions.value = {};
          // @ts-ignore
          v$.value.form.options.$model = {};
        }
      },
      { immediate: false, deep: true }
    );

    // Preview desde el Drawer (no compromete showFields)
    const onSectionsChanged = async (selectedKeys: string[]) => {
      try {
        const formatted = selectedKeys.map((s) => `"${s}"`);
        const resp = await getOptionsRelatedDataTutor.run({
          sectionSelect: `[${formatted.join(',')}]`,
        });
        showResponseOptions.value = resp.options || {};
      } catch (e) {
        console.log('Error preview de opciones:', e);
        showResponseOptions.value = {};
      }
    };

    // Chips
    const selectedSectionsLabels = computed(() =>
      Object.keys(form.showFields || {})
        .filter((k) => form.showFields[k])
        .map((key) => ({ key, label: key })) // si tienes i18n: usa tu t('reports.filters.'+key)
        .sort((a, b) => a.label.localeCompare(b.label))
    );

    const selectedOptionsLabels = computed(() =>
      Object.keys(form.options || {})
        .filter((k) => form.options[k])
        .map((key) => ({ key, label: key })) // si tienes i18n: usa tu t('reports.filters.'+key)
        .sort((a, b) => a.label.localeCompare(b.label))
    );

    const removeSection = (key: string) => {
      const next = { ...(form.showFields || {}) };
      if (next[key]) next[key] = false;
      // @ts-ignore
      v$.value.form.showFields.$model = next; // el drawer se sincroniza por props
    };

    const removeOption = (key: string) => {
      const next = { ...(form.options || {}) };
      if (next[key]) next[key] = false;
      // @ts-ignore
      v$.value.form.options.$model = next; // el drawer se sincroniza por props
    };

    return {
      // base
      title,
      t,
      permission,
      routes,
      service,
      loading,
      params,
      // estado
      filters,
      v$,
      form,
      // drawer
      drawerOpen,
      showResponseOptions,
      onSectionsChanged,
      // chips
      selectedSectionsLabels,
      selectedOptionsLabels,
      removeSection,
      removeOption,
    };
  },
});
</script>

<style scoped>
.mt-12{ margin-top:12px; }

/* Resumen con altura fija */
.selection-summary{
  margin-top:12px;
  margin-bottom:12px;
  background:#fff;
  border:1px solid rgba(145,158,171,.25);
  border-radius:12px;
  padding:12px;
  display:flex;
  flex-wrap:wrap;
  gap:12px;

  max-height:220px;
  overflow-y:auto;
}
.summary-block{ min-width:280px;flex:1 1 320px; }
.summary-head{ display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.summary-title{ font-weight:700; font-size:.95rem; color:#2e3135; }
.summary-count{
  background:#eef2ff; border:1px solid rgba(145,158,171,.25);
  border-radius:999px; padding:2px 8px; font-size:.8rem; color:#606a7a;
}
.divider{ width:1px; background:rgba(145,158,171,.25); align-self:stretch; }
.chips{ display:flex; flex-wrap:wrap; gap:8px; }
.chip{
  border:1px solid rgba(145,158,171,.25);
  background:#f7f8fa;
  padding:4px 8px;
  border-radius:999px;
  font-size:.85rem;
  cursor:pointer;
  transition: all .2s ease;
}
.chip:hover{ transform: translateY(-1px); box-shadow: 0 1px 6px rgba(0,0,0,.06); }
.chip span{ margin-left:6px; }
</style>
