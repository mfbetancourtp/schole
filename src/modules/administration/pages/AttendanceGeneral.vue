<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template v-slot:actions>
      <AppButtonBack
        :to="{
          name: 'administration.homeTeacher',
        }"
      ></AppButtonBack>

      <AppCheckPermission permission="classroom.attendanceGeneral.create">
        <AppButton
          style="color: white"
          label="core.newFemale"
          :to="{
            name: 'administration.homeTeacher.attendanceGeneral.create',
            params: { academicPeriodGroupId, courseId },
          }"
        ></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <section class="mb-3">
          <!-- <p class="mb-1">{{ t('classroom.attendanceGeneral.filters.title') }}</p> -->

          <div class="d-flex contentFilter" @click="changeFilter()">
            <div v-bind:class="{ focus: filter == 6 }" @click="filter = 6" class="filter">
              {{ t('classroom.attendance.filters.today') }}
            </div>
            <div v-bind:class="{ focus: filter == 0 }" @click="filter = 0" class="filter">
              {{ t('classroom.attendance.filters.thisWeek') }}
            </div>
            <div v-bind:class="{ focus: filter == 4 }" @click="filter = 4" class="filter">
              {{ t('classroom.attendance.filters.all') }}
            </div>

            <div v-bind:class="{ focus: filter == 5 }" @click="filter = 5" class="filter">
              {{ t('classroom.attendance.filters.custom') }}
            </div>
          </div>

          <section class="mt-1 row" v-if="filter == 5">
            <div class="col">
              <label>{{ t('core.time.since') }}</label>
              <input v-model="dateSince.value" class="form-control" type="date" />
            </div>
            <div class="col">
              <label>{{ t('core.time.until') }}</label>
              <input v-model="dateUntil.value" class="form-control" type="date" />
            </div>

            <div class="col-2 d-flex align-items-end">
              <div class="d-flex flex-column justify-content-center align-items-center bg-white">
                <AppButton label="classroom.attendance.filters.btn" @click="changeFilter()"></AppButton>
              </div>
            </div>
          </section>
        </section>

        <AppDatatable :service="service" :params="params" :name="title">
          <AppDatatableColumn label="classroom.attendance.table.name" field="name" v-slot="{ row }" :width="400">
            {{ row.name ?? '---' }}
          </AppDatatableColumn>
          <AppDatatableColumn label="classroom.attendance.table.dateSince" field="date" v-slot="{ row }" :width="200">
            {{ row.dateSince }}
          </AppDatatableColumn>

          <AppDatatableColumn label="classroom.attendance.table.timeSince" field="time" v-slot="{ row }" :width="200">
            {{ dayjs(`01-01-2000 ${row.timeSince}`, 'MM-DD-YYYY HH:mm').format('hh:mm A') }}
            a
            {{ dayjs(`01-01-2000 ${row.timeUntil}`, 'MM-DD-YYYY HH:mm').format('hh:mm A') }}
          </AppDatatableColumn>
          <AppDatatableColumn label="classroom.attendance.table.attendanceList" :position="'centered'" v-slot="{ row }" :width="150">
            <div class="d-flex justify-content-center">
              <AppBadge :label="row.statusSession" variant="primary" class="rounded-pill" />
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="core.table.actions" v-slot="{ row }" :position="'centered'" width="9rem">
            <div class="d-flex justify-content-center">
              <AppButtonGroup size="sm">
                <AppCheckPermission permission="classroom.attendanceGeneral.edit">
                  <AppButtonEdit
                    :to="{
                      name: 'administration.homeTeacher.attendanceGeneral.edit',
                      params: {
                        academicPeriodGroupId: academicPeriodGroupId,
                        courseId: courseId,
                        sessionId: row.id,
                      },
                    }"
                  ></AppButtonEdit>
                </AppCheckPermission>
                <AppCheckPermission permission="classroom.attendanceGeneral.delete">
                  <AppButtonDelete @click="openConfirmDelete(row.id)"></AppButtonDelete>
                </AppCheckPermission>
              </AppButtonGroup>
            </div>
          </AppDatatableColumn>
        </AppDatatable>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="classroom.homeTeacher.attendance" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, onMounted, reactive, ref } from 'vue';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';

