<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:content>
      <AppDatatable :service="service" :params="params" :name="name">
        <template v-slot:filters>
          <!-- Filtro para Academic Period -->
          <AppFilter v-model="academicPeriodId" :filter-name="`${name}.academicPeriodId`">
            <AppFormField label="core.generalTerms.academic.academicPeriod.singular" capitalize>
              <AppAutocomplete v-model="academicPeriodId" :options="academicPeriods" input-id="academicPeriodId" />
            </AppFormField>
          </AppFilter>
          <!-- Filtro para isRetired -->

          <AppFilter v-model="isRetired" :filter-name="`${name}.isRetired`">
            <AppFormField label="Estado" capitalize>
              <AppAutocomplete v-model="isRetired" :options="retiredOptions" input-id="isRetired" />
            </AppFormField>
          </AppFilter>
          <!-- Filtro para Degree -->
          <AppFilter v-model="degreeId" :filter-name="`${name}.degreeId`">
            <AppFormField label="core.generalTerms.academic.degree.singular" capitalize>
              <AppAutocomplete v-model="degreeId" :options="degrees" input-id="degreeId" :disabled="!academicPeriodId" />
            </AppFormField>
          </AppFilter>

          <!-- Filtro para Group -->
          <AppFilter v-model="groupId" :filter-name="`${name}.groupId`">
            <AppFormField label="core.generalTerms.academic.group.singular" capitalize>
              <AppAutocomplete v-model="groupId" :options="groups" input-id="groupId" :disabled="!degreeId" />
            </AppFormField>
          </AppFilter>
        </template>

        <AppDatatableColumn :label="t('disciplinaryControl.disciplinaryOffenses.table.student')" field="student" :sortable="true" v-slot="{ row }">
          <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
            <AppAvatar :size="'sm'" :avatar="row.avatar" :name="row.studentNames || '?'"> </AppAvatar>
            <div class="tw-min-w-0 tw-ml-4">
              <div class="tw-font-medium tw-leading-5 tw-truncate">
                {{ row.studentLastnames }}
              </div>
              <div class="tw-leading-5 tw-truncate tw-font-light">
                {{ row.studentNames }}
              </div>
            </div>
          </div>
        </AppDatatableColumn>
        <AppDatatableColumn :label="t('academicAdministration.matriculates.table.identification')" field="studentIdentification" :sortable="true" v-slot="{ row }">
          {{ row.studentIdentification }}
        </AppDatatableColumn>
        <AppDatatableColumn :label="t('core.generalTerms.academic.academicPeriod.singular')" field="academicPeriodName" :sortable="true" v-slot="{ row }">
          <span style="font-size: 0.9rem">{{ row.academicPeriodName }}</span>
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('academicPrograms.degrees.singular')" field="degreeName" :sortable="true" v-slot="{ row }">
          {{ row.degreeName }}
        </AppDatatableColumn>
        <AppDatatableColumn :label="t('core.generalTerms.academic.group.singular')" field="groupName" :sortable="true" v-slot="{ row }">
          {{ row.groupName }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.table.actions')" v-slot="{ row }">
          <AppButtonGroup size="lg">
            <AppCheckPermission permission="disciplinaryControl.observerByUserId.list">
              <AppButton
                v-tooltip="'Ver observador'"
                variant="primary"
                icon="eye"
                :to="{
                  name: 'disciplinaryControl.observerByUserId',
                  params: {
                    userId: row.userId,
                  },
                }"
              ></AppButton>
            </AppCheckPermission>

            <template v-if="row.sessionGeneral != null">
              <AppCheckPermission permission="disciplinaryControl.attendanceGeneral.list">
                <AppButton
                  v-tooltip="'Tomar asistencia'"
                  variant="primary"
                  icon="clipboard-list"
                  :to="{
                    name: 'disciplinaryControl.observer.attendanceGeneral',
                    params: {
                      academicPeriodGroupId: row.sessionGeneral.academicPeriodGroupId,
                      sessionId: row.sessionGeneral.id,
                    },
                  }"
                ></AppButton>
              </AppCheckPermission>
            </template>

            <AppCheckPermission permission="disciplinaryControl.observerAbsence.list">
              <AppButton
                v-tooltip="'Programar inasistencia'"
                variant="primary"
                icon="calendar-minus"
                :to="{
                  name: 'disciplinaryControl.observer.futureAbsences',
                  params: {
                    matriculateId: row.matriculateId,
                  },
                  query: {
                    userId: row.userId,
                    academicPeriodGroupId: row.academicPeriodGroupId,
                  },
                }"
              ></AppButton>
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { useHeaderStore } from '../../../stores/header.store';

