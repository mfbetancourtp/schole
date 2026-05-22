<template>
  <div class="timetable-schedule-wrapper">
    <!-- Legend -->
    <div class="schedule-legend">
      <template v-for="(colors, roomType) in ROOM_TYPE_COLORS" :key="roomType">
        <div v-if="roomTypeCounts[roomType]" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: colors.border }"></span>
          <span class="legend-label">{{ roomType }}</span>
          <span class="legend-count">{{ roomTypeCounts[roomType] }}</span>
        </div>
      </template>
    </div>

    <!-- Calendar -->
    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { CalendarOptions, EventInput } from '@fullcalendar/core';
import type { ScheduleEntry } from '../../dtos';

const props = defineProps<{
  entries: ScheduleEntry[];
}>();

// Color palette per room type
const ROOM_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Aula tradicional': { bg: '#e0f2fe', border: '#0284c7', text: '#0c4a6e' },
  'Aula colaborativa': { bg: '#dcfce7', border: '#16a34a', text: '#14532d' },
  'Aula tecnológica o digital': {
    bg: '#f3e8ff',
    border: '#9333ea',
    text: '#581c87',
  },
  'Aula laboratorio': { bg: '#fef3c7', border: '#d97706', text: '#78350f' },
  'Aula taller': { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d' },
};

const DEFAULT_COLORS = { bg: '#f1f5f9', border: '#64748b', text: '#334155' };

// Map day name (from API) to offset from Monday (0=Mon, 1=Tue, ..., 4=Fri)
const DAY_NAME_TO_OFFSET: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

// Get Monday of current week
function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

const monday = getMondayOfCurrentWeek();

// Convert entries to calendar events
const events = computed<EventInput[]>(() => {
  return props.entries.map((entry, idx) => {
    const roomType = entry.roomType || 'Aula tradicional';
    const colors = ROOM_TYPE_COLORS[roomType] || DEFAULT_COLORS;
    const courseName = entry.courseName || entry.courseId;
    const facultyName = entry.facultyName || entry.facultyId;
    const roomName = entry.roomName || entry.roomId;

    // entry.day is a string like "Monday", "Friday", etc.
    const dayOffset = DAY_NAME_TO_OFFSET[entry.day.toLowerCase()] ?? 0;
    const eventDate = new Date(monday);
    eventDate.setDate(monday.getDate() + dayOffset);

    const [startH, startM] = entry.startTime.split(':').map(Number);
    const [endH, endM] = entry.endTime.split(':').map(Number);

    const start = new Date(eventDate);
    start.setHours(startH, startM || 0, 0, 0);

    const end = new Date(eventDate);
    end.setHours(endH, endM || 0, 0, 0);

    return {
      id: `entry-${idx}`,
      title: courseName,
      start,
      end,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: {
        faculty: facultyName,
        room: roomName,
        roomType,
        startTime: entry.startTime,
        endTime: entry.endTime,
        borderColor: colors.border,
      },
    };
  });
});

// Count entries per roomType for legend
const roomTypeCounts = computed(() => {
  const counts: Record<string, number> = {};
  props.entries.forEach((e) => {
    const rt = e.roomType || 'Aula tradicional';
    counts[rt] = (counts[rt] || 0) + 1;
  });
  return counts;
});

// Calendar options
const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [timeGridPlugin],
  initialView: 'timeGridWeek',
  initialDate: monday,
  locale: 'es',
  headerToolbar: false,
  allDaySlot: false,
  weekends: false,
  nowIndicator: true,
  scrollTime: '07:30:00',
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  slotDuration: '00:30:00',
  slotLabelInterval: '01:00:00',
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  dayHeaderFormat: { weekday: 'long' },
  height: 'auto',
  expandRows: true,
  events: events.value,
  eventContent: (arg) => {
    const { faculty, room, roomType, startTime, endTime, borderColor } = arg.event.extendedProps;
    const start = arg.event.start;
    const end = arg.event.end;
    const durationMinutes = start && end ? (end.getTime() - start.getTime()) / 60000 : 60;
    const isCompact = durationMinutes <= 45;

    if (isCompact) {
      return {
        html: `
          <div class="sc-event-content">
            <div class="sc-event-compact-row">
              <span class="sc-event-title">${arg.event.title}</span>
              <span class="sc-event-time-inline">${startTime}-${endTime}</span>
            </div>
          </div>
        `,
      };
    }

    return {
      html: `
        <div class="sc-event-content">
          <span class="sc-event-title">${arg.event.title}</span>
          <div class="sc-event-meta">
            <span class="sc-event-detail">👤 ${faculty}</span>
            <span class="sc-event-detail">📍 ${room}</span>
          </div>
          <div class="sc-event-footer">
            <span class="sc-event-badge" style="background-color: ${borderColor};">${roomType}</span>
            <span class="sc-event-time">${startTime} - ${endTime}</span>
          </div>
        </div>
      `,
    };
  },
  eventDisplay: 'block',
}));
</script>

