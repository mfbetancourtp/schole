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

    <FilterStudentClassification
      :options="filters.studentCategories"
      :v$="v$"
    />

    <!-- Acciones -->
    <div class="form-row gap-8 mt-12">
      <AppButton @click="drawerStudentOpen = true">
        Seleccionar campos (Estudiante)
      </AppButton>
      <AppButton outlined @click="drawerTutorOpen = true">
        Seleccionar campos (Tutor)
      </AppButton>
    </div>

    <!-- Resumen con altura fija -->
    <div class="selection-summary" v-if="hasAnyChip">
      <!-- Estudiante -->
      <div class="summary-block" v-if="studentSectionsLabels.length || studentOptionsLabels.length">
        <div class="summary-head">
          <span class="summary-title">Estudiante</span>
          <span class="summary-count">{{ studentSectionsLabels.length + studentOptionsLabels.length }}</span>
        </div>

        <div class="mini-block" v-if="studentSectionsLabels.length">
          <div class="mini-title">Secciones</div>
          <div class="chips">
            <button
              v-for="sec in studentSectionsLabels"
              :key="sec.key"
              class="chip"
              @click="removeStudentSection(sec.key)"
              :title="`Quitar ${sec.label}`"
            >
              {{ t(`reports.filters.${sec.label}`) }} <span aria-hidden>×</span>
            </button>
          </div>
        </div>

        <div class="mini-block" v-if="studentOptionsLabels.length">
          <div class="mini-title">Opciones</div>
          <div class="chips">
            <button
              v-for="opt in studentOptionsLabels"
              :key="opt.key"
              class="chip"
              @click="removeStudentOption(opt.key)"
              :title="`Quitar ${opt.label}`"
            >
              {{ t(`reports.filters.${opt.label}`) }} <span aria-hidden>×</span>
            </button>
          </div>
        </div>
      </div>

      <div class="divider" v-if="showTutorSummary && showStudentSummary"></div>

      <!-- Tutor -->
      <div class="summary-block" v-if="tutorSectionsLabels.length || tutorOptionsLabels.length">
        <div class="summary-head">
          <span class="summary-title">Tutor</span>
          <span class="summary-count">{{ tutorSectionsLabels.length + tutorOptionsLabels.length }}</span>
        </div>

        <div class="mini-block" v-if="tutorSectionsLabels.length">
          <div class="mini-title">Secciones</div>
          <div class="chips">
            <button
              v-for="sec in tutorSectionsLabels"
              :key="sec.key"
              class="chip"
              @click="removeTutorSection(sec.key)"
              :title="`Quitar ${sec.label}`"
            >
              {{ t(`reports.filters.${sec.label}`) }} <span aria-hidden>×</span>
            </button>
          </div>
        </div>

        <div class="mini-block" v-if="tutorOptionsLabels.length">
          <div class="mini-title">Opciones</div>
          <div class="chips">
            <button
              v-for="opt in tutorOptionsLabels"
              :key="opt.key"
              class="chip"
              @click="removeTutorOption(opt.key)"
              :title="`Quitar ${opt.label}`"
            >
              {{ t(`reports.filters.${opt.label}`) }} <span aria-hidden>×</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer ESTUDIANTE (preview + aplicar) -->
    <FieldsOptionsDrawer
      v-model:isVisible="drawerStudentOpen"
      :v$="v$"
      :sections="form.showFieldsStudent"              
      :availableOptions="showResponseOptionsStudent"  
      :selectedOptionsMap="form.optionsStudent"       
      scope="student"
      title="Seleccionar campos (Estudiante)"
      @sections-changed="onSectionsChangedStudent"  
    />

    <!-- Drawer TUTOR (preview + aplicar) -->
    <FieldsOptionsDrawer
      v-model:isVisible="drawerTutorOpen"
      :v$="v$"
      :sections="form.showFieldsTutor"
      :availableOptions="showResponseOptionsTutor"
      :selectedOptionsMap="form.optionsTutor"
      scope="tutor"
      title="Seleccionar campos (Tutor)"
      @sections-changed="onSectionsChangedTutor"
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
  GetFiltersTutorWithStudentsListService,
  IGetFiltersTutorWithStudentsListService,
} from '../services/filters/getFiltersTutorWithStudentsList.service';
import { GenerateReportTutorWithStudentsListService } from '../services/reports/generateReportTutorWithStudentsList.serviceNew';
import { GetOptionsRelatedDataTutorService } from '../services/reports/getOptionsRelatedDataTutor.service';
import { GetOptionsRelatedDataService } from '../services/reports/getOptionsRelatedData.service';
import { useHeaderStore } from '../../../stores/header.store';
import { useI18n } from 'vue-i18n';

const getFiltersTutorWithStudentsListService = new GetFiltersTutorWithStudentsListService();
const getOptionsRelatedDataTutor = new GetOptionsRelatedDataTutorService();
const getOptionsRelatedDataService = new GetOptionsRelatedDataService();

