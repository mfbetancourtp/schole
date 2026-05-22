<template>
  <div class="app-table-container">
    <table class="app-custom-table">
      <thead>
        <tr>
          <slot name="head"></slot>
        </tr>
      </thead>

      <tbody>
        <slot name="body"></slot>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'AppTable',

  setup() {
    const { t } = useI18n();

    return {
      t,
    };
  },
});
</script>

<style scoped>
.app-table-container {
  position: relative;
  overflow: auto;

  width: 100%;
  max-height: 26.54rem;
  margin: 0 auto;

  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
}
.app-table-container::-webkit-scrollbar {
  width: 0.3rem;
  height: 0.3rem;
}
.app-table-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}
.app-table-container::-webkit-scrollbar-track {
  background: transparent;
}

.app-table-container .app-custom-table {
  border: 1px solid #ddd;
  border-spacing: 0;
  width: 100%;
}
.app-table-container .app-custom-table thead tr {
  background: #e3e3e3;
}
.app-table-container .app-custom-table thead tr th {
  background-color: #e3e3e3;
}
.app-table-container .app-custom-table :deep(th),
.app-table-container .app-custom-table :deep(td) {
  padding: 0.5rem;
}
.app-table-container .app-custom-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
}

:deep(tbody tr:nth-child(odd)) {
  background-color: #fff;
}
:deep(tbody tr:nth-child(even)) {
  background-color: #e9e9e9;
}

.app-table-container .app-custom-table :deep(.sticky) {
  position: sticky;
  left: 0;
  top: 0;
  z-index: 1;

  padding: 0;
}
.app-table-container .app-custom-table :deep(.sticky .sticky-div) {
  display: flex;
  align-items: center;

  min-height: max-content;
  padding-left: 0.5rem;
}
:deep(thead tr .sticky) {
  background-color: #e3e3e3;
}
:deep(tbody tr:nth-child(odd) .sticky) {
  background-color: #fff;
}
:deep(tbody tr:nth-child(even) .sticky) {
  background-color: #e9e9e9;
}
</style>
