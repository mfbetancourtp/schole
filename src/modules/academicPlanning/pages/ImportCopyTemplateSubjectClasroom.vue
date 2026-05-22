<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButton v-if="data.value.length" style="color: white" variant="primary" label="core.save" @click="save()" />
      <AppButtonBack
        :to="{
          name: 'academicPlanning.menuImportAcademicPeriod',
          params: { academicPeriodId: academicPeriodId },
        }"
      />
    </template>

    <template #content>
      <AppLoading v-if="loading" />
      <template v-else>
        <!-- Selectores -->
        <section class="bg-white rounded p-2 form-row">
          <AppFormField label="Año Académico Origen">
            <AppAutocomplete v-model="academicPeriodIdOrigin" :options="academicPeriods" :clearable="false" />
          </AppFormField>

          <AppFormField label="Grupo Origen">
            <AppAutocomplete v-model="academicPeriodGroupIdOrigin" :options="academicPeriodGroupsOrigin" :clearable="false" />
          </AppFormField>

          <AppFormField label="Grupo Destino">
            <AppAutocomplete v-model="academicPeriodGroupIdDestination" :options="academicPeriodGroupsDestination" :clearable="false" />
          </AppFormField>
        </section>

        <div class="d-flex justify-content-end mt-2">
          <AppButton :disabled="isLoadDisabled" @click="loadData()" variant="primary" label="Cargar" />
        </div>

        <AppLoading v-if="loadTable" />

        <section v-else>
          <AppEmptyResponse v-if="!data.value.length" :show-image="true" />

          <div v-else class="mt-3">
            <!-- ===== Reemplazo: AppDatatable ===== -->
            <AppDatatable
              name="copyAcademicCarga"
              :table-title="'Asignaciones por copiar'"
              :data="data.value"
              :default-per-page="10"
              :enable-search-filter="true"
              :show-filter-steps="false"
              :default-sort="'subjectName'"
              default-sort-direction="asc"
              :filter-key-local="'subjectName'"
              :paginated="true"
            >
              <!-- Columnas -->
              <o-table-column field="subjectName" label="Asignatura" sortable v-slot="props">
                {{ props.row.subjectName }}
              </o-table-column>

              <o-table-column field="dayWeek" label="Día" v-slot="props">
                <AppFormField label=" " :label-sr-only="true" style="min-width: 220px">
                  <AppAutocomplete v-model="props.row.dayWeek" :options="weekDays" label="label" :input-id="`dayWeek-${props.index}`" />
                </AppFormField>
              </o-table-column>

              <o-table-column field="startTime" label="Desde" v-slot="props">
                <AppFormField label=" " :label-sr-only="true" style="min-width: 160px">
                  <input :id="`startTime-${props.index}`" class="form-control" type="time" :value="toTimeInputValue(props.row.startTime)" @input="onTimeChange(props.row, 'startTime', $event)" />
                </AppFormField>
              </o-table-column>

              <o-table-column field="endTime" label="Hasta" v-slot="props">
                <AppFormField label=" " :label-sr-only="true" style="min-width: 160px">
                  <input :id="`endTime-${props.index}`" class="form-control" type="time" :value="toTimeInputValue(props.row.endTime)" @input="onTimeChange(props.row, 'endTime', $event)" />
                </AppFormField>
              </o-table-column>

              <o-table-column field="observation" label="Observación" v-slot="props">
                {{ props.row.observation }}
              </o-table-column>
              <!-- /Columnas -->
            </AppDatatable>

            <div class="d-flex justify-content-between align-items-center mt-2">
              <p class="m-0">La asignación no será almacenada en "{{ academicPeriodName }}" hasta dar clic en Guardar.</p>
            </div>
          </div>
        </section>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref, Ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';

import { GetDataTemplateSubjectClasroomForImportService } from '../services/getDataTemplateSubjectClasroomForImport.service';
import { useHeaderStore } from '../../../stores/header.store';
import { AcademicPeriodDataDto } from '../../../shared/dto/academicPeriod.dto';
import { GetAcademicPeriodGroupsFromAcademicPeriodIdService } from '../../../shared/services/reports/getAcademicPeriodGroupsFromAcademicPeriodId.service';
import { AcademicPeriodGroupDto } from '../../../shared/dto/reports/getAcademicPeriodGroups.dto';
import { GetAttendanceFilterOptionsService } from '../../../shared/services/reports/getAttendanceFilterOptions.service';
import { CopyAcademicGroupService } from '../services/copyAcademicGroup.service';
import { WeekDayDto } from '../dtos/schedule.dto';
import { GetRelatedDataManageScheduleService } from '../services/getRelatedDataManageSchedule.service';

