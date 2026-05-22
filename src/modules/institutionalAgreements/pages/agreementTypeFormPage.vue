<template>
  <AppBaseList :title="isEdit ? 'Editar Tipo de Convenio' : 'Nuevo Tipo de Convenio'">
    <template #actions>
      <AppButton label="Volver" style="color: white" @click="onCancel" />
      <AppCheckPermission :permission="isEdit ? 'institutionalAgreements.typesAgreements.edit' : 'institutionalAgreements.typesAgreements.create'">
        <!-- <AppButton label="Guardar Tipo" style="color: white" @click="onSave" /> -->
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />
      <template v-else>
        <div class="formLayout">
          <!-- ── Card 1: Información del Tipo ────────────────────────────── -->

          <AppCard>
            <template #title>Información del Tipo de Convenio</template>
            <template #body>
              <div class="formRow">
                <div class="formGroup">
                  <label class="formLabel">
                    Código del tipo
                    <AppIcon icon="question-circle" class="formLabel__icon" v-tooltip="'Código único identificador del tipo de convenio (ej: CONV-001)'" />
                  </label>
                  <AppInput v-model="v$.form.code.$model" placeholder="Ej: CONV-001" />
                  <small class="text-danger" v-if="v$.form.code.$error">El código es requerido</small>
                </div>

                <div class="formGroup">
                  <label class="formLabel">
                    Nombre del tipo
                    <AppIcon icon="question-circle" class="formLabel__icon" v-tooltip="'Nombre descriptivo del tipo de convenio'" />
                  </label>
                  <AppInput v-model="v$.form.name.$model" placeholder="Ej: Convenio Internacional de Movilidad" />
                  <small class="text-danger" v-if="v$.form.name.$error">El nombre es requerido</small>
                </div>
              </div>

              <div class="formGroup">
                <label class="formLabel">
                  Descripción
                  <AppIcon icon="question-circle" class="formLabel__icon" v-tooltip="'Descripción detallada del propósito y características del tipo de convenio'" />
                </label>
                <AppVoiceInput v-model="form.description" textareaClass="form-control" placeholder="Describe el propósito y alcance de este tipo de convenio..." :rows="3" />
              </div>

              <div class="formGroup">
                <label class="formLabel">
                  Estado
                  <AppIcon icon="question-circle" class="formLabel__icon" v-tooltip="'Define si este tipo de convenio está activo y disponible para uso'" />
                </label>
                <div class="d-flex align-items-center gap-3">
                  <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" role="switch" id="statusSwitch" v-model="form.statusActive" />
                  </div>
                  <span :class="form.statusActive ? 'text-success fw-semibold' : 'text-muted'">
                    {{ form.statusActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <AppCheckPermission :permission="isEdit ? 'institutionalAgreements.typesAgreements.edit' : 'institutionalAgreements.typesAgreements.create'">
                    <AppButton label="Guardar Tipo" size="sm" @click="onSaveType" />
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>

          <!-- ── Card 2: Configuración de Campos ────────────────────────── -->
          <AppCard>
            <template #title>Configuración de Campos del Formulario de Convenio</template>
            <template #body>
              <p class="cardDescription">Seleccione qué campos estarán visibles y cuáles serán obligatorios al crear un convenio de este tipo.</p>

              <div class="fieldConfig__meta">
                <span class="fieldConfig__totalCount">
                  <strong>{{ totalActiveFields }}</strong> campos activos en total
                </span>
                <span class="fieldConfig__tip"> 💡 Si un campo es obligatorio, automáticamente será visible </span>
              </div>

              <AppAccordion styleType="clean" v-slot="{ accordionId }">
                <AppAccordionItem v-for="section in fieldSections" :key="`section-${section.id}`" :accordionId="accordionId">
                  <template #head>
                    <div class="sectionHead">
                      <div class="sectionHead__iconWrap">
                        <AppIcon :icon="SECTION_ICONS[section.id - 1]" class="sectionHead__icon" />
                      </div>
                      <div class="sectionHead__info">
                        <span class="sectionHead__title">{{ section.name }}</span>
                        <span class="sectionHead__count">{{ sectionActiveCount(section) }} campos activos</span>
                      </div>
                    </div>
                  </template>
                  <template #content>
                    <table class="table table-sm fieldTable">
                      <thead>
                        <tr>
                          <th>Campo</th>
                          <th class="text-center" style="width: 80px">Visible</th>
                          <th class="text-center" style="width: 80px">Obligatorio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(field, fi) in section.fields" :key="fi">
                          <td>{{ field.name }}</td>
                          <td class="text-center">
                            <input class="form-check-input" type="checkbox" v-model="field.visible" @change="onVisibleChange(field)" />
                          </td>
                          <td class="text-center">
                            <input class="form-check-input" type="checkbox" v-model="field.required" :disabled="!field.visible" />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Botón de guardar la sección -->
                    <div class="mt-3 d-flex justify-content-end">
                      <AppButton label="Guardar Sección" @click="onSaveSection(section)" icon="save" />
                    </div>
                  </template>
                </AppAccordionItem>
              </AppAccordion>
            </template>
          </AppCard>

          <!-- ── Card 3: Adjuntos Requeridos ────────────────────────────── -->
          <AppCard>
            <template #title>Adjuntos Requeridos para la Postulación</template>
            <template #body>
              <p class="cardDescription">Defina los documentos que deberán cargar los estudiantes o usuarios al postularse a convenios de este tipo.</p>

              <div class="attachments__header">
                <div class="attachments__stats">
                  <span
                    ><strong>{{ attachments.length }}</strong> documentos configurados</span
                  >
                  <span
                    ><strong>{{ requiredAttachmentsCount }}</strong> obligatorios</span
                  >
                </div>
                <AppButton outlined icon="plus" label="Agregar adjunto" @click="openAttachModal(null)" />
              </div>

              <div class="table-responsive">
                <table class="table table-sm attachTable">
                  <thead>
                    <tr>
                      <th>Nombre del documento</th>
                      <th>Descripción</th>
                      <th class="text-center">Obligatorio</th>
                      <th class="text-center">Estado</th>
                      <th class="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="attachments.length === 0">
                      <td colspan="5" class="text-center text-muted py-4">Sin adjuntos configurados</td>
                    </tr>
                    <tr v-for="attach in attachments" :key="attach.id">
                      <td class="attachTable__name">{{ attach.name }}</td>
                      <td class="attachTable__desc">
                        {{ attach.description }}
                      </td>
                      <td class="text-center">
                        {{ attach.required === 1 || attach.required === true ? 'Sí' : 'No' }}
                      </td>
                      <td class="text-center">
                        <span class="statusBadge" :class="attach.isActive === 1 || attach.isActive === true ? 'statusBadge--active' : 'statusBadge--inactive'">
                          {{ attach.isActive === 1 || attach.isActive === true ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="text-center">
                        <div class="actionsCell">
                          <AppButton outlined icon="pencil-alt" v-tooltip="'Editar'" @click="openAttachModal(attach)" />
                          <AppButton outlined icon="trash" class="btnDanger" v-tooltip="'Eliminar'" @click="openDeleteAttach(attach)" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </AppCard>
        </div>
      </template>
    </template>
  </AppBaseList>

  <!-- ── Modal: Descartar cambios ──────────────────────────────────────── -->
  <AppModal v-model="cancelModal">
    <AppConfirmModal
      v-if="cancelModal"
      entity="cambios"
      textContent="Se perderán todos los cambios no guardados. Esta acción no se puede deshacer."
      textButton="Descartar"
      @confirmDelete="confirmCancel"
    />
  </AppModal>

  <!-- ── Modal: Agregar / Editar adjunto ────────────────────────────────── -->
  <AppModal v-model="attachModal" size="md">
    <AttachmentFormModal v-if="attachModal" :agreementTypeId="isEdit ? Number($route.params.id) : 0" :attachment="currentAttach" @save="saveAttachment" />
  </AppModal>

  <!-- ── Modal: Eliminar adjunto ────────────────────────────────────────── -->
  <AppModal v-model="deleteAttachModal">
    <AppConfirmDeleteModal v-if="deleteAttachModal && currentAttach" :entity="currentAttach.name" @confirmDelete="deleteAttachment" />
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmModal from '../../../shared/components/Modal/AppConfirmModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AttachmentFormModal from '../components/AttachmentFormModal.vue';

import { SectionDto, FieldItemDto } from '../dtos/agreementType.dto';
import { AgreementTypeAttachmentDto } from '../dtos/agreementTypeAttachment.dto';
import { GetAgreementTypeByIdService } from '../services/getAgreementTypeById.service';
import { CreateOrUpdateAgreementTypeService } from '../services/createOrUpdateAgreementType.service';
import { CreateOrUpdateAgreementTypeSectionService } from '../services/createOrUpdateAgreementTypeSection.service';
import { CreateOrUpdateAgreementTypeAttachmentService } from '../services/createOrUpdateAgreementTypeAttachment.service';
import { DeleteAgreementTypeAttachmentService } from '../services/deleteAgreementTypeAttachment.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAgreementTypeByIdService = new GetAgreementTypeByIdService();
const createOrUpdateAgreementTypeService = new CreateOrUpdateAgreementTypeService();
const createOrUpdateAgreementTypeSectionService = new CreateOrUpdateAgreementTypeSectionService();
const createOrUpdateAgreementTypeAttachmentService = new CreateOrUpdateAgreementTypeAttachmentService();
const deleteAgreementTypeAttachmentService = new DeleteAgreementTypeAttachmentService();

const DEFAULT_SECTIONS: SectionDto[] = [
  {
    id: 1,
    name: 'Información General',
    totalVisible: 0,
    totalFields: 6,
    fields: [
      { id: 2, name: 'Institución aliada', visible: false, required: false },
      { id: 3, name: 'País', visible: false, required: false },
      { id: 4, name: 'Ciudad', visible: false, required: false },
      { id: 5, name: 'Alcance', visible: false, required: false },
      { id: 6, name: 'Descripción pública', visible: false, required: false },
      { id: 7, name: 'Observaciones', visible: false, required: false },
    ],
  },
  {
    id: 2,
    name: 'Alcance Académico',
    totalVisible: 0,
    totalFields: 4,
    fields: [
      {
        id: 8,
        name: 'Facultades habilitadas',
        visible: false,
        required: false,
      },
      { id: 9, name: 'Programas habilitados', visible: false, required: false },
      { id: 11, name: 'Semestre mínimo', visible: false, required: false },
      { id: 12, name: 'Promedio mínimo', visible: false, required: false },
    ],
  },
  {
    id: 3,
    name: 'Vigencia y Cupos',
    totalVisible: 0,
    totalFields: 5,
    fields: [
      { id: 13, name: 'Fecha inicio', visible: false, required: false },
      { id: 14, name: 'Fecha fin', visible: false, required: false },
      { id: 15, name: 'Cupos máximos', visible: false, required: false },
      { id: 16, name: 'Responsable interno', visible: false, required: false },
      { id: 17, name: 'Versión del convenio', visible: false, required: false },
    ],
  },
  {
    id: 4,
    name: 'Requisitos y Documentos',
    totalVisible: 0,
    totalFields: 4,
    fields: [
      {
        id: 18,
        name: 'Sección de requisitos',
        visible: false,
        required: false,
      },
      { id: 19, name: 'Documento principal', visible: false, required: false },
      { id: 20, name: 'Documentos anexos', visible: false, required: false },
      {
        id: 21,
        name: 'Observaciones internas',
        visible: false,
        required: false,
      },
    ],
  },
];

const SECTION_ICONS = ['info-circle', 'graduation-cap', 'calendar-alt', 'file-alt'];

export default defineComponent({
  name: 'AgreementTypeFormPage',
  components: {
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppInput,
    AppVoiceInput,
    AppCard,
    AppAccordion,
    AppAccordionItem,
    AppModal,
    AppConfirmModal,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AttachmentFormModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $toast = useToast();
    useMeta({
      title: route.params.id ? 'Editar Tipo de Convenio' : 'Nuevo Tipo de Convenio',
    });

    const isEdit = computed(() => !!route.params.id);
    const loading = ref(true);

    // ── Main form ─────────────────────────────────────────────────────────
    const form = reactive({
      id: 0,
      code: '',
      name: '',
      description: '',
      statusActive: true,
    });

    // Para detectar cambios sin guardar
    const originalForm = reactive({
      id: 0,
      code: '',
      name: '',
      description: '',
      statusActive: true,
    });

    const rules = {
      form: {
        code: { required },
        name: { required },
      },
    };
    const v$ = useVuelidate(rules, { form });

    // ── Field config sections ─────────────────────────────────────────────
    const fieldSections = ref<SectionDto[]>(JSON.parse(JSON.stringify(DEFAULT_SECTIONS)));
    const originalFieldSections = ref<SectionDto[]>(JSON.parse(JSON.stringify(DEFAULT_SECTIONS)));

    const totalActiveFields = computed(() => fieldSections.value.reduce((sum, section) => sum + section.fields.filter((f) => f.visible).length, 0));

    const sectionActiveCount = (section: SectionDto) => section.fields.filter((f) => f.visible).length;

    const onVisibleChange = (field: FieldItemDto) => {
      if (!field.visible) field.required = false;
    };

    // ── Attachments ───────────────────────────────────────────────────────
    const attachments = ref<AgreementTypeAttachmentDto[]>([]);
    const requiredAttachmentsCount = computed(() => attachments.value.filter((a) => a.required).length);

    // ── Attachment modal ──────────────────────────────────────────────────
    const attachModal = ref(false);
    const currentAttach = ref<AgreementTypeAttachmentDto | null>(null);

    const openAttachModal = (attach: AgreementTypeAttachmentDto | null) => {
      currentAttach.value = attach || null;
      attachModal.value = true;
    };

    const saveAttachment = (newAttach: AgreementTypeAttachmentDto) => {
      // Validar que el tipo exista antes de guardar
      const typeId = isEdit.value ? Number(route.params.id) : form.id || 0;
      if (!typeId) {
        $toast.warning('Debes guardar el tipo de convenio antes de agregar adjuntos');
        return;
      }

      const attachmentToSave: AgreementTypeAttachmentDto = {
        ...newAttach,
        id: currentAttach.value?.id,
        agreementsTypesId: typeId,
      };

      if (currentAttach.value) {
        const original = currentAttach.value;
        const idx = attachments.value.findIndex((a) => a === original || (a.id && a.id === original.id));
        if (idx >= 0) attachments.value[idx] = attachmentToSave;
      } else {
        attachments.value.push(attachmentToSave);
      }

      attachModal.value = false;
      currentAttach.value = null;

      // Guardar en backend de forma independiente
      onSaveAttachment(attachmentToSave);
    };

    // ── Helper: obtener typeId válido ─────────────────────────────────────
    const getValidTypeId = (): number | null => {
      const typeId = isEdit.value ? Number(route.params.id) : form.id || 0;
      return typeId || null;
    };

    // ── Save Attachment to Backend ─────────────────────────────────────────
    const onSaveAttachment = async (attachment: AgreementTypeAttachmentDto) => {
      try {
        const typeId = getValidTypeId();
        if (!typeId) return;

        const attachmentPayload = {
          agreementsTypesId: typeId,
          name: attachment.name,
          description: attachment.description,
          required: attachment.required ? 1 : 0,
          isActive: attachment.isActive ? 1 : 0,
        };

        const numId = Number(attachment.id);
        const hasValidId = !!attachment.id && !isNaN(numId) && numId > 0;
        const attachmentId = hasValidId ? numId : undefined;

        const response = await createOrUpdateAgreementTypeAttachmentService.run(attachmentPayload as any, attachmentId);

        // Normalizar ID retornado a número para que futuras ediciones/eliminaciones usen PUT/DELETE correctamente
        const returnedId = response?.data?.id ?? response?.id;
        if (!hasValidId && returnedId) {
          const idx = attachments.value.findIndex((a) => a === attachment);
          if (idx >= 0) attachments.value[idx].id = Number(returnedId);
        }
      } catch {
        // interceptor maneja el toast de error
      }
    };

    // ── Delete attachment modal ───────────────────────────────────────────
    const deleteAttachModal = ref(false);

    const openDeleteAttach = (attach: AgreementTypeAttachmentDto) => {
      currentAttach.value = attach;
      deleteAttachModal.value = true;
    };

    const deleteAttachment = () => {
      if (!currentAttach.value) return;

      // Guardar el adjunto para borrarlo del backend
      const attachmentToDelete = currentAttach.value;

      // Eliminar del array local usando referencia directa para cubrir ítems sin ID
      attachments.value = attachments.value.filter((a) => a !== attachmentToDelete);
      deleteAttachModal.value = false;
      currentAttach.value = null;

      // Borrar del backend
      onDeleteAttachment(attachmentToDelete);
    };

    // ── Delete Attachment from Backend ──────────────────────────────────────
    const onDeleteAttachment = async (attachment: AgreementTypeAttachmentDto) => {
      try {
        const numId = Number(attachment.id);
        const hasValidId = !!attachment.id && !isNaN(numId) && numId > 0;
        if (!hasValidId) return;

        await deleteAgreementTypeAttachmentService.run(String(numId));
      } catch {
        // interceptor maneja el toast de error
      }
    };

    // ── Cancel modal ──────────────────────────────────────────────────────
    const cancelModal = ref(false);

    // Detectar si hay cambios sin guardar
    const hasUnsavedChanges = (): boolean => {
      // Verificar cambios en el tipo de convenio
      const typeChanged = form.code !== originalForm.code || form.name !== originalForm.name || form.description !== originalForm.description || form.statusActive !== originalForm.statusActive;

      if (typeChanged) {
        return true;
      }

      // Verificar cambios en las secciones
      const sectionsChanged = JSON.stringify(fieldSections.value) !== JSON.stringify(originalFieldSections.value);
      if (sectionsChanged) {
        return true;
      }

      // Verificar si hay modal abierto (adjunto siendo editado)
      if (attachModal.value || currentAttach.value) {
        return true;
      }

      return false;
    };

    const onCancel = () => {
      if (hasUnsavedChanges()) {
        cancelModal.value = true;
      } else {
        // Si no hay cambios, navegar directamente sin mostrar modal
        router.push({ name: 'institutionalAgreements.typesAgreements' });
      }
    };

    const confirmCancel = () => {
      router.push({ name: 'institutionalAgreements.typesAgreements' });
    };

    // ── Save Type Only ───────────────────────────────────────────────────
    const onSaveType = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      try {
        // Solo guardar la información del tipo de convenio
        const agreementTypePayload = {
          code: form.code,
          name: form.name,
          description: form.description,
          isActive: form.statusActive ? 1 : 0,
        };
        const typeId = isEdit.value ? Number(route.params.id) : undefined;
        const typeResponse = await createOrUpdateAgreementTypeService.run(agreementTypePayload as any, typeId);

        // Obtener el ID del tipo (nuevo o existente)
        const savedTypeId = isEdit.value ? typeId : typeResponse?.data?.id ?? typeResponse?.id;

        if (!savedTypeId) {
          throw new Error('No se pudo guardar el tipo de convenio');
        }

        // Acualizar el formulario ID para futuras secciones (en caso de nuevo registro)
        form.id = savedTypeId;

        // Actualizar el estado original para no considerar esto como cambio
        originalForm.code = form.code;
        originalForm.name = form.name;
        originalForm.description = form.description;
        originalForm.statusActive = form.statusActive;
      } catch {
        // interceptor maneja el toast de error
      }
    };

    // ── Save Single Section ───────────────────────────────────────────────
    // Cada campo de la sección se guarda en un request individual.
    const onSaveSection = async (section: SectionDto) => {
      try {
        const typeId = isEdit.value ? Number(route.params.id) : form.id;
        if (!typeId) {
          $toast.warning('Debes guardar el tipo de convenio antes de configurar secciones');
          return;
        }

        const newFields = section.fields.filter((f) => !f.sectionInstanceId);
        const existingFields = section.fields.filter((f) => !!f.sectionInstanceId);

        // POST individual por cada campo nuevo
        for (const field of newFields) {
          const payload = {
            sectionsId: section.id,
            agreementsTypesId: typeId,
            name: field.name,
            visible: field.visible ? 1 : 0,
            required: field.required ? 1 : 0,
          };
          const response = await createOrUpdateAgreementTypeSectionService.create(payload);
          const returnedId = response?.data?.id ?? response?.id;
          if (returnedId) field.sectionInstanceId = Number(returnedId);
        }

        // PUT en bloque para los campos existentes (sin ID en URL)
        if (existingFields.length > 0) {
          const bulkPayload = existingFields.map((field) => ({
            id: Number(field.sectionInstanceId),
            sectionsId: section.id,
            agreementsTypesId: typeId,
            name: field.name,
            visible: field.visible ? 1 : 0,
            required: field.required ? 1 : 0,
          }));
          await createOrUpdateAgreementTypeSectionService.update(bulkPayload as any);
        }

        originalFieldSections.value = JSON.parse(JSON.stringify(fieldSections.value));
      } catch {
        // interceptor maneja el toast de error
      }
    };

    // ── Load data ─────────────────────────────────────────────────────────
    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Acuerdos Institucionales', url: '' };
        headerStorage.moduleItem = { name: 'Tipos de Convenio', url: '' };
        headerStorage.moduleSubItem = {
          name: isEdit.value ? 'Editar' : 'Nuevo',
          url: '',
        };
      } catch (e) {
        // header store setup non-critical
      }

      if (isEdit.value) {
        const data = await getAgreementTypeByIdService.run(String(route.params.id));
        if (data) {
          form.code = data.code;
          form.name = data.name;
          form.description = data.description;
          form.statusActive = data.isActive === 1 || data.isActive === true;

          if (data.sections && data.sections.length > 0) {
            // Construir mapa: sectionId(1-4) → fieldName → mejor registro del backend
            // Si hay duplicados por nombre, se queda con el que tiene visible=true
            const backendMap = new Map<number, Map<string, any>>();

            data.sections.forEach((section: any) => {
              const sectionId = Number(section.sectionsId ?? section.id);
              if (!backendMap.has(sectionId)) backendMap.set(sectionId, new Map());
              const fieldMap = backendMap.get(sectionId)!;

              (section.fields || []).forEach((field: any) => {
                const key = (field.name || '').trim().toLowerCase();
                const isVisible = field.visible === 1 || field.visible === true;
                const existing = fieldMap.get(key);
                if (!existing || isVisible) fieldMap.set(key, field);
              });
            });

            // Usar DEFAULT_SECTIONS como estructura canónica para evitar duplicados
            fieldSections.value = DEFAULT_SECTIONS.map((defaultSection) => {
              const fieldMap = backendMap.get(defaultSection.id);
              return {
                ...defaultSection,
                fields: defaultSection.fields.map((defaultField) => {
                  const bf = fieldMap?.get(defaultField.name.trim().toLowerCase());
                  return {
                    id: defaultField.id,
                    sectionInstanceId: bf ? Number(bf.id) : undefined,
                    name: defaultField.name,
                    visible: bf ? bf.visible === 1 || bf.visible === true : false,
                    required: bf ? bf.required === 1 || bf.required === true : false,
                  };
                }),
              };
            });
          }

          // Cargar attachments - REEMPLAZAR completamente, no sumar
          if (data.attachments && Array.isArray(data.attachments)) {
            // Limpiar completamente y asignar nuevos
            attachments.value.splice(0);
            const loadedAttachments = JSON.parse(JSON.stringify(data.attachments));
            attachments.value.push(...loadedAttachments);
          }
        }
      }

      // Guardar estado original después de cargar (para detectar cambios)
      originalForm.code = form.code;
      originalForm.name = form.name;
      originalForm.description = form.description;
      originalForm.statusActive = form.statusActive;
      originalFieldSections.value = JSON.parse(JSON.stringify(fieldSections.value));

      loading.value = false;
    });

    return {
      SECTION_ICONS,
      isEdit,
      loading,
      form,
      v$,
      fieldSections,
      totalActiveFields,
      sectionActiveCount,
      onVisibleChange,
      attachments,
      requiredAttachmentsCount,
      attachModal,
      currentAttach,
      openAttachModal,
      saveAttachment,
      deleteAttachModal,
      openDeleteAttach,
      deleteAttachment,
      cancelModal,
      onCancel,
      confirmCancel,
      onSaveType,
      onSaveSection,
    };
  },
});
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.formLayout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Form groups ─────────────────────────────────────────────────────────── */
.formRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.formGroup:last-child {
  margin-bottom: 0;
}