import { GetCourseByIdService } from '../services/getCourseById.service';
import { DeleteAttendanceGeneralService } from '../services/deleteAttendanceGeneral.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetSessionsByCourseIdAttendanceGeneral } from '../services/getSessionsByCourseIdAttendanceGeneral.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';

const deleteAttendanceGeneralService = new DeleteAttendanceGeneralService();
const updateDatatableService = new UpdateDatatableService();
const getCourseByIdService = new GetCourseByIdService();

dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);

export default defineComponent({
  name: 'attendancePage',
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppCheckPermission,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppButtonDelete,
    AppBadge,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const title = t('classroom.attendanceGeneral.title');
    const courseId = route.params.courseId ? parseInt(route.params.courseId.toString(), 10) : null;
    const academicPeriodGroupId = ref();

    const service = new GetSessionsByCourseIdAttendanceGeneral();

    useMeta({ title: t(title) });

    const currentSessionId: Ref<number | null> = ref(null);
    const id: Ref<number | null> = ref(null);
    const subtitle: Ref<string> = ref('');
    const filter: Ref<number> = ref(6);

    const modalDelete = ref(false);
    const loading = ref(true);

    const dateSince: { value: any } = reactive({ value: null });
    const dateUntil: { value: any } = reactive({ value: null });
    const params = computed(() => {
      const date = calculateFilterDate();
      const params: any = {
        academicPeriodGroupId: academicPeriodGroupId.value,
        dateSince: date.dateSince,
        dateUntil: date.dateUntil,
      };

      return params;
    });

    onMounted(async () => {
      try {
        const course = await getCourseByIdService.run(courseId);
        subtitle.value = course.degreeName;
        academicPeriodGroupId.value = course.academicPeriodGroupId;
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const calculateFilterDate = () => {
      const filterC = filter.value;
      const currentDate = dayjs();

      let weekStart = currentDate.clone().startOf('isoWeek');
      let weekEnd = currentDate.clone().endOf('isoWeek');

      if (filterC === 0) {
        weekEnd.subtract(1, 'day');

        return {
          dateSince: weekStart.toISOString().split('T')[0],
          dateUntil: weekEnd.toISOString().split('T')[0],
        };
      } else if (filterC >= 1 && filterC <= 3) {
        weekStart = weekStart.subtract(filterC, 'week');
        weekEnd = weekEnd.subtract(filterC, 'week');
        weekEnd.subtract(1, 'day');

        return {
          dateSince: weekStart.toISOString().split('T')[0],
          dateUntil: weekEnd.toISOString().split('T')[0],
        };
      } else if (filterC === 5) {
        return {
          dateSince: dateSince.value,
          dateUntil: dateUntil.value,
        };
      } else if (filterC === 6) {
        const today = currentDate.toISOString().split('T')[0];
        return {
          dateSince: today,
          dateUntil: today,
        };
      }

      return {
        dateSince: null,
        dateUntil: null,
      };
    };

    const changeFilter = async () => {
      updateDatatableService.run();
    };

    const openConfirmDelete = async (sessionId: number) => {
      currentSessionId.value = sessionId;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentSessionId.value) {
        await deleteAttendanceGeneralService.run(currentSessionId.value);

        currentSessionId.value = null;

        updateDatatableService.run();
      }

      modalDelete.value = false;
    };
    const goBack = () => {
      router.go(-1);
    };

    return {
      subtitle,
      courseId,
      service,
      loading,
      title,
      t,

      modalDelete,
      dateSince,
      dateUntil,
      filter,
      params,

      openConfirmDelete,
      confirmDelete,
      changeFilter,
      goBack,
      dayjs,
      academicPeriodGroupId,
    };
  },
});
</script>

<style scoped>
.filter {
  background: #fff;
  margin-right: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 28px;
  cursor: pointer;
}
.contentFilter {
  flex-wrap: wrap;
}
.focus {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.focus:hover {
  background-color: rgba(0, 0, 0, 0.2) !important;
}
</style>
