<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicPlanning.subjectAssignments' }"></AppButtonBack>

      <AppButton style="color: white" @click="openAddNewDateModal()" label="core.newFemale"></AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <FullCalendar :options="calendarOptions"></FullCalendar>
        </div>

        <AppModal v-model="addNewDateModal" :size="'lg'">
          <FormManageSchedule
            v-if="addNewDateModal"
            :currentSchedule="currentSchedule"
            :week-days="weekDays"
            :schedule="schedule"
            :courses="courses"
            @close="closeAddNewDateModal"
          ></FormManageSchedule>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="Horario" @confirmDelete="confirmDelete"> </AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import '@fullcalendar/core/vdom';
import FullCalendar from '@fullcalendar/vue3';
import timeGrid from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import FormManageSchedule from '../components/FormManageSchedule.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ScheduleDto, RelatedDataDto, CourseDto, WeekDayDto } from '../dtos/schedule.dto';

import { DeleteScheduleService } from '../services/deleteSchedule.service';
import { GetManageScheduleService } from '../services/getManageSchedule.service';
import { GetUserToEditByIdService } from '../../access/services/getUserToEditById.service';
import { GetRelatedDataManageScheduleService } from '../services/getRelatedDataManageSchedule.service';
import { useHeaderStore } from '../../../stores/header.store';

const getRelatedDataManageScheduleService = new GetRelatedDataManageScheduleService();
const getUserToEditByIdService = new GetUserToEditByIdService();
const getManageScheduleService = new GetManageScheduleService();
const deleteScheduleService = new DeleteScheduleService();

export default defineComponent({
  name: 'SchedulePage',
  components: {
    AppConfirmDeleteModal,
    FormManageSchedule,
    AppButtonBack,
    FullCalendar,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();

    const title = 'classroom.teachers.manageSchedule.title';
    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'academicPlanning.academicOffer.title',
        url: { name: 'academicPlanning.academicOffer' },
      },
      {
        name: 'academicPlanning.subjectAssignments.title',
        url: { name: 'academicPlanning.subjectAssignments' },
      },
      {
        name: title,
      },
    ];

    const currentSchedule: Ref<any | null> = ref(null);
    const relatedData: Ref<RelatedDataDto | null> = ref(null);
    const weekDays: Ref<WeekDayDto[]> = ref([]);
    const courses: Ref<CourseDto[]> = ref([]);
    const schedule: Ref<any[]> = ref([]);
    const schedulerecess: Ref<any[]> = ref([]);
    const scheduleId = ref();
    const subtitle = ref();
    const userId = ref();
    const academicPeriodGroupId = ref<number | null>(null);

    const addNewDateModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    const calendarOptions = computed(() => {
      return {
        plugins: [interactionPlugin, dayGridPlugin, timeGrid],
        initialView: 'timeGridWeek',
        headerToolbar: { start: '', center: '', end: '' },
        locales: [esLocale],
        allDaySlot: false,
        nowIndicator: true,
        locale: 'es',
        firstDay: 0,
        events: [...schedule.value, ...schedulerecess.value],
        eventClick: (eventClickInfo: any) => {
          // Verifica si el evento es de tipo "recess"
          const eventType = eventClickInfo.event.extendedProps?.type;
          if (eventType !== 'recess') {
            const schedule = eventClickInfo.event.extendedProps.schedule;
            openAddNewDateModal(schedule);
          }
        },
      };
    });

    onMounted(async () => {
      try {
        userId.value = parseInt(route.params.userId.toString());
        let academicPeriodId = null;

        if (route.query.academicPeriodId) academicPeriodId = parseInt(route.query.academicPeriodId.toString());
        academicPeriodGroupId.value = parseInt(route.params.academicPeriodGroupId as string);

        relatedData.value = await getRelatedDataManageScheduleService.run({
          academicperiodGroupId: academicPeriodGroupId.value,
        });

        const user = await getUserToEditByIdService.run(parseInt(userId.value));

        courses.value = relatedData.value.courses;
        weekDays.value = relatedData.value.weekDays;
        subtitle.value = `Docente: ${user.people.names} ${user.people.lastnames}`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Oferta académica', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };

        await getData();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getData = async () => {
      let academicPeriodId = null;
      if (route.query.academicPeriodId) academicPeriodId = parseInt(route.query.academicPeriodId.toString());

      const response = await getManageScheduleService.run({
        userId: userId.value,
        academicPeriodId: academicPeriodId,
      });

      const currentDate = dayjs();

      schedule.value = response.timeTables.map((schedule: any) => {
        const date = currentDate.day(schedule.dayWeek);

        return {
          id: schedule.id,
          title: schedule.playTimeName ? schedule.playTimeName : schedule.nameCourse,
          start: date.format('YYYY-MM-DD') + 'T' + schedule.startTime,
          end: date.format('YYYY-MM-DD') + 'T' + schedule.endTime,
          color: schedule.color || `${import.meta.env.VITE_COLOR_PRIMARY}`, // Asigna el color al evento
          extendedProps: {
            schedule,
          },
        };
      });

      schedulerecess.value = response.playTimes.flatMap((playTime: any) => {
        // Crea un evento solo para los días de lunes (1) a viernes (5)
        return Array.from({ length: 5 }).map((_, index) => {
          const dayOfWeek = index + 1; // Mapea los índices a días de la semana (1 = Lunes, ..., 5 = Viernes)
          const date = currentDate.day(dayOfWeek); // Genera la fecha para cada día entre lunes y viernes

          return {
            id: playTime.id,
            title: playTime.name,
            start: date.format('YYYY-MM-DD') + 'T' + playTime.timeSince,
            end: date.format('YYYY-MM-DD') + 'T' + playTime.timeUntil,
            color: playTime.color, // Usa el color del playTime
            extendedProps: {
              playTime,
              type: 'recess', // Identificador para recesos
            },
          };
        });
      });
    };

    const openAddNewDateModal = (scheduleP: any | null = null) => {
      currentSchedule.value = scheduleP;
      addNewDateModal.value = true;
    };
    const closeAddNewDateModal = async (id: any) => {
      addNewDateModal.value = false;

      if (!id) {
        await getData();
      } else {
        openConfirmDelete(id);
      }
    };

    const openConfirmDelete = (id: any) => {
      scheduleId.value = id;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (scheduleId.value) {
          await deleteScheduleService.run(scheduleId.value);
          scheduleId.value = null;

          await getData();
        }
      } catch (e) {
        console.log(e);
      }
      modalDelete.value = false;
    };

    return {
      subtitle,
      loading,
      routes,
      title,

      addNewDateModal,
      currentSchedule,
      calendarOptions,
      modalDelete,
      weekDays,
      schedule,
      schedulerecess,
      courses,

      closeAddNewDateModal,
      openAddNewDateModal,
      confirmDelete,
    };
  },
});
</script>

<style scoped></style>
