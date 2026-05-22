<template>
  <div   ref="cal" @click="prevOrNext"></div>

  <!-- <button @click="toggleWeekends">toggle weekends</button>
  <FullCalendar :options="calendarOptions"/> -->

  <!-- <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton
        @click="openAgendaModal"
        :label="'Agregar evento'"
      ></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <AppCard v-else>
        <template #body>
          <FullCalendar
            :options="calendarOptions"
            @click="prevOrNext"
          ></FullCalendar>
        </template>
      </AppCard>

      <AppModal v-model="agendaModal" :size="'lg'">
        <AgendaForm
          v-if="agendaModal"
          :data="currentEvent"
          @close="closeAgendaModal"
        ></AgendaForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal
          v-if="modalDelete"
          entity="Evento personal"
          @confirmDelete="confirmDelete"
        ></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList> -->
</template>

<script lang="ts">
import '@fullcalendar/core/vdom' // solves problem with Vite
import { ref,defineComponent, onMounted} from 'vue';
import {Calendar} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

export default defineComponent({
  name:'myCalendar',
  setup(){
    const cal = ref(null);
    const Tcalendar: any = ref();
      
    onMounted(()=>{
      Tcalendar.value = new Calendar(cal.value, {
        plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }
        });
        Tcalendar.value.render();
    })

        const prevOrNext = (data: any) => {
      const className: string = data.target.className;

      if (className.search('fc-prev-button') >= 0 || className.search('fc-icon-chevron-left') >= 0) {
        console.log('prev');
      } else if (className.search('fc-next-button') >= 0 || className.search('fc-icon-chevron-right') >= 0) {
        console.log('next');
      } else if (className.search('fc-today-button') >= 0) {
        console.log('today');
      }

      console.log(Tcalendar.value.getDate());
    };

    return {
      prevOrNext,
      cal,      
    }
  }
})



// import '@fullcalendar/core/vdom' // solves problem with Vite
// import FullCalendar from '@fullcalendar/vue3'
// import dayGridPlugin from '@fullcalendar/daygrid'
// import interactionPlugin from '@fullcalendar/interaction'

// export default {
//   components: {
//     FullCalendar // make the <FullCalendar> tag available
//   },
//   data() {
//     return {
//       calendarOptions: {
//         plugins: [ dayGridPlugin, interactionPlugin ],
//         initialView: 'dayGridMonth',
//         weekends: false // initial value
//       }
//     }
//   },
//   methods: {
//     toggleWeekends: function() {
//       this.calendarOptions.weekends = !this.calendarOptions.weekends // toggle the boolean!
//     }
//   }
// }





// import { defineComponent, onMounted, Ref, ref } from "vue";
// import { useI18n } from 'vue-i18n';
// import { useMeta } from 'vue-meta';
// import dayjs from 'dayjs';

// import '@fullcalendar/core/vdom';
// import FullCalendar from '@fullcalendar/vue3';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGrid from '@fullcalendar/timegrid';
// import listPlugin from '@fullcalendar/list';
// import interactionPlugin from '@fullcalendar/interaction';
// import esLocale  from '@fullcalendar/core/locales/es';

// import AgendaForm from '../components/AgendaForm.vue';
// import AppCard from '../../../shared/components/Card/AppCard.vue';
// import AppLoading from "../../../shared/components/AppLoading.vue";
// import AppModal from '../../../shared/components/Modal/AppModal.vue';
// import AppBaseList from "../../../shared/components/AppBaseList.vue";
// import AppButton from '../../../shared/components/Buttons/AppButton.vue';
// import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

// import { GetMyEventsService } from "../services/getMyEvents.service";
// import { DeleteEventByIdService } from "../services/deleteEventById.service";

// const getMyEventsService = new GetMyEventsService();
// const deleteEventByIdService = new DeleteEventByIdService();

// export default defineComponent({
//   name: "Agenda",
//   components: {
//     AppConfirmDeleteModal,
//     FullCalendar,
//     AppBaseList,
//     AgendaForm,
//     AppLoading,
//     AppButton,
//     AppModal,
//     AppCard,
//   },

//   setup() {
//     const { t } = useI18n();
//     const title = 'Agenda';

//     const routes = [{ name: title }];
//     useMeta({ title: t(title) });

//     const currentEvent: Ref<any | null> = ref(null);
//     const events: Ref<any[]> = ref([]);

//     const currentEventId = ref(null);

//     const modalDelete = ref(false);
//     const agendaModal = ref(false);
//     const loading = ref(true);

