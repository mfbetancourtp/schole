<template>
  <div class="rtype-form">
    <!-- Basic Info -->
    <div class="rtype-form__card">
      <div class="rtype-form__card-header">
        <div class="rtype-form__card-icon" style="background-color: #ebf5ff">
          <AppIcon icon="file-alt" style="color: #2563eb" />
        </div>
        <h5 class="rtype-form__section-title">{{ t('INFORMACIÓN BÁSICA') }}</h5>
      </div>

      <div class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Nombre') }} *</label>
        <input v-model="form.name" type="text" class="rtype-form__input" :placeholder="t('Ej: Certificado de Notas')" />
      </div>

      <div class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Categoría') }} *</label>
        <AppSelect v-model="categoryValue" :placeholder="t('Selecciona una categoría')">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ t(cat.name) }}
          </option>
        </AppSelect>
      </div>

      <div class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Descripción') }} *</label>
        <textarea v-model="form.description" class="rtype-form__textarea" :placeholder="t('Describe este tipo de solicitud...')" rows="3"></textarea>
      </div>

      <div class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Público Objetivo') }}</label>
        <AppSelect v-model="form.targetAudience" :placeholder="t('Selecciona el público')">
          <option v-for="opt in targetAudienceOpts" :key="opt.value" :value="opt.value">
            {{ t(opt.label) }}
          </option>
        </AppSelect>
      </div>
    </div>

    <!-- Payment Config -->
    <div class="rtype-form__card">
      <div class="rtype-form__card-header">
        <div class="rtype-form__card-icon" style="background-color: #e8f5e9">
          <AppIcon icon="dollar-sign" style="color: #2e7d32" />
        </div>
        <h5 class="rtype-form__section-title">
          {{ t('CONFIGURACIÓN DE PAGO') }}
        </h5>
      </div>

      <div class="rtype-form__toggle-row">
        <div class="rtype-form__toggle-info">
          <span class="rtype-form__toggle-label">{{ t('Requiere Pago') }}</span>
          <span class="rtype-form__toggle-desc">{{ t('Esta solicitud tiene un costo asociado') }}</span>
        </div>
        <label class="rtype-form__switch">
          <input type="checkbox" v-model="form.requiresPayment" />
          <span class="rtype-form__slider"></span>
        </label>
      </div>

      <div v-if="form.requiresPayment" class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Valor (COP)') }}</label>
        <input v-model.number="form.cost" type="number" class="rtype-form__input" min="0" />
      </div>
    </div>

    <!-- Process Config -->
    <div class="rtype-form__card">
      <div class="rtype-form__card-header">
        <div class="rtype-form__card-icon" style="background-color: #f3e8ff">
          <AppIcon icon="cog" style="color: #7c3aed" />
        </div>
        <h5 class="rtype-form__section-title">
          {{ t('CONFIGURACIÓN DE PROCESO') }}
        </h5>
      </div>

      <div class="rtype-form__toggle-row">
        <div class="rtype-form__toggle-info">
          <span class="rtype-form__toggle-label">{{ t('Requiere Aprobación') }}</span>
          <span class="rtype-form__toggle-desc">{{ t('Debe ser aprobada por un administrador') }}</span>
        </div>
        <label class="rtype-form__switch">
          <input type="checkbox" v-model="form.requiresApproval" />
          <span class="rtype-form__slider"></span>
        </label>
      </div>

      <div class="rtype-form__toggle-row">
        <div class="rtype-form__toggle-info">
          <span class="rtype-form__toggle-label">{{ t('Requiere Documentos Adjuntos') }}</span>
          <span class="rtype-form__toggle-desc">{{ t('El usuario debe adjuntar documentos') }}</span>
        </div>
        <label class="rtype-form__switch">
          <input type="checkbox" v-model="form.requiresAttachments" />
          <span class="rtype-form__slider"></span>
        </label>
      </div>

      <div class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Plantilla de Documento') }}</label>
        <AppSelect v-model="form.documentTemplate" :placeholder="t('Selecciona una plantilla')">
          <option v-for="opt in documentTemplateOpts" :key="opt.value" :value="opt.value">
            {{ t(opt.label) }}
          </option>
        </AppSelect>
      </div>

      <div class="rtype-form__field">
        <label class="rtype-form__label">{{ t('Tiempo Estimado de Respuesta') }}</label>
        <input v-model="form.estimatedTime" type="text" class="rtype-form__input" :placeholder="t('Ej: 2-3 días hábiles')" />
      </div>
    </div>

    <!-- Required Documents -->
    <div v-if="form.requiresAttachments" class="rtype-form__card">
      <div class="rtype-form__card-header">
        <div class="rtype-form__card-icon" style="background-color: #ffe4e6">
          <AppIcon icon="file-alt" style="color: #e11d48" />
        </div>
        <h5 class="rtype-form__section-title">
          {{ t('DOCUMENTOS REQUERIDOS') }}
        </h5>
      </div>

      <!-- Selector + Añadir -->
      <div class="rtype-form__doc-selector-row">
        <div class="rtype-form__doc-selector">
          <label class="rtype-form__label">{{ t('Plantilla de Documento') }}</label>
          <AppSelect v-model="selectedDocumentRequiredId" :placeholder="t('Selecciona un documento')">
            <option v-for="opt in availableDocReq" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </option>
          </AppSelect>
        </div>
        <button type="button" class="rtype-form__add-doc-btn" :disabled="!selectedDocumentRequiredId" @click="addSelectedDocument">
          <AppIcon icon="plus" />
          <span>{{ t('Añadir') }}</span>
        </button>
      </div>

      <!-- Lista de documentos añadidos -->
      <div v-if="form.requiredDocuments.length" class="rtype-form__req-list">
        <div v-for="(doc, idx) in form.requiredDocuments" :key="doc.applicationDocumentRequiredId ?? idx" class="rtype-form__req-card">
          <div class="rtype-form__req-card-left">
            <div class="rtype-form__req-card-icon">
              <AppIcon icon="file-alt" />
            </div>
            <div class="rtype-form__req-card-info">
              <span class="rtype-form__req-card-name">{{ doc.name }}</span>
              <span v-if="doc.code" class="rtype-form__req-card-code">{{ doc.code }}</span>
              <span v-if="doc.description" class="rtype-form__req-card-desc">{{ doc.description }}</span>
            </div>
          </div>
          <div class="rtype-form__req-card-right">
            <div class="rtype-form__req-required-row">
              <span class="rtype-form__req-required-label">{{ t('Obligatorio') }}</span>
              <label class="rtype-form__switch">
                <input type="checkbox" v-model="doc.isRequired" />
                <span class="rtype-form__slider"></span>
              </label>
            </div>
            <button type="button" class="rtype-form__req-delete" @click="removeRequiredDocument(idx)">
              <AppIcon icon="trash" />
            </button>
          </div>
        </div>
      </div>

      <p v-else class="rtype-form__doc-empty">
        {{ t('No hay documentos añadidos. Selecciona uno del selector y haz clic en Añadir.') }}
      </p>
    </div>

    <!-- Status -->
    <div class="rtype-form__card">
      <h5 class="rtype-form__section-title">{{ t('ESTADO') }}</h5>

      <div class="rtype-form__toggle-row">
        <div class="rtype-form__toggle-info">
          <span class="rtype-form__toggle-label">{{ t('Estado') }}</span>
          <span class="rtype-form__toggle-desc">{{ t('Activar o desactivar este tipo de solicitud') }}</span>
        </div>
        <label class="rtype-form__switch">
          <input type="checkbox" v-model="form.isActive" />
          <span class="rtype-form__slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppSelect from '../../../shared/components/Forms/AppSelect.vue';
