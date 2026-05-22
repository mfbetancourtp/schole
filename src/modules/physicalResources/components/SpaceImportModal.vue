<template>
  <AppFormModal title="Importar espacios">
    <template #content>
      <p class="tw-text-xs tw-text-gray-500 tw-mb-4">Sube un archivo CSV con los datos de los espacios. Descarga la plantilla para ver el formato requerido.</p>

      <!-- Download template -->
      <button type="button" class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 tw-mb-4" @click="downloadTemplate">
        <i class="fas fa-download tw-text-xs"></i> Descargar plantilla
      </button>

      <!-- Drop zone -->
      <label
        class="drop-zone"
        :class="{
          'drop-zone--active': isDragging,
          'drop-zone--loaded': !!fileName,
        }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <input ref="fileInputRef" type="file" accept=".csv,.xlsx" class="tw-hidden" @change="onFileChange" />
        <div class="tw-text-center">
          <i class="fas fa-cloud-upload-alt tw-text-3xl" :class="fileName ? 'tw-text-blue-500' : 'tw-text-gray-300'"></i>
          <p class="tw-text-sm tw-text-gray-500 tw-mt-2 tw-mb-0" v-if="!fileName">
            Arrastra tu archivo aquí o
            <span class="tw-text-blue-500 tw-font-medium">haz clic para seleccionar</span>
          </p>
          <p class="tw-text-sm tw-font-medium tw-text-blue-600 tw-mt-2 tw-mb-0" v-else><i class="fas fa-file-csv tw-mr-1"></i>{{ fileName }}</p>
          <p class="tw-text-xs tw-text-gray-400 tw-mt-1 tw-mb-0">CSV o Excel (.xlsx) — máx. 5 MB</p>
        </div>
      </label>

      <!-- Parse error -->
      <div v-if="parseError" class="alert alert-danger py-2 px-3 tw-mt-3 tw-text-sm"><i class="fas fa-exclamation-circle tw-mr-1"></i> {{ parseError }}</div>

      <!-- Preview table -->
      <div v-if="previewRows.length > 0" class="tw-mt-4">
        <div class="d-flex align-items-center justify-content-between tw-mb-2">
          <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-0">
            Vista previa
            <span class="tw-text-gray-400 tw-font-normal">({{ previewRows.length }} filas)</span>
          </p>
          <button type="button" class="tw-bg-transparent tw-border-0 tw-text-xs tw-text-gray-400" @click="clearFile"><i class="fas fa-times"></i> Limpiar</button>
        </div>
        <div class="table-responsive tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden">
          <table class="table table-sm mb-0 preview-table">
            <thead>
              <tr>
                <th v-for="col in previewCols" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in previewRows.slice(0, 5)" :key="i">
                <td v-for="col in previewCols" :key="col">
                  {{ row[col] ?? '—' }}
                </td>
              </tr>
              <tr v-if="previewRows.length > 5">
                <td :colspan="previewCols.length" class="tw-text-center tw-text-xs tw-text-gray-400 tw-py-2">+ {{ previewRows.length - 5 }} filas más...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template #actions>
      <AppButton type="button" :disabled="previewRows.length === 0" @click="handleImport">
        <i class="fas fa-file-import tw-mr-1"></i> Importar
        {{ previewRows.length > 0 ? `(${previewRows.length})` : '' }}
      </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

const TEMPLATE_HEADERS = ['codigo', 'nombre', 'tipo_espacio', 'campus', 'sede', 'edificio', 'piso', 'capacidad', 'area_m2', 'estado'];
const TEMPLATE_EXAMPLE = ['AUL-A101', 'Aula 101', 'Aula', 'Campus Central', 'Sede Principal', 'Edificio A', 'Piso 1', '40', '60.5', 'Activo'];

type CsvRow = Record<string, string>;

const parseCSV = (text: string): { headers: string[]; rows: CsvRow[] } => {
  const lines = text
    .trim()
    .split('\n')
    .filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
  return { headers, rows };
};

export default defineComponent({
  name: 'SpaceImportModal',

  components: { AppFormModal, AppButton },

  emits: ['imported'],

  setup(_props, { emit }) {
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);
    const fileName = ref('');
    const parseError = ref('');
    const previewCols = ref<string[]>([]);
    const previewRows = ref<CsvRow[]>([]);

    const processFile = (file: File) => {
      parseError.value = '';
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        parseError.value = 'Solo se aceptan archivos CSV o Excel (.xlsx).';
        return;
      }
      fileName.value = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const { headers, rows } = parseCSV(text);
          if (!headers.length) {
            parseError.value = 'El archivo está vacío o no tiene el formato correcto.';
            return;
          }
          previewCols.value = headers;
          previewRows.value = rows;
        } catch {
          parseError.value = 'Error al leer el archivo. Verifica el formato.';
        }
      };
      reader.readAsText(file, 'UTF-8');
    };

    const onFileChange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };

    const onDrop = (e: DragEvent) => {
      isDragging.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    };

    const clearFile = () => {
      fileName.value = '';
      previewCols.value = [];
      previewRows.value = [];
      parseError.value = '';
      if (fileInputRef.value) fileInputRef.value.value = '';
    };

    const downloadTemplate = () => {
      const csv = [TEMPLATE_HEADERS.join(','), TEMPLATE_EXAMPLE.join(',')].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_espacios.csv';
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleImport = () => {
      if (!previewRows.value.length) return;
      emit('imported', previewRows.value);
    };

    return {
      fileInputRef,
      isDragging,
      fileName,
      parseError,
      previewCols,
      previewRows,
      onFileChange,
      onDrop,
      clearFile,
      downloadTemplate,
      handleImport,
    };
  },
});
</script>

<style scoped>
.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  border: 2px dashed #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  padding: 1.5rem;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.drop-zone--loaded {
  border-color: #93c5fd;
  background: #f0f9ff;
}

.preview-table thead th {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #94a3b8;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
}

.preview-table tbody td {
  font-size: 0.78rem;
  color: #374151;
  padding: 0.4rem 0.75rem;
  border-top: 1px solid #f1f5f9;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