.formLabel {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-gray-700, #374151);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.formLabel__icon {
  font-size: 0.78rem;
  color: var(--color-gray-400, #9ca3af);
  cursor: help;
}

/* ── Card descriptions ──────────────────────────────────────────────────── */
.cardDescription {
  font-size: 0.88rem;
  color: var(--color-gray-500, #6b7280);
  margin-bottom: 0.75rem;
}

/* ── Field config meta row ──────────────────────────────────────────────── */
.fieldConfig__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.6rem 0.9rem;
  background: rgba(var(--color-primary-rgb), 0.04);
  border-radius: 8px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.fieldConfig__totalCount {
  font-size: 0.88rem;
  color: var(--color-gray-700, #374151);
}

.fieldConfig__tip {
  font-size: 0.82rem;
  color: var(--color-gray-500, #6b7280);
}

/* ── Accordion section head ─────────────────────────────────────────────── */
.sectionHead {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.sectionHead__iconWrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sectionHead__icon {
  font-size: 1.05rem;
  color: var(--color-primary);
}

.sectionHead__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.sectionHead__title {
  font-weight: 700;
  color: var(--color-gray-800, #1f2937);
  font-size: 1rem;
  line-height: 1.2;
}

.sectionHead__count {
  font-size: 0.83rem;
  color: var(--color-primary);
}

/* ── Field config table ─────────────────────────────────────────────────── */
.fieldTable th {
  font-size: 0.92rem;
  color: var(--color-gray-500, #6b7280);
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
}

.fieldTable td {
  font-size: 0.95rem;
  vertical-align: middle;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

/* ── Attachments header ─────────────────────────────────────────────────── */
.attachments__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.attachments__stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.88rem;
  color: var(--color-gray-600, #4b5563);
}

/* ── Attachments table ──────────────────────────────────────────────────── */
.attachTable th {
  font-size: 0.8rem;
  color: var(--color-gray-500, #6b7280);
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.attachTable td {
  font-size: 0.85rem;
  vertical-align: middle;
}

.attachTable__name {
  font-weight: 600;
  color: var(--color-gray-800, #1f2937);
  white-space: nowrap;
}

.attachTable__desc {
  font-size: 0.82rem;
  color: var(--color-gray-500, #6b7280);
  max-width: 220px;
}

.fmtBadge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  margin-right: 0.25rem;
}

/* ── Actions cell ──────────────────────────────────────────────────────── */
.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.btnDanger {
  border-color: #fecaca;
  color: #dc2626;
}

/* ── Status badge ────────────────────────────────────────────────────────── */
.statusBadge {
  display: inline-flex;
  align-items: center;
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

@media (max-width: 768px) {
  .formRow {
    grid-template-columns: 1fr;
  }
}
</style>
