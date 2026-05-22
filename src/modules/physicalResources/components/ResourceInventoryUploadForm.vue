<template>
  <AppFormModal title="Carga masiva (Excel)">
    <template #content>
      <p class="tw-text-sm tw-text-gray-500 tw-mb-4">Importa múltiples recursos desde un archivo CSV/Excel. Descarga la plantilla, complétala y súbela aquí.</p>

      <!-- Upload area -->
      <div class="upload-step">
        <div class="upload-step__badge">1</div>
        <div class="upload-step__body tw-w-full">
          <p class="upload-step__title">Selecciona el archivo</p>
          <p class="upload-step__subtitle tw-mb-2">Formatos aceptados: .csv, .xlsx, .xls</p>
          <AppUploadFile v-model="uploadedFile" inputId="resource-inventory-upload" />
          <div v-if="errors.file" class="tw-text-sm tw-text-red-600 tw-mt-1">
            {{ errors.file }}
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="parsedRows.length > 0" class="preview-box tw-mt-4">
        <div class="preview-header">
          <AppIcon icon="check-circle" class="tw-text-green-600 me-1" />
          <span class="tw-text-sm tw-font-semibold tw-text-green-700">
            {{ parsedRows.length }} registro{{ parsedRows.length !== 1 ? 's' : '' }} detectado{{ parsedRows.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Estado</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in previewRows" :key="idx">
                <td>{{ row.codigo_base }}</td>
                <td>{{ row.nombre }}</td>
                <td>{{ row.marca }}</td>
                <td>{{ row.modelo }}</td>
                <td>
                  <span :class="statusCls(row.estado)">{{ row.estado }}</span>
                </td>
                <td>
                  {{ row.valor_cop ? `$ ${Number(row.valor_cop).toLocaleString('es-CO')}` : '—' }}
                </td>
              </tr>
              <tr v-if="parsedRows.length > PREVIEW_LIMIT" class="preview-more">
                <td colspan="6">
                  … y {{ parsedRows.length - PREVIEW_LIMIT }} registro{{ parsedRows.length - PREVIEW_LIMIT !== 1 ? 's' : '' }}
                  más
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Parse error -->
      <div v-if="parseError" class="parse-error tw-mt-3">
        <AppIcon icon="exclamation-circle" class="me-1" />
        {{ parseError }}
      </div>
    </template>

    <template #actions>
      <AppButton variant="primary" :disabled="!parsedRows.length || uploading" :loading="uploading" @click="upload">
        <AppIcon icon="cloud-upload-alt" class="me-1" /> Importar
        {{ parsedRows.length > 0 ? parsedRows.length + ' registros' : 'recursos' }}
      </AppButton>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppUploadFile from '../../../shared/components/Forms/AppUploadFile.vue';

const PREVIEW_LIMIT = 5;

/** Parse raw text (CSV) into array of objects keyed by header row */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] ?? '';
      });
      return obj;
    });
}

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  assigned: 'Asignado',
  maintenance: 'Mantenimiento',
  damaged: 'Dañado',
};

export default defineComponent({
  name: 'ResourceInventoryUploadForm',
  components: { AppFormModal, AppButton, AppIcon, AppUploadFile },
  emits: ['uploaded'],

  setup(_, { emit }) {
    const uploadedFile = ref<File | null>(null);
    const uploading = ref(false);
    const parsedRows = ref<Record<string, string>[]>([]);
    const parseError = ref('');
    const errors = reactive({ file: '' });

    const previewRows = computed(() => parsedRows.value.slice(0, PREVIEW_LIMIT));

    const onFileChange = (file: File | null) => {
      parsedRows.value = [];
      parseError.value = '';
      errors.file = '';
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = parseCSV(text);
          if (!rows.length) {
            parseError.value = 'El archivo no contiene registros válidos o no tiene el formato de la plantilla.';
            return;
          }
          parsedRows.value = rows;
        } catch {
          parseError.value = 'No se pudo leer el archivo. Asegúrate de usar el formato CSV de la plantilla.';
        }
      };
      reader.readAsText(file, 'UTF-8');
    };

    // Re-parse whenever a new file is selected via AppUploadFile v-model
    watch(uploadedFile, (file) => onFileChange(file ?? null));

    const upload = async () => {
      if (!parsedRows.value.length) {
        errors.file = 'Selecciona un archivo con datos para continuar.';
        return;
      }
      uploading.value = true;
      try {
        // TODO: reemplazar con servicio real de importación
        await new Promise((r) => setTimeout(r, 600));
        emit('uploaded', parsedRows.value);
      } catch {
        parseError.value = 'Ocurrió un error al importar. Intenta de nuevo.';
      }
      uploading.value = false;
    };

    const statusCls = (estado: string) => {
      const map: Record<string, string> = {
        available: 'badge-status available',
        assigned: 'badge-status assigned',
        maintenance: 'badge-status maintenance',
        damaged: 'badge-status damaged',
      };
      return map[estado] ?? 'badge-status';
    };

    return {
      uploadedFile,
      uploading,
      parsedRows,
      previewRows,
      parseError,
      errors,
      PREVIEW_LIMIT,
      upload,
      statusCls,
      STATUS_LABELS,
    };
  },
});
</script>

<style scoped>
/* Upload step */
.upload-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.upload-step__badge {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--color-primary, #3b82f6);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-step__title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e293b;
  margin: 0 0 0.15rem;
}
.upload-step__subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

/* Preview */
.preview-box {
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  overflow: hidden;
  background: #f0fdf4;
}
.preview-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid #bbf7d0;
}
.preview-table-wrap {
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.preview-table th {
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  text-align: left;
  white-space: nowrap;
  position: sticky;
  top: 0;
}
.preview-table td {
  padding: 0.3rem 0.6rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  white-space: nowrap;
}
.preview-more td {
  color: #64748b;
  font-style: italic;
}

/* Status badges in preview */
.badge-status {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.badge-status.available {
  background: #dcfce7;
  color: #16a34a;
}
.badge-status.assigned {
  background: #dbeafe;
  color: #2563eb;
}
.badge-status.maintenance {
  background: #ffedd5;
  color: #ea580c;
}
.badge-status.damaged {
  background: #fee2e2;
  color: #dc2626;
}

/* Error */
.parse-error {
  display: flex;
  align-items: center;
  font-size: 0.82rem;
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
}
</style>