<style scoped>
.timetable-schedule-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Legend */
.schedule-legend {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  transition: box-shadow 0.15s ease;
}

.legend-item:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.legend-count {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 0 6px;
  min-width: 18px;
  text-align: center;
  line-height: 18px;
}

/* Calendar Container */
.calendar-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
</style>

<style>
/* FullCalendar global overrides for TimetableSchedule */
.calendar-container .fc {
  font-family: inherit;
  font-size: 13px;
}

.calendar-container .fc-col-header-cell {
  padding: 12px 4px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  background: #fafafa;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

.calendar-container .fc-col-header-cell-cushion {
  padding: 0;
}

.calendar-container .fc-day-today .fc-col-header-cell-cushion {
  color: var(--primary-color, #2563eb);
  font-weight: 700;
}

.calendar-container .fc-day-today {
  background: rgba(37, 99, 235, 0.025) !important;
}

.calendar-container .fc-timegrid-slot-label {
  font-size: 11px;
  font-weight: 500;
  color: #999;
  vertical-align: top;
  padding-top: 4px !important;
}

.calendar-container .fc-timegrid-slot-label-cushion {
  padding-right: 8px;
}

.calendar-container .fc-timegrid-slot {
  height: 48px;
  border-color: #f0f0f0;
}

.calendar-container .fc-timegrid-slot-minor {
  border-top-style: dashed;
  border-color: #f5f5f5;
}

/* Event Blocks */
.calendar-container .fc-timegrid-event {
  border-radius: 8px;
  border-width: 0;
  border-left-width: 4px;
  border-left-style: solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.15s ease;
  margin-left: 1px;
  margin-right: 2px;
}

.calendar-container .fc-timegrid-event:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: scale(1.01);
  z-index: 10 !important;
}

.calendar-container .fc-event-main {
  padding: 0;
  overflow: hidden;
}

.calendar-container .fc-timegrid-event-harness {
  margin-right: 2px;
}

/* Now Indicator */
.calendar-container .fc-timegrid-now-indicator-line {
  border-color: #ef4444;
  border-width: 2px;
  z-index: 5;
}

.calendar-container .fc-timegrid-now-indicator-arrow {
  border-width: 6px;
  border-color: #ef4444;
  border-top-color: transparent;
  border-bottom-color: transparent;
  border-right-color: transparent;
  margin-top: -5px;
}

/* Scrollbar */
.calendar-container .fc-scroller {
  scrollbar-width: thin;
  scrollbar-color: #d4d4d4 transparent;
}

.calendar-container .fc-scroller::-webkit-scrollbar {
  width: 6px;
}

.calendar-container .fc-scroller::-webkit-scrollbar-track {
  background: transparent;
}

.calendar-container .fc-scroller::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 3px;
}

/* Table Borders */
.calendar-container .fc-theme-standard td,
.calendar-container .fc-theme-standard th {
  border-color: #e8e8e8;
}

.calendar-container .fc-theme-standard .fc-scrollgrid {
  border: none;
}

.calendar-container .fc-scrollgrid-section-header > th {
  border-right: none;
}

.calendar-container .fc-scrollgrid-section-body > td {
  border-bottom: none;
}

/* Event Content Styles */
.sc-event-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px 6px;
  overflow: hidden;
  height: 100%;
}

.sc-event-compact-row {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.sc-event-title {
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sc-event-time-inline {
  font-size: 9.5px;
  opacity: 0.65;
  white-space: nowrap;
  flex-shrink: 0;
}

.sc-event-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 1px;
}

.sc-event-detail {
  font-size: 10px;
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.sc-event-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  gap: 4px;
}

.sc-event-badge {
  display: inline-block;
  font-size: 8.5px;
  font-weight: 700;
  color: #fff;
  padding: 1px 7px;
  border-radius: 4px;
  line-height: 1.5;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.sc-event-time {
  font-size: 9px;
  opacity: 0.6;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-container .fc-col-header-cell {
    font-size: 11px;
    padding: 8px 2px;
  }

  .calendar-container .fc-timegrid-slot-label {
    font-size: 10px;
  }

  .calendar-container .fc-timegrid-slot {
    height: 40px;
  }

  .sc-event-title {
    font-size: 10px;
  }

  .sc-event-detail {
    font-size: 9px;
  }

  .legend-item {
    padding: 4px 8px 4px 6px;
  }

  .legend-label {
    font-size: 11px;
  }
}
</style>
