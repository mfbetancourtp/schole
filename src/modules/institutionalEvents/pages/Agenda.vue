<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppCheckPermission permission="events.agenda.create">

      <AppButton style="color: white;" label="Agregar evento" @click="openAgendaModal(null)"></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppCard v-else>
        <template #body>
          <FullCalendar id="calendar" :options="calendarOptions" />
        </template>
      </AppCard>

      <AppModal v-model="agendaModal" :size="'xl'">
        <AgendaForm v-if="agendaModal" :currentMonth="currentMonth" :data="currentEvent" @close="closeAgendaModal"> </AgendaForm>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import '@fullcalendar/core/vdom';
import FullCalendar from '@fullcalendar/vue3';

import ListPlugin from '@fullcalendar/list';
import timeGrid from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin from '@fullcalendar/interaction';

import AgendaForm from '../components/AgendaForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetMyEventsService } from '../services/getMyEvents.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

const getMyEventsService = new GetMyEventsService();

export default defineComponent({
  name: 'AgendaPage',
  components: {
    FullCalendar,
    AppBaseList,
    AgendaForm,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppCheckPermission,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Agenda';
    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const currentEvent: Ref<any | null> = ref(null);
    const events: Ref<any[]> = ref([]);
    const institutionalActivities: Ref<any[]> = ref([]);
    const currentMonth = ref();
    const agendaModal = ref(false);
    const loading = ref(true);

    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin, timeGrid, ListPlugin],
      initialView: 'dayGridMonth',
      locales: [esLocale],
      selectable: true,
      locale: 'es',
      firstDay: 0,
      slotLabelFormat: [{ hour: 'numeric', hour12: true }, { minute: '2-digit' }],
      headerToolbar: {
        start: 'prev,next today',
        center: 'title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listDay',
      },

      select: (info: any) => {
        const selectedDate = dayjs(info.startStr).format('YYYY-MM-DD');
        const currentDateTime = dayjs().format('HH:mm');
        const endDateTime = dayjs().add(1, 'hour').format('HH:mm');

        const dataDate = {
          startDate: `${selectedDate} ${currentDateTime}`,
          endDate: `${selectedDate} ${endDateTime}`,
          isAllDay: false,
        };

        console.log('Data captured on select:', dataDate);
        openAgendaModal(dataDate);
      },
      eventClick: (info: any) => {
        const eventData = info.event.extendedProps;
        console.log('Data captured on eventClick:', eventData);
        openAgendaModal(eventData);
      },

      datesSet: (info: any) => {
        const date = info.view.currentStart;
        const month = dayjs(date).month() + 1;
        const dates = {
          month: month,
          firstDayOfMonth: dayjs(date).startOf('month').format('YYYY-MM-DD'),
          lastDayOfMonth: dayjs(date).endOf('month').format('YYYY-MM-DD'),
        };

        if (!currentMonth.value) currentMonth.value = dates;
        else if (currentMonth.value.month != dates.month) currentMonth.value = dates;
      },

      events: [],
    });

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Eventos', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
        await loadEvents();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(currentMonth, async () => {
      await loadEvents();
    });

    const loadEvents = async () => {
      let response: any = {};
      let params: any = {};

      if (!currentMonth.value) {
        const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const lastDayOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
        params = { starDate: firstDayOfMonth, endDate: lastDayOfMonth };
      } else {
        params = {
          starDate: currentMonth.value.firstDayOfMonth,
          endDate: currentMonth.value.lastDayOfMonth,
        };
      }

      response = await getMyEventsService.run(params);
      const combinedEvents = [];

      if (response.events !== null) {
    for (let i = 0; i < response.events.length; i++) {
      combinedEvents.push({
        title: response.events[i].name,
        allDay: response.events[i].isAllDay ? true : false,
        start: response.events[i].startDate,
        end: response.events[i].endDate,
        backgroundColor: response.events[i].color,
        borderColor: response.events[i].color,
        description: response.events[i].description,
        extendedProps: { ...response.events[i] },
      });
    }
  }

      for (let i = 0; i < response.institutionalActivities.length; i++) {
        combinedEvents.push({
          title: response.institutionalActivities[i].title,
          allDay: response.institutionalActivities[i].allDay ? true : false,
          start: response.institutionalActivities[i].startDate,
          end: response.institutionalActivities[i].endDate,
          backgroundColor: response.institutionalActivities[i].color,
          borderColor: response.institutionalActivities[i].color,
          description: response.institutionalActivities[i].objective,
          extendedProps: { ...response.institutionalActivities[i] },
        });
      }

      calendarOptions.value.events = combinedEvents;
    };

    const openAgendaModal = (data: any | null = null) => {
      if (!data) {
        const currentDateTime = dayjs().format('YYYY-MM-DD HH:mm');
        const endDateTime = dayjs().add(1, 'hour').format('YYYY-MM-DD HH:mm');
        currentEvent.value = {
          startDate: currentDateTime,
          endDate: endDateTime,
          isAllDay: false,
        };
      } else {
        console.log('Data passed to modal:', data);
        currentEvent.value = data;
      }
      agendaModal.value = true;
    };

    const closeAgendaModal = async (id: any) => {
      agendaModal.value = false;
      await loadEvents();
    };

    return {
      loading,
      routes,
      title,
      t,
      calendarOptions,
      currentEvent,
      currentMonth,
      agendaModal,
      events,
      institutionalActivities,
      closeAgendaModal,
      openAgendaModal,
    };
  },
});
</script>
<style scoped></style>
