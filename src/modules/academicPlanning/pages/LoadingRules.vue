<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton style="color: white" variant="primary" @click="openRuleDrawer()">
        <AppIcon icon="plus" class="me-2" />
        Nueva regla
      </AppButton>
    </template>

    <template #content>
      <div class="loadingRules">
        <div class="row g-3 mb-3">
          <div v-for="card in summaryCards" :key="card.label" class="col-12 col-md-4">
            <AppStatCard :label="card.label" :value="card.value" :caption="card.caption" :variant="card.variant" />
          </div>
        </div>

        <section class="loadingRules__info">
          <AppIcon icon="info-circle" class="loadingRules__infoIcon" />

          <div>
            <h4>¿Cómo funcionan las reglas?</h4>
            <p>
              Las reglas activas se aplican automáticamente durante la asignación de carga. Sirven para validar los límites permitidos por tipo de contrato y destacar configuraciones fuera del rango
              esperado.
            </p>
          </div>
        </section>

        <div class="mt-3">
          <AppDatatable
            name="academic-planning-loading-rules"
            :service="getContractTypeRulesService"
            :params="params"
            :default-per-page="10"
            default-sort="id"
            default-sort-direction="asc"
            :show-filter-steps="true"
          >
            <template #additionalContent>
              <div class="loadingRules__tableTitle">
                <div>
                  <AppIcon icon="balance-scale" class="me-2" />
                  Reglas configuradas
                </div>

                <AppBadge :label="`${contractTypesStats?.total ?? 0} reglas`" variant="ghost" />
              </div>
            </template>

            <template #filters>
              <AppFilter v-model="selectedState" filter-name="loading-rules.state">
                <AppFormField label="Estado">
                  <AppAutocomplete
                    input-id="loading-rules-state"
                    :options="ruleStateOptions"
                    label="name"
                    :reduce="(option: SelectOption<'all' | 'active' | 'inactive'>) => option.id"
                    :clearable="false"
                    :append-to-body="false"
                    placeholder="Estado"
                    v-model="selectedState"
                  />
                </AppFormField>
              </AppFilter>
            </template>

            <AppDatatableColumn label="Tipo de contrato" field="name" sortable v-slot="{ row }">
              <div class="loadingRules__contract">
                <span
                  class="loadingRules__contractDot"
                  :class="{
                    'loadingRules__contractDot--inactive': !row.isActive,
                  }"
                ></span>
                <span class="fw-semibold">{{ row.name }}</span>
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn label="Horas permitidas" field="maxHours" sortable v-slot="{ row }">
              <div class="loadingRules__hours">
                <span>{{ row.minHours }}h - {{ row.maxHours }}h</span>
                <div class="loadingRules__progress">
                  <div
                    class="loadingRules__progressBar"
                    :style="{
                      width: `${Math.min((row.maxHours / 40) * 100, 100)}%`,
                    }"
                  ></div>
                </div>
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn label="Descripción" field="description" sortable v-slot="{ row }">
              <p class="loadingRules__description">{{ row.description }}</p>
            </AppDatatableColumn>

            <AppDatatableColumn label="Estado" field="isActive" v-slot="{ row }">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" :id="`rule-status-${row.id}`" :checked="row.isActive" @change="toggleRuleState(row)" />
                <label class="form-check-label" :for="`rule-status-${row.id}`">
                  {{ row.isActive ? 'Activa' : 'Inactiva' }}
                </label>
              </div>
            </AppDatatableColumn>

            <AppDatatableColumn label="Acciones" v-slot="{ row }">
              <AppButtonGroup size="sm">
                <AppButtonEdit @click="openRuleDrawer(row)" />
                <AppButtonDelete @click="openDeleteConfirm(row)" />
              </AppButtonGroup>
            </AppDatatableColumn>
          </AppDatatable>
        </div>
      </div>

      <AppDrawer :isVisible="isRuleDrawerVisible" size="md" @update:isVisible="isRuleDrawerVisible = $event">
        <template #head>
          <AppDrawerHeader
            class="ms-2 pt-2"
            :variant="editingRule ? 'edit' : 'create'"
            :icon="editingRule ? 'edit' : 'balance-scale'"
            :title="editingRule ? 'Editar regla de carga' : 'Nueva regla de carga'"
            :subtitle="editingRule ? 'Ajusta el rango permitido y la descripción operativa de la regla.' : 'Define los límites y criterios de validación por tipo de contrato.'"
          />
        </template>

        <template #body>
          <div class="loadingRules__form px-4 py-4">
            <AppFormField :formControl="v$.form.tipoContrato" label="Tipo de contrato">
              <AppInput v-model="v$.form.tipoContrato.$model" placeholder="Ej: Tiempo Completo, Medio Tiempo, Cátedra" />
            </AppFormField>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <AppFormField :formControl="v$.form.horasMinimas" label="Horas mínimas">
                  <div class="loadingRules__numberWrap">
                    <input v-model="v$.form.horasMinimas.$model" type="number" min="0" class="form-control" placeholder="0" />
                  </div>
                </AppFormField>
              </div>

              <div class="col-12 col-md-6">
                <AppFormField :formControl="v$.form.horasMaximas" label="Horas máximas">
                  <div class="loadingRules__numberWrap">
                    <input v-model="v$.form.horasMaximas.$model" type="number" min="0" class="form-control" placeholder="0" />
                  </div>
                </AppFormField>
              </div>
            </div>

            <section v-if="showRangePreview" class="loadingRules__preview mb-2">
              <small>Vista previa del rango</small>
              <div class="loadingRules__previewBar">
                <span>{{ form.horasMinimas }}h</span>
                <div class="loadingRules__progress">
                  <div
                    class="loadingRules__progressBar"
                    :style="{
                      width: `${Math.min((parsedHorasMaximas / 40) * 100, 100)}%`,
                    }"
                  ></div>
                </div>
                <span>{{ form.horasMaximas }}h</span>
              </div>
            </section>

            <AppFormField :formControl="v$.form.descripcion" label="Descripción">
              <textarea v-model="v$.form.descripcion.$model" rows="4" class="form-control" placeholder="Describe cómo se aplica esta regla y qué valida el sistema."></textarea>
            </AppFormField>

            <div class="loadingRules__activeBlock">
              <div>
                <strong>Estado de la regla</strong>
                <p>Las reglas activas se aplican automáticamente durante la asignación de carga.</p>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="rule-form-active" :checked="form.activa" @change="form.activa = !form.activa" />
                <label class="form-check-label" for="rule-form-active">
                  {{ form.activa ? 'Activa' : 'Inactiva' }}
                </label>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="loadingRules__footer">
            <AppButton variant="primary" outlined :disabled="isSaving" @click="isRuleDrawerVisible = false">Cancelar</AppButton>
            <AppButton variant="primary" :loading="isSaving" @click="saveRule">Guardar regla</AppButton>
          </div>
        </template>
      </AppDrawer>

      <AppModal v-model="isDeleteModalVisible">
        <AppConfirmDeleteModal entity="regla de carga" @confirmDelete="confirmDeleteRule" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import type { AcademicLoadContractType, ContractTypesStatsData, SelectOption } from '../dtos/academicLoadManagement.dto';