const getDataTemplateSubjectClasroomForImportService = new GetDataTemplateSubjectClasroomForImportService();
const copyAcademicGroupService = new CopyAcademicGroupService();
const getRelatedDataManageScheduleService = new GetRelatedDataManageScheduleService();

dayjs.extend(isoWeek);

export default defineComponent({
  name: 'ImportCopyAcademicCarga',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppFormField,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppDatatable,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar datos desde otro grupo académico';
    const routes: any[] = [{ name: title }];
    useMeta({ title: 'Copiar carga académica' });

    // DESTINO (por ruta)
    const academicPeriodId: Ref<number | null> = ref(null);
    const academicPeriodName = ref<string | null>(null);

    // ORIGEN (selección)
    const academicPeriodIdOrigin: Ref<number | null> = ref(null);
    const academicPeriodGroupIdOrigin: Ref<number | null> = ref(null);

    // DESTINO - Grupo
    const academicPeriodGroupIdDestination: Ref<number | null> = ref(null);

    // Opciones
    const academicPeriods: Ref<AcademicPeriodDataDto[]> = ref([]);
    const academicPeriodGroupsOrigin: Ref<AcademicPeriodGroupDto[]> = ref([]);
    const academicPeriodGroupsDestination: Ref<AcademicPeriodGroupDto[]> = ref([]);

    // Estado
    const loadTable = ref(false);
    const loading = ref(true);
    const route = useRoute();

    const getAcademicPeriodGroupsFromAcademicPeriodIdService = new GetAcademicPeriodGroupsFromAcademicPeriodIdService();
    const getAttendanceFilterOptionsService = new GetAttendanceFilterOptionsService();

    // tabla (modo local)
    const data: { value: any[] } = reactive({ value: [] });

    // ====== opciones día semana y helpers hora ======
    const weekDays: Ref<WeekDayDto[]> = ref([]);

    const toTimeInputValue = (hhmmss?: string | null) => {
      if (!hhmmss) return '';
      const parts = String(hhmmss).split(':');
      if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      const d = dayjs(hhmmss, ['HH:mm:ss', 'HH:mm', 'H:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss'], true);
      return d.isValid() ? d.format('HH:mm') : '';
    };

    const fromTimeInputValue = (hhmm?: string) => {
      if (!hhmm) return '00:00:00';
      return /^\d{2}:\d{2}$/.test(hhmm) ? `${hhmm}:00` : hhmm;
    };

    const onTimeChange = (row: any, key: 'startTime' | 'endTime', ev: Event) => {
      const val = (ev.target as HTMLInputElement).value;
      row[key] = fromTimeInputValue(val);
    };
    // ====================================================

    onMounted(async () => {
      try {
        // DESTINO desde la ruta
        academicPeriodId.value = parseInt(route.params.academicPeriodId.toString(), 10);

        // Períodos activos
        const response = await getAttendanceFilterOptionsService.run();
        academicPeriods.value = (response.academicPeriods || []).filter((item: any) => item.active === 1);

        // ORIGEN por defecto
        academicPeriodIdOrigin.value = academicPeriods.value.length ? academicPeriods.value[0].id : null;

        const relateDataWeek = await getRelatedDataManageScheduleService.run({});
        weekDays.value = relateDataWeek.weekDays;

        // Header
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Año Académico', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };

        await loadRoutesAndName();

        // Grupos ORIGEN inicial
        if (academicPeriodIdOrigin.value) {
          academicPeriodGroupsOrigin.value = await getAcademicPeriodGroupsFromAcademicPeriodIdService.run(academicPeriodIdOrigin.value);
          academicPeriodGroupIdOrigin.value = academicPeriodGroupsOrigin.value[0]?.id ?? null;
        }

        // Grupos DESTINO inicial
        if (academicPeriodId.value) {
          academicPeriodGroupsDestination.value = await getAcademicPeriodGroupsFromAcademicPeriodIdService.run(academicPeriodId.value);
          academicPeriodGroupIdDestination.value = academicPeriodGroupsDestination.value[0]?.id ?? null;
        }
      } catch (e) {
        console.log('error', e);
      } finally {
        loading.value = false;
      }
    });

    // Guardar con payload { academicPeriodGroupId, timetables: [...] }
    const save = async () => {
      if (!academicPeriodGroupIdDestination.value) return;

      const timetables = data.value.map((dat: any) => {
        const dayWeek: any = dat.dayWeek;
        const dayWeekName = dayWeek ? weekDays.value[dayWeek]?.label : dat.dayWeekName ?? '';
        return {
          courseId: dat.courseId ?? dat.curriculumSubjectId ?? dat.courseGroupId ?? null,
          subjectName: dat.subjectName,
          dayWeek,
          dayWeekName,
          startTime: dat.startTime,
          endTime: dat.endTime,
          observation: dat.observation ?? null,
        };
      });

      const payload = {
        academicPeriodGroupId: academicPeriodGroupIdDestination.value,
        timetables,
      };

      try {
        await copyAcademicGroupService.run(payload);
      } catch (e) {
        console.log('error', e);
      }
    };

    const loadData = async () => {
      if (isLoadDisabled.value) return;
      loadTable.value = true;
      try {
        const params = {
          academicPeriodGroupIdOrigin: academicPeriodGroupIdOrigin.value!,
          academicPeriodGroupIdDestination: academicPeriodGroupIdDestination.value!,
        };
        const rows = await getDataTemplateSubjectClasroomForImportService.run(params);

        // Normalizo tiempos a HH:mm:ss si vinieron en otros formatos
        data.value = rows.map((row: any) => ({
          ...row,
          startTime: fromTimeInputValue(toTimeInputValue(row.startTime)),
          endTime: fromTimeInputValue(toTimeInputValue(row.endTime)),
          dayWeek: row.dayWeek ?? null,
        }));
      } catch (e) {
        console.log('error', e);
      } finally {
        loadTable.value = false;
      }
    };

    const loadRoutesAndName = async () => {
      try {
        const opts: any = await getAttendanceFilterOptionsService.run();
        let nameRoute = '';
        (opts.academicPeriods || []).forEach((ap: any) => {
          if (academicPeriodId.value === ap.id) {
            academicPeriodName.value = ap.name;
            nameRoute = `Importar información a "${ap.name}"`;
          }
        });
        // (Se usa headerStore para “breadcrumbs” propios)
      } catch (e) {
        console.log('error', e);
      }
    };

    // Watchers
    watch(academicPeriodIdOrigin, async (newVal) => {
      if (newVal) {
        academicPeriodGroupsOrigin.value = await getAcademicPeriodGroupsFromAcademicPeriodIdService.run(newVal);
        academicPeriodGroupIdOrigin.value = academicPeriodGroupsOrigin.value[0]?.id ?? null;
      } else {
        academicPeriodGroupsOrigin.value = [];
        academicPeriodGroupIdOrigin.value = null;
      }
    });

    watch(academicPeriodId, async (newVal) => {
      if (newVal) {
        academicPeriodGroupsDestination.value = await getAcademicPeriodGroupsFromAcademicPeriodIdService.run(newVal);
        academicPeriodGroupIdDestination.value = academicPeriodGroupsDestination.value[0]?.id ?? null;
      } else {
        academicPeriodGroupsDestination.value = [];
        academicPeriodGroupIdDestination.value = null;
      }
    });

    const isLoadDisabled = computed(() => !academicPeriodIdOrigin.value || !academicPeriodGroupIdOrigin.value || !academicPeriodGroupIdDestination.value);

    return {
      t,
      routes,
      title,

      // selects
      academicPeriods,
      academicPeriodId,
      academicPeriodName,
      academicPeriodIdOrigin,
      academicPeriodGroupIdOrigin,
      academicPeriodGroupIdDestination,
      academicPeriodGroupsOrigin,
      academicPeriodGroupsDestination,

      // tabla (local)
      data,
      loading,
      loadTable,

      // acciones
      loadData,
      save,
      dayjs,

      // ui
      isLoadDisabled,

      // helpers/ui
      weekDays,
      toTimeInputValue,
      onTimeChange,
    };
  },
});
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
}
</style>
