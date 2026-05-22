<template>
  <div>
    <AppPulseLoading v-if="loading"></AppPulseLoading>

    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="graduation-cap" />
        </div>
        <div class="w-100">
          <h3 class="sectionHead__title">Formación Académica</h3>
          <p class="sectionHead__subtitle">Educación Formal</p>
        </div>
      </div>

      <AppButton type="button" class="btnPrimary addBtn" @click="openCreate">
        <AppIcon icon="plus" />
        Agregar Formación
      </AppButton>
    </div>

    <!-- Empty -->
    <div v-if="!formations.length" class="emptyWrap">
      <AppCard>
        <template #title>No hay formaciones registradas</template>

        <template #body>
          <p class="muted">Comienza agregando tu primera formación académica.</p>
        </template>

        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Formación
            </AppButton>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Grid -->
    <div v-else class="grid-cards">
      <AppCard v-for="(f, index2) in formations" :key="index2">
        <template #title>
          <div class="cardTitleRow">
            <div class="titleLeft">
              <AppBadge :label="f.academicLevel?.name || '—'" variant="ghost" />
              <AppBadge :label="f.status" :variant="f.status === 'Finalizado' ? 'success' : 'warning'" />
            </div>
          </div>
        </template>

        <template #body>
          <div class="body">
            <div class="mainTitle">{{ f.degreeObtained }}</div>

            <div class="meta">
              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="university" class="metaIcon" />
                  Institución
                </span>
                <span class="metaValue" :title="f.institution">{{ f.institution }}</span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="globe" class="metaIcon" />
                  País
                </span>
                <span class="metaValue" :title="f.country?.name">{{ f.country?.name || '—' }}</span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="calendar" class="metaIcon" />
                  Años
                </span>
                <span class="metaValue">
                  {{ yearFromDate(f.startDate) }} -
                  {{ f.status === 'Finalizado' ? yearFromDate(f.endDate) : 'Actual' }}
                </span>
              </div>

              <div v-if="f.registrationNumber" class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="id-card" class="metaIcon" />
                  Registro
                </span>
                <span class="metaValue mono" :title="f.registrationNumber">{{ f.registrationNumber }}</span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="paperclip" class="metaIcon" />
                  Soporte
                </span>
                <span class="metaValue">{{ f.certificateUrl ? 'Adjunto' : 'Sin adjunto' }}</span>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnSecondary" @click="openEdit(f.id)">
              <AppIcon icon="pen" />
              Editar
            </AppButton>

            <AppButton type="button" class="btnDanger" @click="openModalDelete(f)">
              <AppIcon icon="trash" />
              Eliminar
            </AppButton>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Drawer -->
    <AppDrawer :isVisible="drawerOpen" size="lg" @update:isVisible="drawerOpen = $event">
      <template #head>
        <div class="drawerHead">
          <div>
            <h2 class="drawerHead__title">{{ drawerTitle }}</h2>
            <p class="drawerHead__subtitle">Registra tu educación formal</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <AppFormField :form-control="v$.form.academicLevelId" :label="'Nivel Académico'">
                <AppAutocomplete input-id="academicLevelId" :options="educationTypes" label="name" :reduce="(o:any) => o.id" v-model="v$.form.academicLevelId.$model" :clearable="true" />
              </AppFormField>

              <AppFormField :form-control="v$.form.status" :label="'Estado'">
                <AppAutocomplete input-id="status" :options="statusOptions" label="name" :reduce="(o:any) => o.id" v-model="v$.form.status.$model" :clearable="false" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.degreeObtained" :label="'Título Obtenido'">
                <input type="text" class="form-control" v-model="v$.form.degreeObtained.$model" placeholder="Ej: Maestría en Ingeniería de Software" />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution" :label="'Institución'">
                <input type="text" class="form-control" v-model="v$.form.institution.$model" placeholder="Nombre de la institución" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.countryId" label="País">
                <AppGeographicSearch :key="drawerKey" :search-key="'country'" :id="v$.form.countryId.$model" @geographic-data="(data) => (v$.form.countryId.$model = data.id)" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.startDate" :label="'Fecha de Inicio'">
                <input type="date" class="form-control" v-model="v$.form.startDate.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.endDate" :label="'Fecha de Fin'">
                <input type="date" class="form-control" v-model="v$.form.endDate.$model" :disabled="form.status === 'En curso'" />
                <p v-if="form.status === 'En curso'" class="helpText">Si está “En curso”, la fecha de fin es opcional.</p>
              </AppFormField>
            </div>
            <div class="form-row">
              <AppFormField :form-control="v$.form.registrationNumber" :label="'Número de Registro (Opcional)'">
                <input type="text" class="form-control" v-model="v$.form.registrationNumber.$model" placeholder="Ej: DT-2022-045789" />
                <p class="helpText">Número de registro oficial del diploma o acta.</p>
              </AppFormField>
            </div>

            <!-- ✅ Dropzone con URL backend + File nuevo opcional -->
            <AppAttachmentDropzone
              :isShowDelete="false"
              v-model="selectedFile"
              v-model:certificateUrl="form.certificateUrl"
              isTitle="Adjuntar Diploma o Acta de Grado"
              isHelper="PDF, DOC, DOCX (máx. 5MB)"
              isAccept=".pdf,.doc,.docx"
              :isMaxSizeMB="5"
            />
          </form>
        </div>
      </template>

      <template #footer>
        <div class="drawerFooterActions">
          <AppButton type="button" class="btnSecondary" @click="closeDrawer"> Cancelar </AppButton>

          <AppButton type="button" class="btnPrimary" @click="handleSubmit">
            <AppIcon icon="save" />
            {{ 'Guardar' }}
          </AppButton>
        </div>
      </template>
    </AppDrawer>

    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="formación académica" @confirmDelete="deleteAcademicBackground" />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf } from '../../../../shared/plugins/vuelidate.plugin';