import type { RequestTypeFormData, CategoryItem, ApplicationDocumentRequiredItem } from '../dtos/requestConfiguration.dto';
import { documentTemplateOptions, processFlowOptions } from '../mocks/requestConfiguration';
import type { RoleDto } from '../../../shared/dto/role.dto';
import { RolesService } from '../../../shared/services/roles.service';
import { GetInstitutionRolesService } from '../services/getInstitutionRoles.service';
import { GetApplicationDocumentRequiredService } from '../services/getApplicatioDocumentRequiredItem.service';

const defaultForm = (): RequestTypeFormData => ({
  code: undefined,
  name: '',
  categoryId: null,
  description: '',
  targetAudience: '',
  requiresPayment: false,
  cost: 0,
  paymentMethodsId: null,
  requiresApproval: true,
  requiresAttachments: false,
  documentTemplate: '',
  documentTemplatesId: null,
  processFlow: '',
  estimatedTime: '',
  isActive: true,
  requiredDocuments: [],
});

export default defineComponent({
  name: 'RequestTypeFormDrawer',
  components: { AppIcon, AppSelect },
  props: {
    initialData: {
      type: Object as PropType<RequestTypeFormData | null>,
      default: null,
    },
    categories: {
      type: Array as PropType<CategoryItem[]>,
      default: () => [],
    },
    templates: {
      type: Array as PropType<Array<{ id: number; name: string }>>,
      default: () => [],
    },
  },
  emits: ['submit'],
  setup(props, { emit, expose }) {
    const { t } = useI18n();

    const rolesService = new RolesService();
    const getInstitutionRolesService = new GetInstitutionRolesService();
    const roles = ref<RoleDto[]>([]);

    const form = ref<RequestTypeFormData>(defaultForm());

    // Required Documents List
    const docReq = ref<ApplicationDocumentRequiredItem[]>([]);
    const selectedDocumentRequiredId = ref<number | undefined>(undefined);

    const toArray = function <T>(payload: unknown): T[] {
      if (Array.isArray(payload)) return payload as T[];
      const data = (payload as any)?.data;
      return Array.isArray(data) ? (data as T[]) : [];
    };

    const loadRoles = async () => {
      try {
        const payload = await getInstitutionRolesService.run(75);
        roles.value = toArray<RoleDto>(payload);
      } catch (_e) {
        roles.value = rolesService.getRoles() as RoleDto[];
      }
    };

    const loadDocumentRequired = async () => {
      try {
        const documents = await new GetApplicationDocumentRequiredService().run();
        docReq.value = toArray<ApplicationDocumentRequiredItem>(documents);
      } catch (_e) {
        docReq.value = [];
      }
    };

    onMounted(async () => {
      await Promise.allSettled([loadRoles(), loadDocumentRequired()]);
    });

    const targetAudienceOpts = computed(() => {
      const list = roles.value.length ? roles.value : (rolesService.getRoles() as RoleDto[]);
      return list.map((role) => ({
        value: role.id.toString(),
        label: role.name,
      }));
    });

    const documentTemplateOpts = computed(() => {
      if (props.templates && props.templates.length) {
        return props.templates.map((tpl) => ({
          value: String(tpl.id),
          label: tpl.name,
        }));
      }
      return documentTemplateOptions;
    });
    const processFlowOpts = processFlowOptions;

    const categoryValue = computed({
      get: () => form.value.categoryId ?? undefined,
      set: (val: any) => {
        form.value.categoryId = val ?? null;
      },
    });

    watch(
      () => props.initialData,
      (data) => {
        if (data) {
          form.value = { ...data };
        } else {
          form.value = defaultForm();
        }
        loadDocumentRequired();
      },
      { immediate: true }
    );

    watch(
      () => form.value.requiresAttachments,
      (enabled) => {
        if (!enabled) {
          form.value.requiredDocuments = [];
          selectedDocumentRequiredId.value = undefined;
        }
      }
    );

    const availableDocReq = computed(() => {
      const addedIds = new Set(form.value.requiredDocuments.map((d) => d.applicationDocumentRequiredId).filter(Boolean));
      return docReq.value.filter((d) => !addedIds.has(d.id));
    });

    const addSelectedDocument = () => {
      if (!selectedDocumentRequiredId.value) return;
      const found = docReq.value.find((d) => d.id === Number(selectedDocumentRequiredId.value));
      if (!found) return;
      form.value.requiredDocuments.push({
        applicationDocumentRequiredId: found.id,
        code: found.code,
        name: found.name,
        description: found.description,
        isRequired: true,
      });
      selectedDocumentRequiredId.value = undefined;
    };

    const removeRequiredDocument = (index: number) => {
      form.value.requiredDocuments.splice(index, 1);
    };

    const submitForm = () => {
      emit('submit', {
        ...form.value,
        applicationDocumentRequiredId: selectedDocumentRequiredId.value ?? null,
      });
    };

    expose({ submitForm });

    return {
      t,
      form,
      categoryValue,
      targetAudienceOpts,
      documentTemplateOpts,
      processFlowOpts,
      addSelectedDocument,
      removeRequiredDocument,
      docReq,
      availableDocReq,
      selectedDocumentRequiredId,
    };
  },
});
</script>