import { GetContractTypesStatsService } from '../services/getContractTypesStats.service';
import { GetContractTypeRulesService } from '../services/getContractTypeRules.service';
import { CreateOrUpdateContractTypeRuleService } from '../services/createOrUpdateContractTypeRule.service';
import { DeleteContractTypeRuleService } from '../services/deleteContractTypeRule.service';
import { useHeaderStore } from '../../../stores/header.store';

const getContractTypesStatsService = new GetContractTypesStatsService();
const getContractTypeRulesService = new GetContractTypeRulesService();
const createOrUpdateContractTypeRuleService = new CreateOrUpdateContractTypeRuleService();
const deleteContractTypeRuleService = new DeleteContractTypeRuleService();

type RuleForm = {
  tipoContrato: string;
  horasMaximas: string;
  horasMinimas: string;
  descripcion: string;
  activa: boolean;
};

const getDefaultForm = (): RuleForm => ({
  tipoContrato: '',
  horasMaximas: '',
  horasMinimas: '',
  descripcion: '',
  activa: true,
});

export default defineComponent({
  name: 'LoadingRulesPage',
  components: {
    AppBadge,
    AppBaseList,
    AppButton,
    AppButtonDelete,
    AppButtonEdit,
    AppButtonGroup,
    AppStatCard,
    AppConfirmDeleteModal,
    AppDatatable,
    AppDatatableColumn,
    AppDrawer,
    AppDrawerHeader,
    AppFilter,
    AppAutocomplete,
    AppFormField,
    AppIcon,
    AppInput,
    AppModal,
  },
  setup() {
    const { t } = useI18n();
    const title = 'Reglas de carga académica';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const headerStorage = useHeaderStore();

    const contractTypesStats = ref<ContractTypesStatsData | null>(null);
    const editingRule = ref<AcademicLoadContractType | null>(null);
    const ruleToDelete = ref<AcademicLoadContractType | null>(null);
    const isRuleDrawerVisible = ref(false);
    const isDeleteModalVisible = ref(false);
    const isSaving = ref(false);
    const selectedState = ref<'all' | 'active' | 'inactive'>('all');
    const form = reactive<RuleForm>(getDefaultForm());

    const parsedHorasMinimas = computed(() => parseInt(form.horasMinimas || '0', 10));
    const parsedHorasMaximas = computed(() => parseInt(form.horasMaximas || '0', 10));
    const showRangePreview = computed(() => parsedHorasMinimas.value > 0 && parsedHorasMaximas.value > 0);

    const validationRules = computed(() => ({
      form: {
        tipoContrato: { required },
        horasMinimas: { required },
        horasMaximas: {
          required,
        },
        descripcion: { required },
      },
    }));

    const v$ = useVuelidate(validationRules, { form });

    const loadContractTypesStats = async () => {
      try {
        const response = await getContractTypesStatsService.run({});
        contractTypesStats.value = response.data;
        console.log('jasdsa', contractTypesStats.value);
      } catch (error) {
        console.log(error);
        contractTypesStats.value = null;
      }
    };

    onMounted(async () => {
      headerStorage.module = { name: 'Planeación académica', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      await loadContractTypesStats();
    });

    const summaryCards = computed(() => [
      {
        label: 'Total de reglas',
        value: contractTypesStats.value?.total ?? 0,
        variant: 'blue',
      },
      {
        label: 'Reglas activas',
        value: contractTypesStats.value?.active ?? 0,
        variant: 'green',
      },
      {
        label: 'Reglas inactivas',
        value: contractTypesStats.value?.inactive ?? 0,
        variant: 'gray',
      },
    ]);

    const ruleStateOptions: SelectOption<'all' | 'active' | 'inactive'>[] = [
      { id: 'all', name: 'Todos los estados' },
      { id: 'active', name: 'Activas' },
      { id: 'inactive', name: 'Inactivas' },
    ];

    const params = computed(() => ({
      type: 'academic_load_rules',
      isActive: selectedState.value !== 'all' ? selectedState.value === 'active' : undefined,
    }));

    const resetForm = () => {
      Object.assign(form, getDefaultForm());
      v$.value.$reset();
    };

    const openRuleDrawer = (rule: AcademicLoadContractType | null = null) => {
      editingRule.value = rule;
      v$.value.$reset();

      if (rule) {
        form.tipoContrato = rule.name;
        form.horasMaximas = String(rule.maxHours);
        form.horasMinimas = String(rule.minHours);
        form.descripcion = rule.description;
        form.activa = rule.isActive;
      } else {
        resetForm();
      }

      isRuleDrawerVisible.value = true;
    };

    const saveRule = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      isSaving.value = true;

      try {
        await createOrUpdateContractTypeRuleService.run(
          {
            name: form.tipoContrato.trim(),
            code: form.tipoContrato.trim().toUpperCase().replace(/\s+/g, '_'),
            minHours: parsedHorasMinimas.value,
            maxHours: parsedHorasMaximas.value,
            description: form.descripcion.trim(),
            isActive: form.activa,
            type: 'academic_load_rules',
          },
          editingRule.value?.id
        );

        isRuleDrawerVisible.value = false;
        resetForm();

        document.dispatchEvent(new Event('updateDatatable'));
        await loadContractTypesStats();
      } catch (error) {
        console.log(error);
      } finally {
        isSaving.value = false;
      }
    };

    const openDeleteConfirm = (rule: AcademicLoadContractType) => {
      ruleToDelete.value = rule;
      isDeleteModalVisible.value = true;
    };

    const confirmDeleteRule = async () => {
      if (!ruleToDelete.value) return;

      try {
        await deleteContractTypeRuleService.run(ruleToDelete.value.id);

        isDeleteModalVisible.value = false;
        ruleToDelete.value = null;

        document.dispatchEvent(new Event('updateDatatable'));
        await loadContractTypesStats();
      } catch (error) {
        console.log(error);
      }
    };

    const toggleRuleState = async (row: AcademicLoadContractType) => {
      try {
        await createOrUpdateContractTypeRuleService.run(
          {
            name: row.name,
            code: row.name.toUpperCase().replace(/\s+/g, '_'),
            minHours: row.minHours,
            maxHours: row.maxHours,
            description: row.description,
            isActive: !row.isActive,
            type: 'academic_load_rules',
          },
          row.id
        );

        document.dispatchEvent(new Event('updateDatatable'));
        await loadContractTypesStats();
      } catch (error) {
        console.log(error);
      }
    };

    return {
      confirmDeleteRule,
      contractTypesStats,
      editingRule,
      form,
      getContractTypeRulesService,
      isDeleteModalVisible,
      isRuleDrawerVisible,
      isSaving,
      openDeleteConfirm,
      openRuleDrawer,
      params,
      parsedHorasMaximas,
      ruleStateOptions,
      routes,
      saveRule,
      selectedState,
      showRangePreview,
      summaryCards,
      title,
      toggleRuleState,
      v$,
    };
  },
});
</script>