export default defineComponent({
  name: 'TutorWithStudents',
  components: {
    FilterAcademicPeriodWithLevels,
    FilterStudentClassification,
    AppLoading,
    BaseReport,
    AppButton,
    FieldsOptionsDrawer,
  },

  setup() {
    const title = 'reports.tutorWithStudentsListNew';
    const permission = 'reports.listings.tutorWithStudentsListNew';
    const routes: BreadCrumbsType[] = [
      { name: 'reports.name', url: { name: 'reports.list' } },
      { name: title },
    ];
    const { t } = useI18n();
    const service = new GenerateReportTutorWithStudentsListService();

    const loading = ref(true);

    // Drawers
    const drawerStudentOpen = ref(false);
    const drawerTutorOpen = ref(false);

    // Opciones (preview en drawer)
    const showResponseOptionsTutor = ref<Record<string, boolean> | null>(null);
    const showResponseOptionsStudent = ref<Record<string, boolean> | null>(null);

    const filters = ref<IGetFiltersTutorWithStudentsListService>({
      academicPeriods: [],
      studentCategories: [],
      optionsStudent: {},
      optionsTutor: {},
    });

    // Estado comprometido del formulario
    const form = reactive({
      academicPeriodId: null as number | null,
      levelId: null as number | null,
      degreeId: null as number | null,
      groupId: null as number | null,
      studentCategories: [] as number[],

      // IMPORTANTE: como mapa (no como array) para { clave: boolean }
      showFieldsStudent: {} as Record<string, boolean>,
      showFieldsTutor: {} as Record<string, boolean>,
      optionsStudent: {} as Record<string, boolean>,
      optionsTutor: {} as Record<string, boolean>,
    });

    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          levelId: { required },
          degreeId: {},
          groupId: {},
          studentCategories: {},
          showFieldsStudent: {},
          showFieldsTutor: {},
          optionsStudent: {},
          optionsTutor: {},
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
      optionsStudent: form.optionsStudent,
      optionsTutor: form.optionsTutor,
    }));

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Home', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      const baseFilters = await getFiltersTutorWithStudentsListService.run();
      filters.value = baseFilters;

      // Inicializa secciones comprometidas con lo que venga desde filtros (si tu API ya marca defaults)
      // O deja objetos vacíos si prefieres empezar sin selecciones.
      form.showFieldsStudent = { ...(filters.value.optionsStudent || {}) };
      form.showFieldsTutor = { ...(filters.value.optionsTutor || {}) };

      loading.value = false;
    });

    /* ——— PREVIEW en el drawer (NO compromete el form hasta aplicar) ——— */
    const onSectionsChangedStudent = async (selectedKeys: string[]) => {
      try {
        const formatted = selectedKeys.map((s) => `"${s}"`);
        const resp = await getOptionsRelatedDataService.run({
          sectionSelect: `[${formatted.join(',')}]`,
        });
        showResponseOptionsStudent.value = resp.options || {};
      } catch (e) {
        console.log('Error preview opciones estudiante:', e);
        showResponseOptionsStudent.value = {};
      }
    };

    const onSectionsChangedTutor = async (selectedKeys: string[]) => {
      try {
        const formatted = selectedKeys.map((s) => `"${s}"`);
        const resp = await getOptionsRelatedDataTutor.run({
          sectionSelect: `[${formatted.join(',')}]`,
        });
        showResponseOptionsTutor.value = resp.options || {};
      } catch (e) {
        console.log('Error preview opciones tutor:', e);
        showResponseOptionsTutor.value = {};
      }
    };

    /* ——— Recalcular opciones comprometidas cuando cambian secciones comprometidas ——— */
    watch(
      () => form.showFieldsStudent,
      async (newMap) => {
        try {
          const active = Object.keys(newMap || {}).filter((k) => newMap[k]);
          const formatted = active.map((s) => `"${s}"`);
          const res = await getOptionsRelatedDataService.run({
            sectionSelect: `[${formatted.join(',')}]`,
          });
          showResponseOptionsStudent.value = res.options || {};
          // Purga opciones comprometidas que ya no existan
          const valid = new Set(Object.keys(showResponseOptionsStudent.value || {}));
          const next: Record<string, boolean> = {};
          Object.keys(form.optionsStudent || {}).forEach((k) => {
            if (valid.has(k)) next[k] = form.optionsStudent[k];
          });
          // @ts-ignore
          v$.value.form.optionsStudent.$model = next;
        } catch (e) {
          console.log('Error recalculando opciones estudiante:', e);
          showResponseOptionsStudent.value = {};
          // @ts-ignore
          v$.value.form.optionsStudent.$model = {};
        }
      },
      { deep: true }
    );

    watch(
      () => form.showFieldsTutor,
      async (newMap) => {
        try {
          const active = Object.keys(newMap || {}).filter((k) => newMap[k]);
          const formatted = active.map((s) => `"${s}"`);
          const res = await getOptionsRelatedDataTutor.run({
            sectionSelect: `[${formatted.join(',')}]`,
          });
          showResponseOptionsTutor.value = res.options || {};
          // Purga opciones comprometidas que ya no existan
          const valid = new Set(Object.keys(showResponseOptionsTutor.value || {}));
          const next: Record<string, boolean> = {};
          Object.keys(form.optionsTutor || {}).forEach((k) => {
            if (valid.has(k)) next[k] = form.optionsTutor[k];
          });
          // @ts-ignore
          v$.value.form.optionsTutor.$model = next;
        } catch (e) {
          console.log('Error recalculando opciones tutor:', e);
          showResponseOptionsTutor.value = {};
          // @ts-ignore
          v$.value.form.optionsTutor.$model = {};
        }
      },
      { deep: true }
    );

    /* ——— Chips (labels + remover) ——— */
    const keyToLabel = (key: string) => key; // si usas i18n: t(`reports.filters.${key}`, key)

    const studentSectionsLabels = computed(() =>
      Object.keys(form.showFieldsStudent || {})
        .filter((k) => form.showFieldsStudent[k])
        .map((key) => ({ key, label: keyToLabel(key) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
    const studentOptionsLabels = computed(() =>
      Object.keys(form.optionsStudent || {})
        .filter((k) => form.optionsStudent[k])
        .map((key) => ({ key, label: keyToLabel(key) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );

    const tutorSectionsLabels = computed(() =>
      Object.keys(form.showFieldsTutor || {})
        .filter((k) => form.showFieldsTutor[k])
        .map((key) => ({ key, label: keyToLabel(key) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
    const tutorOptionsLabels = computed(() =>
      Object.keys(form.optionsTutor || {})
        .filter((k) => form.optionsTutor[k])
        .map((key) => ({ key, label: keyToLabel(key) }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );

    const removeStudentSection = (key: string) => {
      const next = { ...(form.showFieldsStudent || {}) };
      if (next[key]) next[key] = false;
      // @ts-ignore
      v$.value.form.showFieldsStudent.$model = next;
    };
    const removeStudentOption = (key: string) => {
      const next = { ...(form.optionsStudent || {}) };
      if (next[key]) next[key] = false;
      // @ts-ignore
      v$.value.form.optionsStudent.$model = next;
    };

    const removeTutorSection = (key: string) => {
      const next = { ...(form.showFieldsTutor || {}) };
      if (next[key]) next[key] = false;
      // @ts-ignore
      v$.value.form.showFieldsTutor.$model = next;
    };
    const removeTutorOption = (key: string) => {
      const next = { ...(form.optionsTutor || {}) };
      if (next[key]) next[key] = false;
      // @ts-ignore
      v$.value.form.optionsTutor.$model = next;
    };

    const showStudentSummary = computed(
      () => studentSectionsLabels.value.length || studentOptionsLabels.value.length
    );
    const showTutorSummary = computed(
      () => tutorSectionsLabels.value.length || tutorOptionsLabels.value.length
    );
    const hasAnyChip = computed(() => showStudentSummary.value || showTutorSummary.value);

    return {
      // base
      title,
      t,
      permission,
      routes,
      service,
      loading,
      params,
      v$,
      filters,
      form,

      // drawers
      drawerStudentOpen,
      drawerTutorOpen,
      showResponseOptionsStudent,
      showResponseOptionsTutor,
      onSectionsChangedStudent,
      onSectionsChangedTutor,

      // chips
      studentSectionsLabels,
      studentOptionsLabels,
      tutorSectionsLabels,
      tutorOptionsLabels,
      removeStudentSection,
      removeStudentOption,
      removeTutorSection,
      removeTutorOption,
      hasAnyChip,
      showStudentSummary,
      showTutorSummary,
    };
  },
});
</script>

<style scoped>
.mt-12{ margin-top:12px }
.gap-8{ gap:8px; display:flex; flex-wrap:wrap }

/* Resumen con altura fija y scroll */
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

  max-height:240px;   /* ajusta a tu gusto */
  overflow-y:auto;
}
.summary-block{ min-width:280px; flex:1 1 340px; }
.summary-head{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.summary-title{ font-weight:700; font-size:.95rem; color:#2e3135; }
.summary-count{
  background:#eef2ff;
  border:1px solid rgba(145,158,171,.25);
  border-radius:999px; padding:2px 8px;
  font-size:.8rem; color:#606a7a;
}
.divider{ width:1px; background:rgba(145,158,171,.25); align-self:stretch; }

.mini-block{ margin-top:8px }
.mini-title{ font-weight:600; font-size:.85rem; color:#4b5563; margin-bottom:6px }

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