import { useResumeStore } from '../../stores/resume.store';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppBadge from '../../../../shared/components/AppBadge.vue';
import AppAttachmentDropzone from '../../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppGeographicSearch from '../../../../shared/components/Forms/AppGeographicSearch.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';

import { GetAcademicBackgroundWithPaginationService } from '../../services/getAcademicBackgroundWithPagination.service';
import { GetEducationTypesService } from '../../services/getEducationTypes.service';
import { CreateOrUpdateAcademicBackgroundService } from '../../services/createOrUpdateAcademicBackground.service';
import { DeleteAcademicBackgroundsService } from '../../services/deleteAcademicBackground.service';
import { CreateOrUpdateAcademicBackgroundsCertificateService } from '../../services/createOrUpdateAcademicBackgroundCertificate.service';

type AcademicStatus = 'Finalizado' | 'En curso';

interface AcademicFormation {
  id: any;
  academicLevel: { id: number; name: string };
  country: { id: number; name: string };
  degreeObtained: string;
  institution: string;
  status: AcademicStatus;
  startDate: string;
  endDate: string;
  registrationNumber?: string;
  certificateUrl: string; // ✅
}

const getAcademicBackgroundWithPaginationService = new GetAcademicBackgroundWithPaginationService();
const getEducationTypesService = new GetEducationTypesService();
const createOrUpdateAcademicBackgroundService = new CreateOrUpdateAcademicBackgroundService();
const createOrUpdateAcademicBackgroundsCertificateService = new CreateOrUpdateAcademicBackgroundsCertificateService();
const deleteAcademicBackgroundService = new DeleteAcademicBackgroundsService();