<style scoped>
.rtype-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rtype-form__card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rtype-form__card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rtype-form__subsection-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.rtype-form__req-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rtype-form__req-delete {
  width: 34px;
  height: 34px;
  border: none;
  background: #fff1f2;
  color: #e11d48;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}

.rtype-form__req-delete:hover {
  background: #ffe4e6;
}

.rtype-form__req-required-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rtype-form__req-required-label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #212b36;
  white-space: nowrap;
}

/* ── Selector row ── */
.rtype-form__doc-selector-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.rtype-form__doc-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rtype-form__add-doc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  height: 44px;
  transition: opacity 0.15s;
}

.rtype-form__add-doc-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* ── Document cards ── */
.rtype-form__req-card {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
}

.rtype-form__req-card-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.rtype-form__req-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #ebf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  flex-shrink: 0;
}

.rtype-form__req-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rtype-form__req-card-name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.rtype-form__req-card-code {
  font-family: 'Roboto', monospace;
  font-size: 12px;
  color: #637381;
  background: #e9ecef;
  border-radius: 4px;
  padding: 1px 6px;
  width: fit-content;
}

.rtype-form__req-card-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
  line-height: 1.4;
}

.rtype-form__req-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

@media (max-width: 480px) {
  .rtype-form__req-card-right {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }
}

.rtype-form__doc-empty {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0;
  text-align: center;
  padding: 12px 0;
}

.rtype-form__card-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.rtype-form__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #212b36;
  letter-spacing: 0.5px;
  margin: 0;
  text-transform: uppercase;
}

.rtype-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rtype-form__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.rtype-form__input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #f8fafc;
}

.rtype-form__input:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.rtype-form__input::placeholder {
  color: #c4cdd5;
}

.rtype-form__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #212b36;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #f8fafc;
}

.rtype-form__textarea:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.rtype-form__textarea::placeholder {
  color: #c4cdd5;
}

/* Toggle Row */
.rtype-form__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.rtype-form__toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rtype-form__toggle-label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.rtype-form__toggle-desc {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

/* Switch */
.rtype-form__switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.rtype-form__switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.rtype-form__slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #c4cdd5;
  transition: 0.3s;
  border-radius: 24px;
}

.rtype-form__slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.rtype-form__switch input:checked + .rtype-form__slider {
  background-color: var(--color-primary);
}

.rtype-form__switch input:checked + .rtype-form__slider::before {
  transform: translateX(20px);
}
</style>
