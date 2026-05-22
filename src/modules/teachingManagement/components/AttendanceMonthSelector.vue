<template>
  <div class="month-selector">
    <span class="month-selector__icon">
      <AppIcon icon="calendar-alt" />
    </span>
    <button class="month-selector__arrow" type="button" @click="previousMonth" aria-label="Mes anterior">
      <AppIcon icon="chevron-left" size="xs" />
    </button>
    <span class="month-selector__label">{{ formattedMonth }}</span>
    <button class="month-selector__arrow" type="button" @click="nextMonth" aria-label="Mes siguiente">
      <AppIcon icon="chevron-right" size="xs" />
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default defineComponent({
  name: 'AttendanceMonthSelector',
  components: { AppIcon },

  props: {
    initialMonth: {
      type: Number,
      default: () => new Date().getMonth(),
    },
    initialYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
  },

  emits: ['change'],

  setup(props, { emit }) {
    const currentMonth = ref(props.initialMonth);
    const currentYear = ref(props.initialYear);

    const formattedMonth = computed(() => {
      return `${MONTH_NAMES[currentMonth.value]} ${currentYear.value}`;
    });

    const emitChange = () => {
      emit('change', { month: currentMonth.value, year: currentYear.value });
    };

    const previousMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
      } else {
        currentMonth.value--;
      }
      emitChange();
    };

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
      } else {
        currentMonth.value++;
      }
      emitChange();
    };

    return { formattedMonth, previousMonth, nextMonth };
  },
});
</script>

<style scoped>
.month-selector {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  /* The grey border requested */
  padding: 0.75rem 1rem;
  user-select: none;
  min-width: 320px;
}

.month-selector__icon {
  color: #3b82f6;
  /* Azul botón */
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
}

.month-selector__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #64748b;
  /* Slate-500 */
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.month-selector__arrow:hover {
  background: rgba(145, 158, 171, 0.12);
  color: #1e293b;
}

.month-selector__label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #334155;
  /* Slate-700 */
  flex: 1;
  text-align: center;
}
</style>