<style scoped>
/* stat styles handled by AppStatCard */

.loadingRules__statValue {
  display: block;
  font-size: 2rem;
  line-height: 1.1;
  color: #0f172a;
}

.loadingRules__statCaption {
  color: #64748b;
}

.loadingRules__info {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid #bfdbfe;
  background: #eff6ff;
  padding: 0.9rem 1.15rem;
  margin: 0 -1px;
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.loadingRules__infoIcon {
  color: var(--color-primary);
  margin-top: 0.2rem;
}

.loadingRules__info h4,
.loadingRules__tableTitle {
  margin: 0;
  color: #0f172a;
}

.loadingRules__info p {
  margin: 0.35rem 0 0;
  color: #475569;
}

.loadingRules__tableTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.loadingRules__filtersPanel {
  display: grid;
  gap: 0.75rem;
}

.loadingRules__filterInput :deep(.o-form-input) {
  min-height: 44px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
}

.loadingRules__filterActions {
  display: flex;
  justify-content: flex-end;
}

.loadingRules__contract {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.loadingRules__contractDot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  background: #22c55e;
}

.loadingRules__contractDot--inactive {
  background: #94a3b8;
}

.loadingRules__hours {
  display: grid;
  gap: 0.55rem;
}

.loadingRules__description {
  margin: 0;
  color: #475569;
}

.loadingRules__progress,
.loadingRules__previewBar .loadingRules__progress {
  width: 100%;
  height: 0.55rem;
  background: rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  overflow: hidden;
}

.loadingRules__progressBar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.loadingRules__state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.loadingRules__switch {
  width: 3rem;
  height: 1.7rem;
  border-radius: 999px;
  border: none;
  background: #cbd5e1;
  padding: 0 0.2rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.loadingRules__switch span {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.loadingRules__switch--active {
  background: #22c55e;
  justify-content: flex-end;
}

.loadingRules__numberWrap {
  position: relative;
}

.loadingRules__numberWrap span {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.loadingRules__preview {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 18px;
  padding: 1rem;
}

.loadingRules__preview small {
  display: block;
  color: #1d4ed8;
  margin-bottom: 0.65rem;
}

.loadingRules__previewBar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.loadingRules__activeBlock {
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.loadingRules__activeBlock p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.loadingRules__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .loadingRules__info,
  .loadingRules__activeBlock,
  .loadingRules__tableTitle {
    flex-direction: column;
    align-items: flex-start;
  }

  .loadingRules__previewBar {
    grid-template-columns: 1fr;
  }
}
</style>
