<template>
  <div class="eval-filters">
    <!-- Search -->
    <div class="eval-filters__search">
      <label class="eval-filters__label">Buscar</label>

      <div class="eval-filters__search-wrapper">
        <input :value="search" @input="onSearch(($event.target as HTMLInputElement).value)" type="text" placeholder="Buscar por nombre..." class="eval-filters__input" />

        <span class="eval-filters__search-icon">
          <AppGetIcon name="search" />
        </span>
      </div>
    </div>

    <!-- Status -->
    <div class="eval-filters__status">
      <label class="eval-filters__label">Estado</label>

      <select :value="statusValue" @change="onStatus(($event.target as HTMLSelectElement).value)" class="eval-filters__select">
        <option value="all">Todas</option>
        <option v-for="st in props.statuses" :key="st.key" :value="st.key">
          {{ st.label }}
        </option>
      </select>
    </div>

    <!-- Actions -->
    <div class="eval-filters__actions">
      <AppButton variant="secondary" @click="clear"> Limpiar </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

type StatusFilter = string | null;

const props = defineProps<{
  search: string;
  status?: StatusFilter;
  statuses?: Array<{ label: string; key: string }>;
}>();

const emit = defineEmits<{
  (e: 'update:search', value: string): void;
  (e: 'update:status', value: StatusFilter): void;
}>();

const statusValue = computed(() => {
  if (props.status === null || props.status === undefined) return 'all';
  return props.status;
});

function onSearch(val: string) {
  emit('update:search', val);
}

function onStatus(val: string) {
  if (val === 'all') emit('update:status', null);
  else emit('update:status', val);
}

function clear() {
  emit('update:search', '');
  emit('update:status', null);
}
</script>

<style scoped lang="scss">
.eval-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(14, 30, 64, 0.06);
  padding: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.eval-filters__label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.eval-filters__search {
  width: 100%;

  @media (min-width: 768px) {
    width: 420px;
  }
}

.eval-filters__search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.eval-filters__input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 16px 10px 16px;
  padding-right: 40px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #d1d5db;
    box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.3);
  }
}

.eval-filters__search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.eval-filters__status {
  width: 100%;

  @media (min-width: 768px) {
    width: 260px;
  }
}

.eval-filters__select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #1f2937;
  background-color: #ffffff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #d1d5db;
    box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.3);
  }

  option {
    color: #1f2937;
    background: #ffffff;
  }
}

.eval-filters__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }
}
</style>
