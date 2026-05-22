<template>
  <div class="records-table">
    <!-- Header -->
    <div class="records-table__header">
      <AppIcon icon="clipboard-list" class="records-table__header-icon" />
      <h3 class="records-table__title">Historial de Registros</h3>
    </div>

    <!-- Tabla -->
    <div class="records-table__wrapper">
      <table class="records-table__table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>DÍA</th>
            <th>ENTRADA</th>
            <th>SALIDA</th>
            <th>TOTAL HORAS</th>
            <th>ESTADO</th>
            <th>VALIDACIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id" class="records-table__row">
            <td class="records-table__date">{{ formatDate(record.date) }}</td>
            <td>{{ record.dayName }}</td>
            <td>
              <template v-if="record.entryTime">
                <span class="records-table__time">
                  <AppIcon icon="clock" size="xs" class="records-table__time-icon" />
                  {{ record.entryTime }}
                </span>
              </template>
              <span v-else class="records-table__no-record">Sin registro</span>
            </td>
            <td>
              <template v-if="record.exitTime">
                <span class="records-table__time">
                  <AppIcon icon="clock" size="xs" class="records-table__time-icon" />
                  {{ record.exitTime }}
                </span>
              </template>
              <span v-else class="records-table__no-record">Sin registro</span>
            </td>
            <td>
              <span v-if="record.totalHours" class="records-table__hours"> {{ record.totalHours }}h </span>
              <span v-else class="records-table__no-record">—</span>
            </td>
            <td>
              <div class="records-table__status-cell">
                <span class="records-table__status-badge" :class="`records-table__status-badge--${getStatusClass(record.status)}`">
                  <AppIcon :icon="getStatusIcon(record.status)" size="xs" />
                  {{ record.status }}
                </span>
                <span v-if="record.statusDetail" class="records-table__status-detail">
                  {{ record.statusDetail }}
                </span>
              </div>
            </td>
            <td>
              <span class="records-table__validation-badge" :class="`records-table__validation-badge--${record.validation.toLowerCase()}`">
                <AppIcon :icon="record.validation === 'Validado' ? 'check-circle' : 'clock'" size="xs" />
                {{ record.validation }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { AttendanceRecordDto, AttendanceStatus } from '../dtos/attendanceRecord.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AttendanceRecordsTable',
  components: { AppIcon },

  props: {
    records: {
      type: Array as PropType<AttendanceRecordDto[]>,
      required: true,
    },
  },

  setup() {
    const formatDate = (dateStr: string): string => {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const getStatusClass = (status: AttendanceStatus): string => {
      const map: Record<AttendanceStatus, string> = {
        Puntual: 'success',
        Tardanza: 'warning',
        Falta: 'danger',
        Justificado: 'info',
      };
      return map[status] ?? 'default';
    };

    const getStatusIcon = (status: AttendanceStatus): string => {
      const map: Record<AttendanceStatus, string> = {
        Puntual: 'check-circle',
        Tardanza: 'exclamation-circle',
        Falta: 'times-circle',
        Justificado: 'check-double',
      };
      return map[status] ?? 'circle';
    };

    return { formatDate, getStatusClass, getStatusIcon };
  },
});
</script>

<style scoped>
.records-table {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 0 2px rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12);
  padding: 1.5rem;
  /* Added padding to container */
  position: relative;
}

.records-table__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  /* Replaced padding with margin */
}

.records-table__header-icon {
  color: #637381;
  font-size: 1rem;
}

.records-table__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.records-table__wrapper {
  overflow-x: auto;
}

.records-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.records-table__table thead th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f0f2f5;
  white-space: nowrap;
}

.records-table__table tbody td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f4f6f8;
  color: #212b36;
  vertical-align: middle;
}

.records-table__row:hover {
  background-color: #f9fafb;
}

.records-table__row:last-child td {
  border-bottom: none;
}

.records-table__date {
  font-weight: 600;
  white-space: nowrap;
}

.records-table__time {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.records-table__time-icon {
  color: #919eab;
}

.records-table__no-record {
  color: #c4cdd5;
  font-style: italic;
  font-size: 0.82rem;
}

.records-table__hours {
  font-weight: 700;
  color: var(--color-primary, #1877f2);
}

.records-table__status-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* ─── Status Badges ─── */
.records-table__status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
  width: fit-content;
}

.records-table__status-badge--success {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.records-table__status-badge--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.records-table__status-badge--danger {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.records-table__status-badge--info {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.records-table__status-detail {
  font-size: 0.72rem;
  color: #919eab;
}

/* ─── Validation Badges ─── */
.records-table__validation-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
}

.records-table__validation-badge--validado {
  background: rgba(34, 197, 94, 0.08);
  color: #16a34a;
}

.records-table__validation-badge--pendiente {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

@media (max-width: 768px) {
  .records-table__table {
    font-size: 0.78rem;
  }

  .records-table__table thead th,
  .records-table__table tbody td {
    padding: 0.6rem 0.6rem;
  }
}
</style>
