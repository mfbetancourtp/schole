<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="briefcase" class="iconBig" />
        </div>
        <div>
          <h2 class="hTitle">Experiencia Laboral</h2>
          <p class="hSub">Historial completo de tu trayectoria profesional</p>
        </div>
      </div>

      <AppButton type="button" class="btnPrimary btnAdd" @click="openCreate">
        <AppIcon icon="plus" class="iconSm" />
        Agregar Experiencia
      </AppButton>
    </div>
    <AppPulseLoading v-if="loading" />
    <!-- Empty -->
    <div v-if="!experiences.length" class="emptyWrap">
      <AppCardDashboard>
        <template #title>No hay experiencias registradas</template>
        <template #body>
          <p class="muted">Comienza agregando tu primera experiencia laboral</p>
        </template>
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Experiencia
            </AppButton>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Timeline -->
    <div v-else class="timelineWrap">
      <TimelineList :items="experiences" :itemKey="'id'" :getDotIcon="() => 'briefcase'">
        <template #item="{ item: experience }">
          <AppCard>
            <template #title>
              <div class="pos">{{ experience.role }}</div>
              <div class="company">{{ experience.companyName }}</div>
            </template>
            <template #body>
              <div class="cardTop">
                <div class="cardTopLeft">
                  <div class="grid2">
                    <div class="infoRow">
                      <AppIcon icon="calendar" class="infoIcon" />
                      <span>
                        {{ normalizeDateInput(experience.startDate) }} -
                        {{ experience.isCurrent ? 'Actualidad' : normalizeDateInput(experience.endDate) }}
                      </span>
                    </div>

                    <div class="infoRow">
                      <AppIcon icon="map-marker-alt" class="infoIcon" />
                      <span>
                        {{ experience.municipality?.name || '—' }},
                        {{ experience.countryEntity?.name || '—' }}
                      </span>
                    </div>

                    <div class="infoRow">
                      <AppIcon icon="user" class="infoIcon" />
                      <span class="truncate">
                        {{ experience.directSupervisor || '—' }}
                      </span>
                    </div>

                    <div class="infoRow">
                      <AppIcon icon="phone" class="infoIcon" />
                      <span>{{ experience.contactNumber || '—' }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="experience.functions" class="functionsBox">
                  <p class="fnLabel">Resumen de Funciones:</p>
                  <p class="fnText">{{ experience.functions }}</p>
                </div>
              </div>
            </template>
            <template #footer>
              <div class="actions">
                <AppButton type="button" class="btnSecondary" @click="openEdit(experience.id)">
                  <AppIcon icon="pen" />
                  Editar
                </AppButton>

                <AppButton type="button" class="btnDanger" @click="openModalDelete(experience)">
                  <AppIcon icon="trash" />
                  Eliminar
                </AppButton>
              </div>
            </template>
          </AppCard>
        </template>
      </TimelineList>
    </div>

    <!-- Drawer (AppDrawer) -->
    <AppDrawer :isVisible="isDrawerOpen" size="lg" @update:isVisible="isDrawerOpen = $event">
      <template #head>
        <div class="drawerHead">
          <div>
            <h2 class="drawerHead__title">
              {{ editingId ? 'Editar Experiencia Laboral' : 'Agregar Experiencia Laboral' }}
            </h2>
            <p class="drawerHead__subtitle">Registra tu trayectoria profesional</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="gridForm">
              <AppFormField :label="'Empresa'" :form-control="v$.form.companyName">
                <input type="text" class="form-control" v-model="v$.form.companyName.$model" placeholder="Nombre de la empresa u organización" />
              </AppFormField>

              <AppFormField :label="'Cargo'" :form-control="v$.form.role">
                <input type="text" class="form-control" v-model="v$.form.role.$model" placeholder="Cargo desempeñado" />
              </AppFormField>

              <AppFormField :label="'Fecha de Inicio'" :form-control="v$.form.startDate">
                <input type="date" class="form-control" v-model="v$.form.startDate.$model" />
              </AppFormField>

              <div>
                <AppFormField :label="'Fecha de Fin'" :form-control="v$.form.endDate">
                  <input type="date" class="form-control" :disabled="isCurrentPosition" :class="{ disabled: isCurrentPosition }" v-model="v$.form.endDate.$model" />
                </AppFormField>

                <div class="checkRow">
                  <input id="current-position" type="checkbox" v-model="isCurrentPosition" @change="toggleCurrent" />
                  <label for="current-position">Trabajo aquí actualmente</label>
                </div>
              </div>

              <!-- País (countryId) -->
              <AppFormField :label="'País'" :form-control="v$.form.countryId">
                <AppGeographicSearch :key="'country-' + drawerKey" :search-key="'country'" :id="v$.form.countryId.$model" @geographic-data="(data:any) => (v$.form.countryId.$model = data.id)" />
              </AppFormField>
              <!-- Municipio (municipalityId) -->
              <AppFormField :label="'Ciudad / Municipio'" :form-control="v$.form.municipalityId">
                <AppGeographicSearch
                  :key="'city-' + drawerKey"
                  :search-key="'city'"
                  :country-id="v$.form.countryId.$model"
                  :id="v$.form.municipalityId.$model"
                  @geographic-data="(data:any) => (v$.form.municipalityId.$model = data.id)"
                />
              </AppFormField>
              <AppFormField :label="'Jefe Directo'" :form-control="v$.form.directSupervisor">
                <input type="text" class="form-control" v-model="v$.form.directSupervisor.$model" placeholder="Nombre del jefe directo" />
              </AppFormField>

              <AppFormField :label="'Número de Contacto'" :form-control="v$.form.contactNumber">
                <input type="tel" class="form-control" v-model="v$.form.contactNumber.$model" placeholder="+57 3001234567" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Funciones'" :form-control="v$.form.functions">
                  <textarea rows="8" class="form-control" v-model="v$.form.functions.$model" placeholder="Describe las funciones y responsabilidades principales del cargo..." />
                </AppFormField>
                <p class="charCount">{{ form.functions.length }} caracteres</p>
              </div>
              <div class="colSpan2">
                <AppAttachmentDropzone
                  v-model="selectedFile"
                  v-model:certificateUrl="form.certificateUrl"
                  :isShowDelete="false"
                  isTitle="Adjuntar Soporte (Opcional)"
                  isHelper="PDF, DOC, DOCX (máx. 5MB)"
                  isAccept=".pdf,.doc,.docx"
                  :isMaxSizeMB="5"
                />
              </div>
            </div>
          </form>
        </div>
      </template>

      <template #footer>
        <div class="drawerFooter">
          <AppButton type="button" class="btnSecondary" @click="closeDrawer"> Cancelar </AppButton>

          <AppButton type="button" class="btnPrimary" @click="handleSubmit">
            <AppIcon icon="save" class="iconSm" />
            {{ 'Guardar' }}
          </AppButton>
        </div>
      </template>
    </AppDrawer>

    <!-- Modal Delete -->
    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="experiencia laboral" @confirmDelete="deleteWorkExperience" />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../../shared/plugins/vuelidate.plugin';
import { useResumeStore } from '../../stores/resume.store';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppCardDashboard from '../../../../shared/components/Card/AppCardDashboard.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAttachmentDropzone from '../../../../shared/components/Forms/AppAttachmentDropzone.vue';
import TimelineList from '../../../../shared/components/TimeLine/TimelineList.vue';

import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppGeographicSearch from '../../../../shared/components/Forms/AppGeographicSearch.vue';

import { GetWorkExperiencesWithPaginationService } from '../../services/getWorkExperiencesWithPagination.service';
import { GetEducationTypesService } from '../../services/getEducationTypes.service';
import { CreateOrUpdateWorkExperiencesService } from '../../services/createOrUpdateWorkExperiences.service';
import { DeleteWorkExperiencesService } from '../../services/deleteWorkExperiences.service';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';
import { CreateOrUpdateWorkExperiencesCertificateService } from '../../services/createOrUpdateWorkExperiencesCertificate.service';

interface WorkExperienceApiItem {
  id: number;
  companyName: string;
  role: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD | null
  directSupervisor?: string | null;
  contactNumber?: string | null;
  functions?: string | null;
  certificateUrl?: string | null;

  people?: { id: number; names: string };
  countryEntity?: { id: number; name: string };
  municipality?: { id: number; name: string };
}

const getWorkExperiencesWithPaginationService = new GetWorkExperiencesWithPaginationService();
const getEducationTypesService = new GetEducationTypesService(); // (lo dejas listo por si necesitas cats/tipos)
const createOrUpdateWorkExperiencesService = new CreateOrUpdateWorkExperiencesService();
const deleteWorkExperiencesService = new DeleteWorkExperiencesService();
const createOrUpdateWorkExperiencesCertificateService = new CreateOrUpdateWorkExperiencesCertificateService();
export default defineComponent({
  name: 'WorkExperienceStep',
  components: {
    AppIcon,
    AppButton,
    AppCard,
    AppCardDashboard,
    AppDrawer,
    AppFormField,
    AppAttachmentDropzone,
    TimelineList,
    AppModal,
    AppConfirmDeleteModal,
    AppGeographicSearch,
    AppPulseLoading,
  },
  setup() {
    const experiences = ref<WorkExperienceApiItem[]>([]);
    const isDrawerOpen = ref(false);
    const editingId = ref<string | null>(null);
    const drawerKey = ref(0);
    const loading = ref(true); // ✅ global
    const resumeStore = useResumeStore();
    const selectedFile = ref<File | null>(null);
    const isCurrentPosition = ref(false);

    const modalDelete = ref(false);
    const currentExperience = ref<WorkExperienceApiItem | null>(null);

    const userPeopleId = ref<number | null>(null);

    const form = reactive({
      companyName: '',
      role: '',
      startDate: '',
      endDate: '',
      countryId: undefined as number | undefined,
      municipalityId: null as number | null,
      directSupervisor: '',
      contactNumber: '',
      functions: '',
      certificateUrl: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          companyName: { required },
          role: { required },
          startDate: { required },
          endDate: {},
          countryId: { required },
          municipalityId: { required },
          directSupervisor: { required },
          contactNumber: { required },
          functions: { required },
          certificateUrl: {},
        },
      },
      { form }
    );

    const normalizeDateInput = (d?: string | null) => {
      if (!d) return '';
      return String(d).slice(0, 10);
    };

    // Si tienes tipos/catálogos desde backend, acá los puedes cargar
    const educationTypes = ref<any[]>([]);
    const loadEducationTypes = async () => {
      try {
        const response = await getEducationTypesService.run();
        educationTypes.value = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
      } catch (e) {
        // opcional: log
      }
    };

    const extractItemsFromResponse = (response: any): WorkExperienceApiItem[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const loadExperiences = async () => {
      const response = await getWorkExperiencesWithPaginationService.run({
        noPag: true,
      });
      const items = extractItemsFromResponse(response);

      experiences.value = items.map((x: any) => ({
        ...x,
        endDate: x.endDate ?? null,
        isCurrent: !x.endDate,
      }));

      // ✅ Guardar en estado global para el CV
      resumeStore.setExperience(experiences.value);
    };

    onMounted(async () => {
      loading.value = true;
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          userPeopleId.value = user?.people?.id ?? null;
        }

        await Promise.all([loadExperiences(), loadEducationTypes()]);
      } finally {
        loading.value = false;
      }
    });

    watch(
      () => isCurrentPosition.value,
      (val) => {
        if (val) form.endDate = '';
      }
    );

    const resetForm = () => {
      form.companyName = '';
      form.role = '';
      form.startDate = '';
      form.endDate = '';
      form.countryId = undefined;
      form.municipalityId = null;
      form.directSupervisor = '';
      form.contactNumber = '';
      form.functions = '';
      form.certificateUrl = '';
      selectedFile.value = null;
      isCurrentPosition.value = false;
      v$.value.$reset();
    };

    const openCreate = () => {
      editingId.value = null;
      resetForm();
      drawerKey.value++;
      isDrawerOpen.value = true;
    };

    const openEdit = (id: number) => {
      const item = experiences.value.find((e) => e.id === id);
      if (!item) return;

      editingId.value = String(item.id);
      resetForm();

      form.companyName = item.companyName || '';
      form.role = item.role || '';
      form.startDate = normalizeDateInput(item.startDate);
      form.endDate = normalizeDateInput(item.endDate || '');
      form.countryId = item.countryEntity?.id ?? undefined;
      form.municipalityId = item.municipality?.id ?? null;
      form.directSupervisor = item.directSupervisor || '';
      form.contactNumber = item.contactNumber || '';
      form.functions = (item.functions as any) || '';
      form.certificateUrl = item.certificateUrl ?? '';
      selectedFile.value = null; // ✅ para que solo suba si cambia el archivo
      isCurrentPosition.value = !item.endDate;
      if (isCurrentPosition.value) form.endDate = '';

      drawerKey.value++;
      isDrawerOpen.value = true;
    };

    const closeDrawer = () => {
      isDrawerOpen.value = false;
      editingId.value = null;
      resetForm();
    };

    const toggleCurrent = () => {
      if (isCurrentPosition.value) form.endDate = '';
    };

    // ===== Delete modal =====
    const openModalDelete = (item: WorkExperienceApiItem) => {
      modalDelete.value = true;
      currentExperience.value = item;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentExperience.value = null;
      await loadExperiences();
    };

    const deleteWorkExperience = async () => {
      try {
        await deleteWorkExperiencesService.run(Number(currentExperience.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando experiencia laboral:', e);
      }
    };

    // ===== Save =====
    const handleSubmit = async () => {
      const baseValid = await v$.value.$validate();
      if (!baseValid) return;

      if (!isCurrentPosition.value && !form.endDate) {
        alert('Selecciona fecha de fin o marca "Trabajo aquí actualmente"');
        return;
      }

      loading.value = true;

      try {
        const id = editingId.value ? Number(editingId.value) : undefined;

        const payload: any = {
          id,
          peopleId: Number(userPeopleId.value),
          companyName: form.companyName,
          role: form.role,
          startDate: form.startDate,
          endDate: isCurrentPosition.value ? undefined : form.endDate,
          countryId: form.countryId as number,
          municipalityId: form.municipalityId as number,
          directSupervisor: form.directSupervisor,
          contactNumber: form.contactNumber,
          functions: form.functions,
          certificateUrl: form.certificateUrl || undefined, // si tu API lo guarda
        };

        // 1) guardar/actualizar experiencia
        const saveResp = await createOrUpdateWorkExperiencesService.run(payload, payload.id);

        // 2) obtener id (fallback en update)
        const experienceId = saveResp?.data?.id ?? saveResp?.id ?? saveResp?.item?.id ?? payload.id;

        if (!experienceId) throw new Error('No se pudo obtener el id de la experiencia');

        // 3) subir archivo SOLO si el usuario seleccionó uno nuevo
        if (selectedFile.value) {
          await createOrUpdateWorkExperiencesCertificateService.run({
            id: Number(experienceId),
            peopleId: Number(userPeopleId.value),
            archivo: selectedFile.value, // ✅ binario
            // peopleId: Number(userPeopleId.value), // 👈 descomenta si tu backend lo exige
          });
        }

        // 4) refrescar para que el GET traiga el certificateUrl actualizado
        await loadExperiences();
        closeDrawer();
      } catch (e) {
        console.log('Error guardando experiencia laboral:', e);
      } finally {
        loading.value = false;
      }
    };

    return {
      experiences,

      // drawer
      isDrawerOpen,
      editingId,

      // form
      form,
      v$,
      selectedFile,
      isCurrentPosition,

      // actions
      openCreate,
      openEdit,
      closeDrawer,
      handleSubmit,
      toggleCurrent,

      // delete
      modalDelete,
      currentExperience,
      openModalDelete,
      closeModalDelete,
      deleteWorkExperience,

      // helpers
      normalizeDateInput,
      loading,
      drawerKey,
      // optional
      educationTypes,
    };
  },
});
</script>

<style scoped>
/* ===== Mantengo tu mismo look ===== */

/* Header */
.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 18px;
}
@media (max-width: 768px) {
  .sectionHead {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
.headerLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}
.iconBox {
  padding: 12px;
  background: #eff6ff;
  border-radius: 12px;
}
.iconBig {
  font-size: 28px;
  color: #1e3a8a;
}
.iconSm {
  font-size: 16px;
}
.hTitle {
  margin: 0;
  font-weight: 700;
  color: #111827;
  font-size: 18px;
}
.hSub {
  margin: 4px 0 0;
  color: #4b5563;
  font-size: 13px;
}

.btnAdd {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* Empty */
.emptyWrap {
  max-width: 720px;
}
.footerActions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 0;
}

/* Card content */
.pos {
  color: #111827;
}
.company {
  margin: 0;
  font-weight: 600;
  color: #1e3a8a;
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  color: #4b5563;
  font-size: 13px;
  margin-top: 10px;
}
@media (min-width: 768px) {
  .grid2 {
    grid-template-columns: 1fr 1fr;
    column-gap: 24px;
  }
}
.infoRow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.infoIcon {
  font-size: 14px;
  color: #9ca3af;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.functionsBox {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.fnLabel {
  margin: 0 0 6px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}
.fnText {
  margin: 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 0;
}

/* Drawer */
.drawerHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.drawerHead__title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}
.drawerHead__subtitle {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}
.drawerClose {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
}
.drawerClose:hover {
  background: rgba(255, 255, 255, 0.25);
}

.drawerBody {
  padding: 16px;
}
.gridForm {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 900px) {
  .gridForm {
    grid-template-columns: 1fr 1fr;
  }
}
.colSpan2 {
  grid-column: 1 / -1;
}

.disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}
.checkRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: #4b5563;
  font-size: 13px;
}
.charCount {
  margin: -8px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.drawerFooter {
  display: flex;
  justify-content: flex-end;
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
.muted {
  color: #667085;
  margin: 0;
}
.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sectionHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e83);
}
</style>
