<template>
  <AppLoading v-if="loading" />
  <BaseReport v-else :title="title" :v$="v$" :service="service" :params="params">
    <FilterAcademicPeriodWithLevels
      :v$="v$"
      :academic-periods="filters.academicPeriods"
      :permission="permission"
    />

    <div class="form-row mt-12">
      <AppButton @click="drawerOpen = true">Seleccionar campos de información</AppButton>
    </div>

    <!-- Resumen de selección (chips) -->
    <div class="selection-summary" v-if="selectedSectionsLabels.length || selectedOptionsLabels.length">
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
            {{ sec.label }} <span aria-hidden>×</span>
          </button>
        </div>
      </div>

      <div class="divider" v-if="selectedSectionsLabels.length && selectedOptionsLabels.length"></div>

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
            {{ opt.label }} <span aria-hidden>×</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer: edición temporal -->
    <FieldsOptionsDrawer
      v-model:isVisible="drawerOpen"
      :v$="v$"
      :sections="form.showFields"                 
      :availableOptions="showResponseOptions"     
      :selectedOptionsMap="form.options"          
      :loadingOptions="loadingOptions"
      title="Seleccionar campos de información"
      @sections-changed="onSectionsChanged"
    />
  </BaseReport>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import BaseReport from '../components/BaseReport.vue';
import FilterAcademicPeriodWithLevels from '../components/FilterAcademicPeriodWithLevels.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import FieldsOptionsDrawer from '../components/FieldsOptionsDrawer.vue';

import { GetFiltersStudentsByLevelService } from '../services/filters/getFiltersStudentsByLevel.service';
import { GenerateReportStudentsByLevelService } from '../services/reports/generateReportStudentsByLevel.service';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { GetOptionsRelatedDataService } from '../services/reports/getOptionsRelatedData.service';
import { useI18n } from 'vue-i18n';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersStudentsByLevelService = new GetFiltersStudentsByLevelService();
const getOptionsRelatedDataService = new GetOptionsRelatedDataService();

export default defineComponent({
  name: 'StudentsByLevel',
  components: {
    BaseReport,
    AppLoading,
    FilterAcademicPeriodWithLevels,
    AppButton,
    FieldsOptionsDrawer,
  },
  setup() {
    const { t } = useI18n();
    const title = 'reports.studentsByLevel';
    const permission = 'reports.listings.studentsByLevel';

    const service = new GenerateReportStudentsByLevelService();
    const loading = ref(true);
    const drawerOpen = ref(false);
    const loadingOptions = ref(false);

    const showResponseOptions = ref<Record<string, boolean> | null>(null);

    const filters = ref({
      academicPeriods: [] as any[],
      sections: {} as Record<string, boolean>,
    });

    const form = reactive({
      academicPeriodId: null as number | null,
      levelId: null as number | null,
      degreeId: null as number | null,
      groupId: null as number | null,
      studentCategoriesIds: [] as number[],
      showFields: {} as Record<string, boolean>,   // estado comprometido (secciones)
      options: {} as Record<string, boolean>,      // estado comprometido (opciones)
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          options: {},
          showFields: {},
          studentCategoriesIds: {},
        },
      },
      { form }
    );

    const params = computed(() => ({
      academicPeriodId: form.academicPeriodId,
      levelId: form.levelId,
      degreeId: form.degreeId,
      groupId: form.groupId,
      options: { ...form.options },
      convertTo: 'xls',
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      const baseFilters = await getFiltersStudentsByLevelService.run();
      filters.value = baseFilters;

      // Inicializa secciones comprometidas
      form.showFields = { ...filters.value.sections };

      loading.value = false;
    });

    const keyToLabel = (key: string) => t(`reports.filters.${key}`, key);

    // Cuando cambian secciones comprometidas => recalcula opciones disponibles
    watch(
      () => form.showFields,
      async (newShowFields) => {
        try {
          const sectionSelect = Object.keys(newShowFields).filter((k) => newShowFields[k]);
          loadingOptions.value = true;

          const formatted = sectionSelect.map((s) => `"${s}"`);
          const resp = await getOptionsRelatedDataService.run({
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
        } catch (e) {
          console.log('Error al obtener opciones relacionadas:', e);
          showResponseOptions.value = {};
          // @ts-ignore
          v$.value.form.options.$model = {};
        } finally {
          loadingOptions.value = false;
        }
      },
      { immediate: true, deep: true }
    );

    // Desde el drawer (secciones temporales) -> actualiza secciones comprometidas
// Desde el drawer (secciones temporales) -> SOLO refresca opciones disponibles (preview)
// NO compromete form.showFields hasta "Aplicar"
const onSectionsChanged = async (selectedKeys: string[]) => {
  try {
    loadingOptions.value = true;
    const formatted = selectedKeys.map((s) => `"${s}"`);
    const resp = await getOptionsRelatedDataService.run({
      sectionSelect: `[${formatted.join(',')}]`,
    });
    showResponseOptions.value = resp.options || {};

    // (Opcional) Si alguna opción seleccionada comprometida ya no existe en el preview,
    // NO la borres aquí: se mantiene hasta que el usuario aplique cambios.
    // Así el modal es un "preview" real y el estado comprometido no se ve afectado.
  } catch (e) {
    console.log('Error al obtener opciones relacionadas:', e);
    showResponseOptions.value = {};
  } finally {
    loadingOptions.value = false;
  }
};


    /* Chips: listas y quitar */
    const selectedSectionsLabels = computed(() =>
      Object.keys(form.showFields || {})
        .filter((k) => form.showFields[k])
        .map((key) => ({ key, label: keyToLabel(key) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );

    const selectedOptionsLabels = computed(() =>
      Object.keys(form.options || {})
        .filter((k) => form.options[k])
        .map((key) => ({ key, label: keyToLabel(key) }))
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
      title,
      form,
      permission,
      service,
      loading,
      filters,
      v$,
      params,
      drawerOpen,
      loadingOptions,
      showResponseOptions,
      onSectionsChanged,
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
.selection-summary {
  margin-top: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid rgba(145,158,171,.25);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  /* 👇 Nuevo: limitar altura y scroll */
  max-height: 220px;      /* ajusta según prefieras */
  overflow-y: auto;
}

.summary-block{ min-width:280px;flex:1 1 320px; }
.summary-head{ display:flex;align-items:center;gap:8px;margin-bottom:8px; }
.summary-title{ font-weight:700;font-size:.95rem;color:#2e3135; }
.summary-count{ background:#eef2ff;border:1px solid rgba(145,158,171,.25);
  border-radius:999px;padding:2px 8px;font-size:.8rem;color:#606a7a}
.divider{ width:1px;background:rgba(145,158,171,.25);align-self:stretch;}
.chips{ display:flex;flex-wrap:wrap;gap:8px;}
.chip{ border:1px solid rgba(145,158,171,.25);background:#f7f8fa;padding:4px 8px;
  border-radius:999px;font-size:.85rem;cursor:pointer;transition:.2s;}
.chip:hover{ transform:translateY(-1px); box-shadow:0 1px 6px rgba(0,0,0,.06)}
.chip span{ margin-left:6px;}

.summary-block .chips {
  max-height: 150px;
  overflow-y: auto;
}

</style>