import { GetLevelsByAcademicPeriodIdService } from '../../reports/services/filters/getLevelsByAcademicPeriodId.service';

import { GetFiltersOffensesService } from '../services/getFiltersOffenses.service';
import { GetStudentsForObserverService } from '../services/getStudentsForObserver.service';

const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();

const getFilters = new GetFiltersOffensesService();

export default defineComponent({
  name: 'componentObserver',
  components: {
    AppDatatableColumn,
    AppCheckPermission,
    AppAutocomplete,
    AppButtonGroup,
    AppFormField,
    AppDatatable,
    AppBaseList,
    AppFilter,
    AppAvatar,
    AppButton,
  },

  setup() {
    const { t } = useI18n();
    const title = t('core.menu.observer');

    useMeta({ title });

    const academicPeriods = ref<any[]>([]);
    const degrees = ref<any[]>([]);
    const groups = ref<any[]>([]);

    const academicPeriodId = ref<number | string | null>(null);
    const degreeId = ref<number | string | null>(null);
    const groupId = ref<number | string | null>(null);
    const isRetired = ref<number | null>(0);

    const retiredOptions = [
      { id: 0, name: 'Activo' },
      { id: 1, name: 'Retirado' },
    ];
    const service = new GetStudentsForObserverService();
    const name = 'disciplinaryControl.observer';
    const params = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      degreeId: degreeId.value,
      groupId: groupId.value,
      isRetired: isRetired.value,
    }));

    const firstLoad = ref<boolean>(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Control disciplinario', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        let response = await getFilters.run();
        const allAcademicPeriods = response.academicPeriods;

        // Filtra solo periodos activos
        academicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);

        // Siempre selecciona el primero
        academicPeriodId.value = academicPeriods.value.length > 0 
          ? academicPeriods.value[0].id 
          : null;

        // Si hay academicPeriodId, cargar degrees
        if (academicPeriodId.value) {
          const levelsResult = await getLevelsByAcademicPeriodIdService.run(academicPeriodId.value);
          degrees.value = levelsResult.reduce((acc: any[], level: any) => {
            return acc.concat(level.degrees);
          }, []);
        }

      } catch (e) {
        console.log(e);
      }

      firstLoad.value = false;
    });


    // Al seleccionar un Academic Period, se obtiene la lista de niveles
    // y se "aplanan" todos los grados de cada nivel para poblar el filtro de Degree
    watch(academicPeriodId, async (newVal: any) => {
      if (firstLoad.value) return;

      if (newVal) {
        const levelsResult = await getLevelsByAcademicPeriodIdService.run(newVal);
        // Se extraen todos los grados de los niveles recibidos
        const allDegrees = levelsResult.reduce((acc: any[], level: any) => {
          return acc.concat(level.degrees);
        }, []);
        degrees.value = allDegrees;
      } else {
        degrees.value = [];
      }

      degreeId.value = null;
      groups.value = [];
      groupId.value = null;
    });
    watch(degreeId, (newVal: any) => {
      if (firstLoad.value) return;

      if (newVal) {
        getGroupsByDegreeId(newVal);
      } else {
        groups.value = [];
      }

      groupId.value = null;
    });

    const getGroupsByDegreeId = (selectedDegreeId: number) => {
      const selectedDegree = degrees.value.find((degree: any) => degree.id === selectedDegreeId);
      groups.value = selectedDegree ? selectedDegree.groups : [];
    };

    return {
      title,
      t,

      service,
      params,
      name,

      academicPeriodId,
      academicPeriods,
      retiredOptions,
      isRetired,
      degreeId,
      degrees,
      groupId,
      groups,
    };
  },
});
</script>

<style scoped></style>
