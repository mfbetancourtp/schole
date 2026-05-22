<template>
  <div class="calendar-wrapper">
    <FullCalendar :options="calendarOptions">
      <template #eventContent="arg">
        <div class="fc-event-custom-content">
          <!-- Header: Code + Status Icon -->
          <div class="fc-event-header">
            <span class="fc-event-code">{{ arg.event.title }}</span>
            <div class="fc-event-status-icon">
              <font-awesome-icon :icon="getStatusIconObj(arg.event.extendedProps.status)" />
            </div>
          </div>

          <div class="fc-event-subtitle">
            {{ arg.event.extendedProps.courseName }}
          </div>

          <div class="fc-event-details">
            <div class="fc-event-detail-row">
              <font-awesome-icon :icon="icons.faClock" class="fc-event-icon-svg" />
              <span>{{ arg.timeText }}</span>
            </div>

            <div class="fc-event-detail-row">
              <font-awesome-icon :icon="icons.faMapMarkerAlt" class="fc-event-icon-svg" />
              <span>{{ arg.event.extendedProps.location }}</span>
            </div>
          </div>

          <!-- Bottom Pill/Bar -->
          <div class="fc-event-footer-bar"></div>
        </div>
      </template>
    </FullCalendar>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import '@fullcalendar/core/vdom';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { FormatterInput } from '@fullcalendar/core';
import { ClassScheduleDto } from '../dtos/classSchedule.dto';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faClock, faMapMarkerAlt, faCheckCircle, faPlayCircle, faCircle } from '@fortawesome/free-solid-svg-icons';

// Import FullCalendar Styles
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

export default defineComponent({
  name: 'ClassScheduleGrid',
  components: {
    FullCalendar,
    FontAwesomeIcon,
  },
  props: {
    events: {
      type: Array as PropType<ClassScheduleDto[]>,
      required: true,
    },
  },
  setup(props) {
    const getStatusIconObj = (status: string) => {
      switch (status) {
        case 'Cumplida':
          return faCheckCircle;
        case 'En Curso':
          return faPlayCircle;
        case 'Pendiente':
          return faClock; // Usando reloj para pendiente como se acordó
        default:
          return faClock;
      }
    };

    const calendarEvents = computed(() => {
      return props.events.map((ev) => {
        let color = '#94a3b8'; // Default Slate
        let textColor = '#ffffff';

        if (ev.status === 'Cumplida') {
          color = '#10b981'; // Vivid Green
        } else if (ev.status === 'En Curso') {
          color = '#3b82f6'; // Bright Blue
        } else if (ev.status === 'Pendiente') {
          color = '#94a3b8'; // Slate
        }

        return {
          id: ev.id,
          title: ev.courseCode,
          start: `${ev.date}T${ev.startTime}:00`,
          end: `${ev.date}T${ev.endTime}:00`,
          backgroundColor: color,
          borderColor: color,
          textColor: textColor,
          extendedProps: {
            courseName: ev.courseName,
            location: ev.location,
            modality: ev.modality,
            status: ev.status,
          },
        };
      });
    });
    const initialDate = computed(() => props.events?.[0]?.date || '2026-02-16');

    const calendarOptions = computed(() => ({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: 'timeGridWeek',
      initialDate: initialDate.value,
      locale: esLocale,
      headerToolbar: false as const,
      allDaySlot: false as const,
      slotMinTime: '07:00:00',
      slotMaxTime: '21:00:00',
      slotDuration: '01:00:00',
      expandRows: true,
      height: 'auto',
      contentHeight: 'auto',
      dayHeaderFormat: { weekday: 'long' } as FormatterInput,
      events: calendarEvents.value,
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        meridiem: false,
      } as FormatterInput, // Fix TS error specifically here
    }));

    return {
      calendarOptions,
      getStatusIconObj,
      icons: { faClock, faMapMarkerAlt },
    };
  },
});
</script>

<style>
/* Global overrides for FullCalendar in this component context */
.calendar-wrapper {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: inherit;
}

.fc .fc-col-header-cell-cushion {
  text-transform: capitalize;
  font-weight: 700;
  color: #475569;
  padding: 1rem 0;
  text-decoration: none;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: #f1f5f9;
}

.fc-timegrid-slot-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Custom Event Styles embedded in slot */
.fc-event-custom-content {
  padding: 0.6rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  height: 100%;
  overflow: hidden;
  position: relative;
  color: white;
}

/* Ensure SVG icons are white */
.fc-event-custom-content svg,
.fc-event-custom-content .svg-inline--fa {
  color: white !important;
  fill: white !important;
}

.fc-event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.2rem;
}

.fc-event-code {
  font-weight: 800;
  font-size: 1rem;
  line-height: 1.1;
}

.fc-event-status-icon {
  font-size: 0.9rem;
}

.fc-event-subtitle {
  font-size: 0.8rem;
  opacity: 0.95;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.fc-event-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  opacity: 0.95;
}

.fc-event-detail-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
}

.fc-event-icon-svg {
  width: 12px;
  /* Fixed sizing for consistency */
}

.fc-event-footer-bar {
  margin-top: auto;
  height: 5px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  width: 35px;
}

/* Hide default fc event styles that conflict */
.fc-v-event {
  border: none !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.fc-v-event .fc-event-main {
  color: inherit;
  padding: 0;
}

.fc-timegrid-slot {
  height: 5rem !important;
}
</style>
