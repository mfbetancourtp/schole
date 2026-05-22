<template>
  <AppBaseList title="Tipos de Convenio">
    <template #actions>
      <AppCheckPermission permission="institutionalAgreements.typesAgreements.create">
        <AppButton variant="primary" @click="openCreate" class="btnAdd">
          <AppIcon icon="plus" />
          Crear Tipo de Convenio
        </AppButton>
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="typesAgreementsPage">
        <!-- Encabezado de sección -->
        <div>
          <h1 class="h3 mb-0">Tipos de Convenio</h1>
          <p class="small text-muted">
            Administre los tipos de convenios institucionales y su
            <span class="fw-medium" style="color: var(--color-primary)">configuración de campos</span>
          </p>
        </div>

        <!-- Tabla -->
        <AppDatatable name="types-agreements" :service="getAgreementTypesService" :params="params">
          <template #filters>
            <AppFilter v-model="statusFilter" :filter-name="`types-agreements.isActive`">
              <label>Estado</label>
              <AppAutocomplete
                :options="[
                  { label: 'Activo', value: 1 },
                  { label: 'Inactivo', value: 0 },
                ]"
                :reduce="(option: any) => option.value"
                label="label"
                v-model="statusFilter"
                input-id="statusFilter"
              />
            </AppFilter>
          </template>

          <AppDatatableColumn field="code" label="Código" sortable v-slot="props">
            <span class="codeCell">{{ props.row.code }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="name" label="Nombre del Tipo" sortable v-slot="props">
            <span class="nameCell__text">{{ props.row.name }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="description" label="Descripción" v-slot="props">
            <span class="descriptionCell">{{ props.row.description }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="activeSections" label="Campos Configurados" sortable position="centered" width="140" v-slot="props">
            <span class="activeFieldsCell">{{ props.row.activeSections }} campos</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="agreements" label="Convenios" sortable position="centered" width="100" v-slot="props">
            <span class="agreementsCell">{{ props.row.agreements || 0 }}</span>
          </AppDatatableColumn>

          <AppDatatableColumn field="isActive" label="Estado" sortable position="centered" v-slot="props">
            <span class="statusBadge" :class="props.row.isActive === 1 || props.row.isActive === 'Activo' ? 'statusBadge--active' : 'statusBadge--inactive'">
              {{ props.row.isActive === 1 || props.row.isActive === 'Activo' ? 'Activo' : 'Inactivo' }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn label="Acciones" position="centered" v-slot="props">
            <div class="actionsCell">
              <AppButton outlined icon="eye" v-tooltip="'Ver configuración'" @click="openViewConfig(props.row)" />
              <AppCheckPermission permission="institutionalAgreements.typesAgreements.edit">
                <AppButton outlined icon="pencil-alt" v-tooltip="'Editar'" @click="editType(props.row)" />
              </AppCheckPermission>
              <AppCheckPermission permission="institutionalAgreements.typesAgreements.update">
                <AppButton
                  v-if="props.row.isActive === 1 || props.row.isActive === 'Activo'"
                  outlined
                  icon="ban"
                  class="btnAction--warning"
                  v-tooltip="'Desactivar'"
                  @click="toggleStatus(props.row)"
                />
                <AppButton v-else outlined icon="check" class="btnAction--success" v-tooltip="'Activar'" @click="toggleStatus(props.row)" />
              </AppCheckPermission>
              <AppCheckPermission permission="institutionalAgreements.typesAgreements.delete">
                <AppButton outlined icon="trash" class="btnAction--danger" v-tooltip="'Eliminar'" @click="openDeleteModal(props.row)" />
              </AppCheckPermission>
            </div>
          </AppDatatableColumn>
        </AppDatatable>

        <!-- Modal: Ver configuración (solo lectura) -->
        <AppModal v-model="viewConfigModal" size="lg">
          <AppLoading v-if="viewConfigLoading" />
          <FieldConfigViewModal v-else-if="viewConfigModal && currentType" :data="currentType" />
        </AppModal>

        <!-- Modal: Confirmar eliminación -->
        <AppModal v-model="deleteModal">
          <AppConfirmDeleteModal v-if="deleteModal" entity="tipo de convenio" @confirmDelete="deleteType" />
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRouter } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import FieldConfigViewModal from '../components/FieldConfigViewModal.vue';

import { AgreementTypeDto } from '../dtos/agreementType.dto';
import { GetAgreementTypesService } from '../services/getAgreementTypes.service';
import { GetAgreementTypeByIdService } from '../services/getAgreementTypeById.service';
import { DeleteAgreementTypeService } from '../services/deleteAgreementType.service';
import { CreateOrUpdateAgreementTypeService } from '../services/createOrUpdateAgreementType.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAgreementTypesService = new GetAgreementTypesService();
const getAgreementTypeByIdService = new GetAgreementTypeByIdService();
const deleteAgreementTypeService = new DeleteAgreementTypeService();
const createOrUpdateAgreementTypeService = new CreateOrUpdateAgreementTypeService();

export default defineComponent({
  name: 'TypesAgreementsPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppDatatable,
    AppDatatableColumn,
    AppModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppFilter,
    AppAutocomplete,
    FieldConfigViewModal,
  },
  setup() {
    const router = useRouter();
    const title = 'Tipos de Convenio';
    useMeta({ title });

    const loading = ref(false);
    const statusFilter = ref<number | ''>('');
    const params = computed(() => ({
      isActive: statusFilter.value !== '' ? statusFilter.value : undefined,
    }));

    const viewConfigModal = ref(false);
    const viewConfigLoading = ref(false);
    const deleteModal = ref(false);
    const currentType = ref<AgreementTypeDto | null>(null);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = {
          name: 'Acuerdos Institucionales',
          url: 'institutionalAgreements',
        };
        headerStorage.moduleItem = {
          name: 'Tipos de Convenio',
          url: 'institutionalAgreements.typesAgreements',
        };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.error('Error setting header:', e);
      }
    });

    const openViewConfig = async (row: AgreementTypeDto) => {
      try {
        viewConfigLoading.value = true;
        const fullData = await getAgreementTypeByIdService.run(row.id);

        // Deduplicar campos por nombre dentro de cada sección
        // (el backend puede tener registros duplicados por saves incorrectos previos)
        if (fullData.sections) {
          fullData.sections = fullData.sections.map((section: any) => {
            const fieldMap = new Map<string, any>();
            (section.fields || []).forEach((field: any) => {
              const key = (field.name || '').trim().toLowerCase();
              const isVisible = field.visible === 1 || field.visible === true;
              if (!fieldMap.has(key) || isVisible) fieldMap.set(key, field);
            });
            return { ...section, fields: Array.from(fieldMap.values()) };
          });
        }

        currentType.value = fullData;
        viewConfigModal.value = true;
      } catch (error) {
        console.error('Error loading agreement type configuration:', error);
      } finally {
        viewConfigLoading.value = false;
      }
    };

    const editType = (row: AgreementTypeDto) => {
      router.push({
        name: 'institutionalAgreements.typesAgreements.edit',
        params: { id: row.id },
      });
    };

    const toggleStatus = async (row: AgreementTypeDto) => {
      const currentStatus = row.isActive === 1 || row.isActive === 'Activo' ? 1 : 0;
      const newStatus = currentStatus === 1 ? 0 : 1;
      try {
        await createOrUpdateAgreementTypeService.run({ isActive: newStatus } as any, Number(row.id));
        (row as any).isActive = newStatus;
      } catch {
        // interceptor maneja el toast de error
      }
    };

    const openDeleteModal = (row: AgreementTypeDto) => {
      currentType.value = row;
      deleteModal.value = true;
    };

    const deleteType = async () => {
      if (!currentType.value) return;
      try {
        await deleteAgreementTypeService.run(currentType.value.id);
        document.dispatchEvent(new Event('updateDatatable'));
      } catch {
        // interceptor maneja el toast de error
      } finally {
        deleteModal.value = false;
        currentType.value = null;
      }
    };

    const openCreate = () => {
      router.push({ name: 'institutionalAgreements.typesAgreements.create' });
    };

    return {
      title,
      loading,
      statusFilter,
      params,
      getAgreementTypesService,
      viewConfigModal,
      viewConfigLoading,
      deleteModal,
      currentType,
      toggleStatus,
      openViewConfig,
      editType,
      openDeleteModal,
      deleteType,
      openCreate,
    };
  },
});
</script>

<style scoped>
.typesAgreementsPage {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btnAdd {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

/* Celdas de tabla */
.codeCell {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--color-primary);
}

.nameCell__text {
  font-size: 0.92rem;
  color: var(--color-dark, #111827);
}

.descriptionCell {
  font-size: 0.85rem;
  color: var(--color-gray-600, #6b7280);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 280px;
}

.activeFieldsCell {
  font-size: 0.85rem;
  color: var(--color-gray-600, #6b7280);
}

/* ── Status badge ────────────────────────────────────────────────────── */
.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.statusBadge--active {
  background: #dcfce7;
  color: #16a34a;
}

.statusBadge--inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.circleCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 700;
}

/* Acciones */
.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.btnAction--warning {
  border-color: #fde68a;
  color: #d97706;
}

.btnAction--success {
  border-color: #bbf7d0;
  color: #16a34a;
}

.btnAction--danger {
  border-color: #fecaca;
  color: #dc2626;
}

@media (max-width: 768px) {
  .actionsCell {
    justify-content: flex-start;
  }
}
</style>