//     // const events = ref([
//     //   { title: 'event 1', date: '2022-11-24' },
//     //   { title: 'event 2', date: '2022-11-22' },
//     // ]);
//         const calendarOptions = ref({
//             plugins: [ dayGridPlugin, interactionPlugin, timeGrid, listPlugin ],
//             initialView: 'dayGridMonth',
//             locales: [ esLocale],
//             selectable: true,
//             firstDay:0,
//             locale: 'es',

//             headerToolbar: {
//               start: 'prev,next today',
//               center: 'title',
//               end: 'dayGridMonth,timeGridWeek,timeGridDay,listDay',
//             },

//             // slotLabelFormat: [
//             //   { month: 'long', year: 'numeric' }, // top level of text
//             //   { weekday: 'short' } // lower level of text
//             // ],
//             // slotLabelFormat: {
//             //   hour: 'numeric',
//             //   minute: '2-digit',
//             //   omitZeroMinute: true,
//             //   meridiem: 'short'
//             // },

//             // allDaySlot: false,
//             // slotMaxTime: '12:00:00',
//             // slotMinTime: '12:00:00',
//             // slotDuration: '24:00:00',
//             dateClick: (info: any) => {
//                 console.log('dateClick', info);
//             },
//             selectionInfo: (info: any) => {
//                 console.log('selectionInfo', info);
//             },
//             unselect: (info: any) => {
//                 console.log('unselect', info);
//             },
//             select: (info: any) => {
//               const dataDate = {
//                 startDate: info.startStr,
//               };

//               openAgendaModal(dataDate);
//               console.log('select', info);
//             },
//             getEventById: ( id: any ) => {
//               console.log('getEventById', id);
//             },
//             eventClick: (eventClickInfo: any) => {
//               openAgendaModal(parseInt(eventClickInfo.event.id));
//               console.log('eventClick', eventClickInfo);
//             },

//             events: events.value,
//         });

//     onMounted(async () => {
//       try {
//         const date = new Date();
//         const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString();
//         const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

//         const params = {
//           starDate: dayjs(firstDay, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//           endDate: dayjs(lastDay, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//         }

//         events.value = await getMyEventsService.run(params);

//         await loadEvents();
//       } catch (e) {}

//       loading.value = false;
//     });

//     const loadEvents = async () => {
//       const date = new Date();
//       const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString();
//       const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

//       const params = {
//         starDate: dayjs(firstDay, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//         endDate: dayjs(lastDay, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//       }

//       events.value = await getMyEventsService.run(params);
//       calendarOptions.value.events = [];

//       events.value.forEach(event => {
//         calendarOptions.value.events.push({
//           id: event.id,
//           title: event.name,
//           allDay: event.isAllDay ? true : false,
//           start: event.startDate,
//           end: event.endDate,
//           backgroundColor: event.color,
//           borderColor: event.color,
//           description: event.description,
//         })
//       });

//       console.log(calendarOptions.value);
//     };

//     const openAgendaModal = (data: any | null = null) => {
//       if (!data) {
//         currentEvent.value = null;
//       } else {
//         if (typeof(data) == 'number') {
//           currentEvent.value = data ? events.value.filter(event => event.id == data)[0] : null;
//         } else {
//           currentEvent.value = data;
//         }
//       }

//       console.log('currentEvent', currentEvent.value);

//       agendaModal.value = true;
//     };
//     const closeAgendaModal = async(id: any) => {
//       if (id) {
//         agendaModal.value = false;
//         openConfirmDelete(id);
//       } else {
//         await loadEvents();
//         agendaModal.value = false;
//       }
//     };

//     const openConfirmDelete = (id: any) => {
//             currentEventId.value = id;
//             modalDelete.value = true;
//         };
//     const confirmDelete = async () => {
//         try {
//             if (currentEventId.value) {
//                 await deleteEventByIdService.run(currentEventId.value);
//                 currentEventId.value = null;
                
//                 await loadEvents();
//             }
//         } catch (e) {}

//         modalDelete.value = false;
//     };

//     const prevOrNext = (data: any) => {
//       const className: string = data.target.className;

//       if (className.search('fc-prev-button') >= 0 || className.search('fc-icon-chevron-left') >= 0) {
//         console.log('prev');
//       } else if (className.search('fc-next-button') >= 0 || className.search('fc-icon-chevron-right') >= 0) {
//         console.log('next');
//       } else if (className.search('fc-today-button') >= 0) {
//         console.log('today');
//       }
//     };

//     return {
//       loading,
//       routes,
//       title,
//       t,

//       calendarOptions,
//       currentEvent,
//       agendaModal,
//       modalDelete,

//       closeAgendaModal,
//       openAgendaModal,
//       confirmDelete,

//       prevOrNext,
//     };
//   },
// });
</script>

<style scoped>
</style>