export default defineComponent({
  name: 'AcademicFormationStep',
  components: {
    AppModal,
    AppConfirmDeleteModal,
    AppIcon,
    AppButton,
    AppFormField,
    AppCard,
    AppDrawer,
    AppBadge,
    AppAttachmentDropzone,
    AppGeographicSearch,
    AppPulseLoading,
    AppAutocomplete,
  },
  setup() {
    const formations = ref<AcademicFormation[]>([]);
    const loading = ref(true);
    const resumeStore = useResumeStore();
    const educationTypes = ref<any>([]);
    const statusOptions = [
      { id: 'En curso', name: 'En curso' },
      { id: 'Finalizado', name: 'Finalizado' },
    ];

    const modalDelete = ref(false);
    const currentFormation: { value: AcademicFormation | null } = reactive({
      value: null,
    });

    const drawerOpen = ref(false);
    const editingId = ref<string | null>(null);
    const drawerKey = ref(0);
    const userPeopleId = ref<number | null>(null);

    // ✅ SOLO para cuando el usuario selecciona NUEVO archivo
    const selectedFile = ref<File | null>(null);

    const form = reactive({
      academicLevelId: null as number | null,
      degreeObtained: '',
      institution: '',
      countryId: null as number | null,
      startDate: '',
      endDate: '',
      status: 'En curso' as AcademicStatus,
      registrationNumber: '',
      certificateUrl: '', // ✅ siempre se pinta desde backend
    });

    const v$ = useVuelidate(
      {
        form: {
          academicLevelId: {},
          degreeObtained: { required },
          institution: { required },
          countryId: { required },
          startDate: { required },
          status: { required },
          endDate: { required: requiredIf(() => form.status === 'Finalizado') },
          registrationNumber: {},
          certificateUrl: {}, // opcional
        },
      },
      { form }
    );

    const drawerTitle = computed(() => (editingId.value ? 'Editar Formación Académica' : 'Agregar Formación Académica'));

    const yearFromDate = (d?: string | null) => (d ? String(d).slice(0, 4) : '');

    const normalizeDateInput = (d?: string | null) => (d ? String(d).slice(0, 10) : '');

    watch(
      () => form.status,
      (val) => {
        if (val === 'En curso') form.endDate = '';
      }
    );

    const resetForm = () => {
      form.academicLevelId = null;
      form.degreeObtained = '';
      form.institution = '';
      form.countryId = null;
      form.startDate = '';
      form.endDate = '';
      form.status = 'En curso';
      form.registrationNumber = '';
      form.certificateUrl = ''; // ✅
      selectedFile.value = null; // ✅
      v$.value.$reset();
    };

    const openCreate = () => {
      editingId.value = null;
      resetForm();
      drawerKey.value++;
      drawerOpen.value = true;
    };

    const openEdit = (id: string) => {
      const item = formations.value.find((x) => x.id === id);
      if (!item) return;
      console.log('Editing item:', item);
      editingId.value = String(id);

      // ✅ si entro a editar, pinto URL del backend
      form.certificateUrl = item.certificateUrl || '';

      // ✅ no hay "nuevo archivo" seleccionado aún
      selectedFile.value = null;

      form.academicLevelId = item.academicLevel?.id ?? null;
      form.degreeObtained = item.degreeObtained;
      form.institution = item.institution;
      form.countryId = item.country?.id ?? null;
      form.startDate = normalizeDateInput(item.startDate);
      form.endDate = normalizeDateInput(item.endDate);
      form.status = item.status;
      form.registrationNumber = item.registrationNumber || '';

      v$.value.$reset();
      drawerKey.value++;
      drawerOpen.value = true;
    };

    const closeDrawer = () => {
      drawerOpen.value = false;
      editingId.value = null;
      resetForm();
    };

    const openModalDelete = (item: AcademicFormation) => {
      modalDelete.value = true;
      currentFormation.value = item;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentFormation.value = null;
      await loadFromService();
    };

    const deleteAcademicBackground = async () => {
      try {
        await deleteAcademicBackgroundService.run(Number(currentFormation.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando formación académica:', e);
      }
    };

    const extractItemsFromResponse = (response: any): AcademicFormation[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const loadFromService = async () => {
      const response = await getAcademicBackgroundWithPaginationService.run({
        noPag: true,
      });

      formations.value = extractItemsFromResponse(response);

      // ✅ Guardar en el estado global para el CV
      resumeStore.setAcademic(formations.value);
    };

    const loadEducationTypes = async () => {
      try {
        const response = await getEducationTypesService.run({
          noPag: true,
          educationCategoryId: 11,
          lastLevelOnly: true,
        });

        educationTypes.value = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : [];
      } catch (e) {
        console.error('Error cargando education types:', e);
        educationTypes.value = [];
      }
    };

    onMounted(async () => {
      await loadFromService();
      await loadEducationTypes();

      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        userPeopleId.value = user?.people?.id ?? null;
      }

      loading.value = false;
    });

    const handleSubmit = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      loading.value = true;

      try {
        const payload: any = {
          id: editingId.value ? Number(editingId.value) : undefined,
          peopleId: Number(userPeopleId.value),
          academicLevelId: form.academicLevelId ?? 6,
          countryId: form.countryId as number,
          degreeObtained: form.degreeObtained,
          institution: form.institution,
          status: form.status,
          startDate: form.startDate,
          endDate: form.status === 'Finalizado' ? form.endDate : undefined,
          registrationNumber: form.registrationNumber?.trim() || undefined,

          // ✅ si tu API lo guarda, se manda; si no, puedes quitarlo del payload
          certificateUrl: form.certificateUrl || undefined,
        };

        // 1) guardar/actualizar formación
        const saveResp = await createOrUpdateAcademicBackgroundService.run(payload, payload.id);

        const academicBackgroundId = saveResp?.data?.id ?? Number(editingId.value);

        if (!academicBackgroundId) {
          throw new Error('No se pudo obtener el id de la formación académica');
        }

        // 2) ✅ SOLO si el usuario seleccionó un archivo nuevo
        if (selectedFile.value) {
          await createOrUpdateAcademicBackgroundsCertificateService.run({
            peopleId: Number(userPeopleId.value),
            id: Number(academicBackgroundId),
            archivo: selectedFile.value, // ✅ binario
          });
        }

        // 3) refresca para traer el certificateUrl nuevo (si subiste archivo)
        await loadFromService();

        closeDrawer();
      } catch (err: any) {
        console.error('Error guardando formación académica:', err);
      } finally {
        loading.value = false;
      }
    };
    watch(selectedFile, (v) => console.log('selectedFile changed:', v));
    return {
      formations,
      drawerOpen,
      drawerTitle,
      editingId,
      loading,
      form,
      v$,

      openCreate,
      openEdit,
      closeDrawer,

      modalDelete,
      currentFormation,
      openModalDelete,
      closeModalDelete,
      deleteAcademicBackground,

      selectedFile,
      educationTypes,
      handleSubmit,
      statusOptions,
      yearFromDate,
      drawerKey,
    };
  },
});
</script>

<style scoped>
/* ====== base step styles (mismo look tuyo) ====== */
.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 18px;
}
.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 12px;
}
@media (max-width: 768px) {
  .sectionHead {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
.sectionHead__icon {
  min-width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e83);
}
.sectionHead__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}
.sectionHead__subtitle {
  font-size: 14px;
  margin: 2px 0 0;
  color: var(--color-on-surface-variant, #667085);
}
.addBtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  white-space: nowrap;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 768px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (max-width: 768px) {
  .sectionHead {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
.emptyWrap {
  max-width: 720px;
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
/* badges alineados dentro del titleLeft */
.titleLeft {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap; /* por si en mobile se baja bonito */
}

/* opcional: evita que se partan raro en desktop */
.titleLeft :deep(.o-badge) {
  max-width: none;
  white-space: nowrap;
}
.level {
  font-weight: 900;
}
.statusBadge {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.statusBadge.isOk {
  background: #ecfdf3;
  color: #027a48;
  border-color: #abefc6;
}
.statusBadge.isWarn {
  background: #fffaeb;
  color: #b54708;
  border-color: #fedf89;
}

.titleRight {
  display: inline-flex;
  gap: 8px;
}
.iconBtn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.iconBtn:hover {
  background: #f3f4f6;
}
.iconBtn.danger {
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
}
.iconBtn.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.body {
  display: grid;
  gap: 10px;
}
.mainTitle {
  font-size: 14px;
  font-weight: 800;
  color: #101828;
  margin-top: 6px;
}
.meta {
  display: grid;
  gap: 10px;
}
.metaRow {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}
.metaLabel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #667085;
  font-weight: 800;
}
.metaIcon {
  font-size: 14px;
}
.metaValue {
  font-size: 12px;
  color: #101828;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.footerActions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 0;
}

/* Drawer head (slot head va dentro del head azul del drawer) */
.drawerHead__title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}
.drawerHead__subtitle {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.drawerBody {
  padding: 16px;
}

/* Form look (como tus inputs) */
.formGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 900px) {
  .formGrid {
    grid-template-columns: 1fr 1fr;
  }
}
.colSpan2 {
  grid-column: 1 / -1;
}
.field__input {
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
}
.field__input:focus {
  border-color: var(--color-primary, #1b2e83);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 27, 46, 131), 0.15);
}
.helpText {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #667085;
}

/* Attach box */
.attachBox {
  border: 1px dashed #d0d5dd;
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
}
.attachHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.attachTitle {
  font-size: 13px;
  font-weight: 900;
  color: #101828;
}
.attachSub {
  font-size: 12px;
  color: #667085;
}
.attachBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
}
.attachBtn:hover {
  background: #f3f4f6;
}
.attachFile {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #101828;
}
.attachFileName {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.linkBtn {
  border: none;
  background: transparent;
  color: var(--color-primary, #1b2e83);
  font-weight: 900;
  cursor: pointer;
}
.mutedSmall {
  font-size: 12px;
  color: #667085;
}

/* Buttons */
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.btnSecondary {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.btnDanger {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

/* drawer footer actions */
.drawerFooterActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* misc */
.muted {
  color: #667085;
  margin: 0;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
</style>
