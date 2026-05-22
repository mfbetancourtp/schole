<template>
  <AppBaseList>
    <template #actions>
      <AppButton style="color: white" icon="magic" label="Generar Horario" @click="openGenerateModal" />
    </template>

    <template #content>
      <AppLoading v-if="statsLoading" />
      <template v-else>
        <!-- Stats Cards -->
        <div class="container-cards mb-3">
          <AppCardDashboard>
            <template #title><span>Total Horarios</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ totalTimetables }}</h3>
                <AppIcon icon="calendar-alt" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard>
            <template #title><span>Publicados</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ publishedCount }}</h3>
                <AppIcon icon="check-circle" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard>
            <template #title><span>Borradores</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ draftCount }}</h3>
                <AppIcon icon="edit" />
              </div>
            </template>
          </AppCardDashboard>

          <AppCardDashboard>
            <template #title><span>Clases Asignadas</span></template>
            <template #body>
              <div class="card-graph">
                <h3>{{ totalClasses }}</h3>
                <AppIcon icon="graduation-cap" />
              </div>
            </template>
          </AppCardDashboard>
        </div>

        <!-- DataTable -->
        <AppDatatable :service="tableService" name="smartClassroom.timetables" :key="reloadKey">
          <AppDatatableColumn label="Nombre" field="name" :sortable="true" v-slot="{ row }">
            {{ row.name }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Departamento" field="department" :sortable="true" v-slot="{ row }">
            {{ row.department || '-' }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Semestre" field="semester" :sortable="true" v-slot="{ row }">
            {{ row.semester }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Año" field="year" :sortable="true" v-slot="{ row }">
            {{ row.year || '-' }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Estado" field="status" v-slot="{ row }">
            <span :class="['badge', row.status === 'published' ? 'bg-success' : 'bg-warning text-dark']">
              {{ row.status === 'published' ? 'Publicado' : 'Borrador' }}
            </span>
          </AppDatatableColumn>
          <AppDatatableColumn label="Clases" field="schedule" v-slot="{ row }">
            {{ Array.isArray(row.schedule) ? row.schedule.length : 0 }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Fecha Creación" field="createdAt" :sortable="true" v-slot="{ row }">
            {{
              row.createdAt
                ? new Date(row.createdAt).toLocaleDateString('es-GT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'
            }}
          </AppDatatableColumn>
          <AppDatatableColumn label="Acciones" field="actions" v-slot="{ row }">
            <AppButton
              variant="primary"
              icon="eye"
              size="sm"
              outlined
              :to="{
                name: 'smartClassroom.scheduleView',
                params: { id: row._id },
              }"
            />
          </AppDatatableColumn>
        </AppDatatable>
      </template>

      <!-- Modal: Generar Horario -->
      <AppModal v-model="isModalOpen" size="md">
        <AppFormModal title="Generar Horario">
          <template #content>
            <div class="mb-3">
              <label class="form-label fw-semibold">Departamento <span class="text-danger">*</span></label>
              <AppAutocomplete v-model="formData.department" :options="departments" label="name" :reduce="(d: any) => d.name" @search="searchDepartments" />
            </div>
            <div class="row">
              <div class="col-6">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Semestre <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" v-model="formData.semester" placeholder="Ej: 1" />
                </div>
              </div>
              <div class="col-6">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Año Académico <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" v-model="formData.academicYear" placeholder="Ej: 2026" />
                </div>
              </div>
            </div>
          </template>
          <template #actions>
            <AppButton variant="primary" label="Generar" icon="magic" :outlined="false" @click="handleGenerate" />
          </template>
        </AppFormModal>
      </AppModal>

      <!-- Modal: Generando -->
      <AppModal v-model="isGenerating">
        <div class="text-center py-5 px-4">
          <div class="generating-spinner mx-auto mb-3"></div>
          <h6 class="fw-bold mb-2">Generando horario...</h6>
          <p class="text-muted small mb-0">La IA está optimizando las asignaciones. Este proceso puede tardar unos segundos.</p>
        </div>
      </AppModal>

      <!-- Modal: Resultado -->
      <AppModal v-model="showResultModal" size="sm">
        <div class="text-center py-4 px-4">
          <div class="result-icon mx-auto mb-3" :class="resultType === 'success' ? 'result-success' : 'result-error'">
            <AppIcon :icon="resultType === 'success' ? 'check-circle' : 'times-circle'" />
          </div>
          <p class="text-muted mb-4">{{ resultMessage }}</p>
          <AppButton :variant="resultType === 'success' ? 'success' : 'danger'" label="Aceptar" :outlined="false" @click="showResultModal = false" />
        </div>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { debounce } from 'ts-debounce';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetAllTimetablesService } from '../services/getAllTimetables.service';
import { GenerateTimetableService } from '../services/generateTimetable.service';
import { GetTimetablesForTableService } from '../services/getTimetablesForTable.service';
import { GetDepartmentsForSelectService } from '../services/getDepartmentsForSelect.service';
import type { Timetable } from '../dtos';

const headerStore = useHeaderStore();
const tableService = new GetTimetablesForTableService();
const getAllTimetablesService = new GetAllTimetablesService();
const generateTimetableService = new GenerateTimetableService();
const getDepartmentsForSelectService = new GetDepartmentsForSelectService();

// State
const reloadKey = ref(0);
const statsLoading = ref(true);
const timetableList = ref<Timetable[]>([]);
const isModalOpen = ref(false);
const isGenerating = ref(false);
const showResultModal = ref(false);
const resultType = ref<'success' | 'error'>('success');
const resultMessage = ref('');
const formData = ref({ department: '', semester: '', academicYear: '' });

// Departamentos
const departments = ref<any[]>([]);

function normalizeDepts(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

const loadDepartments = async (search?: string) => {
  try {
    const params = search && search.length >= 2 ? { search } : {};
    const response = await getDepartmentsForSelectService.run(params);
    departments.value = normalizeDepts(response);
  } catch (e) {
    console.error('Error cargando departamentos:', e);
  }
};

const searchDepartments = debounce((search: string, loading: Function) => {
  loading(true);
  loadDepartments(search).finally(() => loading(false));
}, 500);

// Stats
const totalTimetables = computed(() => timetableList.value.length);
const publishedCount = computed(() => timetableList.value.filter((t) => t.status === 'published').length);
const draftCount = computed(() => timetableList.value.filter((t) => t.status === 'draft').length);
const totalClasses = computed(() => timetableList.value.reduce((a, t) => a + (t.schedule?.length || 0), 0));

const loadStats = async () => {
  try {
    statsLoading.value = true;
    timetableList.value = await getAllTimetablesService.run();
  } catch (err) {
    console.error('Error loading timetable stats:', err);
  } finally {
    statsLoading.value = false;
  }
};

onMounted(() => {
  headerStore.module = { name: 'Smart Classroom', url: '' };
  headerStore.moduleItem = { name: 'Horarios Generados', url: '' };
  headerStore.moduleSubItem = { name: '', url: '' };
  loadStats();
  loadDepartments();
});

// Modal
const openGenerateModal = () => {
  formData.value = { department: '', semester: '', academicYear: '' };
  loadDepartments();
  isModalOpen.value = true;
};

const handleGenerate = async () => {
  if (!formData.value.department || !formData.value.semester || !formData.value.academicYear) return;

  isModalOpen.value = false;
  isGenerating.value = true;

  try {
    await generateTimetableService.run({
      department: formData.value.department,
      semester: parseInt(formData.value.semester),
      academicYear: parseInt(formData.value.academicYear),
    });

    isGenerating.value = false;
    resultType.value = 'success';
    resultMessage.value = 'El horario se generó correctamente. Ya puedes visualizarlo en la tabla.';
    showResultModal.value = true;
    reloadKey.value++;
    loadStats();
  } catch {
    isGenerating.value = false;
    resultType.value = 'error';
    resultMessage.value = 'No se pudo generar el horario. Verifica los datos e intenta nuevamente.';
    showResultModal.value = true;
  }
};
</script>

<style scoped>
.container-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.card-graph {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.generating-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #e0e0e0;
  border-top-color: var(--primary-color, #f43f5e);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.result-success {
  background: #dcfce7;
  color: #16a34a;
}

.result-error {
  background: #fee2e2;
  color: #dc2626;
}
</style>
