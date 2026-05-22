<template>
  <AppBaseList :title="title" isCard>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <AppDatatable :service="getCurriculumOfferingsService" :params="params" :name="name">
          <template v-slot:filters>
            <AppFilter v-model="academicPeriodId" :filter-name="`${name}.academicPeriodId`">
              <label for="academicPeriodId">{{ t('core.generalTerms.academic.academicPeriod.singular') }}</label>
              <AppAutocomplete :options="academicPeriods.value" :model-value="academicPeriodId" :input-id="'academicPeriodId'" v-model="academicPeriodId"></AppAutocomplete>
            </AppFilter>
          </template>

          <AppDatatableColumn label="Modalidad" field="modalityName" :sortable="true" v-slot="{ row }">
            {{ row.modalityName || '—' }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Programa" field="programName" :sortable="true" v-slot="{ row }">
            {{ row.programName || '—' }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Sede" field="campusName" :sortable="true" v-slot="{ row }">
            {{ row.campusName || '—' }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Inscritos" field="totalEnrolled" :sortable="true" v-slot="{ row }">
            {{ row.totalEnrolled ?? 0 }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Matrículas" field="totalMatriculates" :sortable="true" v-slot="{ row }">
            <AppCheckPermission permission="academicAdministration.matriculates.list">
              <router-link
                :to="{
                  name: 'academicAdministration.enrolledByCourse',
                  params: {
                    curriculumOfferingId: row.academicPeriodGroupId || row.id,
                  },
                }"
                class="border text-decoration-none text-dark rounded-pill p-1 ps-3 pe-3 hover"
                v-tooltip="'core.generalTerms.academic.enroll.plural'"
              >
                {{ row.totalMatriculates ?? 0 }} /
                {{ row.maxCapacity ?? 'Sin configurar' }}
              </router-link>
            </AppCheckPermission>
          </AppDatatableColumn>

          <!--
          <AppDatatableColumn v-slot="{ row }">
            <AppButtonGroup size="sm">
              <AppCheckPermission permission="academicAdministration.subjectAssignmentsCourse.list">
                <AppButton
                  v-tooltip="'core.generalTerms.academic.subject.plural'"
                  variant="primary"
                  icon="book-open"
                  outlined
                  :to="{
                    name: 'academicAdministration.subjectsByCourse',
                    params: {
                      academicPeriodGroupId: row.academicPeriodGroupId || row.id,
                    },
                  }"
                ></AppButton>
              </AppCheckPermission>

              <AppCheckPermission permission="academicAdministration.matriculates.create">
                <AppButton
                  v-tooltip="'Promoción de core.generalTerms.academic.degree.singular'"
                  variant="primary"
                  icon="users"
                  outlined
                  :to="{
                    name: 'academicAdministration.groupPromotions',
                    params: {
                      academicPeriodGroupId: row.academicPeriodGroupId || row.id,
                    },
                  }"
                ></AppButton>
              </AppCheckPermission>

              <AppButton
                v-tooltip="'Importar notas'"
                icon="upload"
                outlined
                :to="{
                  name: 'academicAdministration.importTemplateNotes',
                  params: { academicPeriodGroupId: row.academicPeriodGroupId || row.id },
                }"
              ></AppButton>
            </AppButtonGroup>
          </AppDatatableColumn>
          -->
        </AppDatatable>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

import { GetMatriculatesGroupedCoursesRelatedDataFormService } from '../services/getMatriculatesGroupedCoursesRelatedDataForm.service';
import { GetCurriculumOfferingsService } from '../../academicPlanning/services/getCurriculumOfferings.service';

const getMatriculatesGroupedCoursesRelatedDataFormService = new GetMatriculatesGroupedCoursesRelatedDataFormService();
const getCurriculumOfferingsService = new GetCurriculumOfferingsService();

export default defineComponent({
  name: 'CourseAdministration',
  components: {
    AppDatatableColumn,
    AppCheckPermission,
    AppAutocomplete,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppFilter,
  },

  setup() {
    const { t } = useI18n();
    const title = 'core.menu.courseAdministration';
    const name = 'courseAdministration';
    const routes = [{ name: title }];

    useMeta({
      title: t(title),
    });

    const academicPeriodId = ref();
    const loading = ref(true);

    const params = computed(() => {
      return {
        academicPeriodId: academicPeriodId.value,
      };
    });

    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        await getData();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getData = async () => {
      academicPeriods.value = await getMatriculatesGroupedCoursesRelatedDataFormService.run();
      academicPeriodId.value = academicPeriods.value[0].id ?? null;
    };

    return {
      loading,
      routes,
      title,
      t,

      getCurriculumOfferingsService,
      academicPeriodId,
      academicPeriods,
      params,
      name,
    };
  },
});
</script>

<style scoped>
.hover:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
