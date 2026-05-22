<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="calendar" class="iconBig" />
        </div>
        <div>
          <h2 class="hTitle">Eventos Académicos</h2>
          <p class="hSub">Registro de participación en eventos académicos</p>
        </div>
      </div>

      <AppButton type="button" class="btnPrimary btnAdd" @click="openCreate">
        <AppIcon icon="plus" class="iconSm" />
        Agregar Evento
      </AppButton>
    </div>

    <!-- Loading -->
    <AppPulseLoading v-if="loading" />

    <!-- Stats -->
    <div class="statsGrid" v-if="!loading && events.length">
      <AppCardDashboard>
        <template #title>Total de Eventos</template>
        <template #body>
          <div class="statValue">{{ totalEvents }}</div>
          <div class="statHint">Registrados</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Como Ponente</template>
        <template #body>
          <div class="statValue primary">
            {{ eventsByRoleName['Ponente'] || 0 }}
          </div>
          <div class="statHint">Participaciones</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Como Organizador</template>
        <template #body>
          <div class="statValue success">
            {{ eventsByRoleName['Organizador'] || 0 }}
          </div>
          <div class="statHint">Participaciones</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Como Asistente</template>
        <template #body>
          <div class="statValue mutedValue">
            {{ eventsByRoleName['Asistente'] || 0 }}
          </div>
          <div class="statHint">Participaciones</div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Empty -->
    <div v-if="!loading && !events.length" class="emptyWrap">
      <AppCardDashboard>
        <template #title>No hay eventos registrados</template>
        <template #body>
          <p class="muted">Comienza agregando tu primer evento académico</p>
        </template>
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Evento
            </AppButton>
          </div>
        </template>
      </AppCardDashboard>
    </div>
    <!-- Grid -->
    <div v-else-if="!loading" class="grid-cards">
      <AppCard v-for="event in events" :key="event.id">
        <!-- TITLE -->
        <template #title>
          <div class="cardHead">
            <div class="chips">
              <AppBadge :label="event.typeName || '—'" variant="ghost" />
              <AppBadge :label="event.roleName || '—'" variant="ghost" />
            </div>

            <span v-if="event.hasCertificate" class="dotOk" title="Certificado adjunto" />
          </div>
        </template>

        <!-- BODY -->
        <template #body>
          <div class="cardBody">
            <div class="mainTitle" :title="event.eventName">
              {{ event.eventName }}
            </div>

            <div class="meta">
              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="building" class="metaIcon" />
                  Institución
                </span>

                <span class="metaValue" :title="event.organizingInstitution">
                  {{ event.organizingInstitution }}
                </span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="calendar" class="metaIcon" />
                  Año
                </span>

                <span class="metaValue">{{ event.year }}</span>
              </div>
            </div>

            <div v-if="event.description" class="desc" :title="event.description">
              {{ event.description }}
            </div>
          </div>
        </template>

        <!-- FOOTER -->
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnSecondary" @click="openEdit(event.id)">
              <AppIcon icon="pen" />
              Editar
            </AppButton>

            <AppButton type="button" class="btnDanger" @click="openModalDelete(event)">
              <AppIcon icon="trash" />
              Eliminar
            </AppButton>

            <AppButton v-if="event.hasCertificate" type="button" @click="handleViewCertificate(event)">
              <AppIcon icon="eye" />
              Ver
            </AppButton>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Drawer -->
    <AppDrawer :isVisible="isDrawerOpen" size="lg" @update:isVisible="isDrawerOpen = $event">
      <template #head>
        <div class="drawerHead">
          <div>
            <h2 class="drawerHead__title">
              {{ editingId ? 'Editar Evento Académico' : 'Agregar Evento Académico' }}
            </h2>
            <p class="drawerHead__subtitle">Registra tu participación, rol y certificado</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="gridForm">
              <div class="colSpan2">
                <AppFormField :label="'Nombre del Evento'" :form-control="v$.form.eventName">
                  <input type="text" class="form-control" required v-model="v$.form.eventName.$model" placeholder="Nombre del congreso, seminario, taller..." />
                </AppFormField>
              </div>

              <!-- ✅ Tipo (AppAutocomplete) -->
              <AppFormField :label="'Tipo'" :form-control="v$.form.eventTypeId">
                <AppAutocomplete input-id="eventTypeId" :options="eventTypeOptions" label="name" :reduce="(o:any) => o.id" v-model="v$.form.eventTypeId.$model" :clearable="true" />
              </AppFormField>

              <!-- Año -->
              <AppFormField :label="'Año'" :form-control="v$.form.year">
                <input type="number" class="form-control" min="1900" max="2100" required v-model.number="v$.form.year.$model" placeholder="Ej: 2025" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Institución / Organizador'" :form-control="v$.form.organizingInstitution">
                  <input type="text" class="form-control" required v-model="v$.form.organizingInstitution.$model" placeholder="Ej: IEEE, Universidad, Asociación..." />
                </AppFormField>
              </div>

              <!-- ✅ Rol (AppAutocomplete) -->
              <AppFormField :label="'Rol'" :form-control="v$.form.roleId">
                <AppAutocomplete input-id="roleId" :options="roleOptions" label="name" :reduce="(o:any) => o.id" v-model="v$.form.roleId.$model" :clearable="true" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Descripción'" :form-control="v$.form.description">
                  <textarea rows="5" class="form-control" v-model="v$.form.description.$model" placeholder="Descripción breve de tu participación..." />
                </AppFormField>
                <p class="charCount">{{ form.description.length }} caracteres</p>
              </div>

              <div class="colSpan2">
                <AppAttachmentDropzone
                  v-model="selectedFile"
                  v-model:certificateUrl="form.certificateUrl"
                  :isShowDelete="false"
                  isTitle="Subir Documento"
                  isHelper="PDF, DOC, DOCX (máx. 10MB)"
                  isAccept=".pdf,.doc,.docx"
                  :isMaxSizeMB="10"
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

    <!-- Modal delete -->
    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="evento académico" @confirmDelete="deleteAcademicEvent" />
    </AppModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../../shared/plugins/vuelidate.plugin';
import { useResumeStore } from '../../stores/resume.store';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAttachmentDropzone from '../../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppCardDashboard from '../../../../shared/components/Card/AppCardDashboard.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppBadge from '../../../../shared/components/AppBadge.vue';

import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';

import { GetAcademicEventsWithPaginationService } from '../../services/getAcademicEventsWithPagination.service';
import { DeleteAcademicEventsService } from '../../services/deleteAcademicEvents.service';
import { CreateOrUpdateAcademicEventsService } from '../../services/createOrUpdateAcademicEvents.service';

// ✅ NUEVOS (los que pediste)
import { CreateOrUpdateAcademicEventsCertificateService } from '../../services/createOrUpdateAcademicEventsCertificate.service';
import { GetAcademicEventsTypeService } from '../../services/getAcademicEventsType.service';
import { GetAcademicEventsRolesService } from '../../services/getAcademicEventsRoles.service';

type CatalogItem = { id: number; name: string };

interface AcademicEventApiItem {
  id: number;
  eventName: string;
  organizingInstitution: string;
  year: number;
  description?: string | null;
  certificateUrl?: string | null;

  people?: { id: number; names: string };

  // 👇 como tu GET
  eventType?: { id: number; name: string } | null;
  role?: { id: number; name: string } | null;
}

interface AcademicEventRow {
  id: number;
  eventName: string;
  organizingInstitution: string;
  year: number;
  description: string;

  eventTypeId: number | null;
  roleId: number | null;

  typeName: string;
  roleName: string;

  certificateUrl?: string | null;
  hasCertificate: boolean;
}

const getAcademicEventsWithPaginationService = new GetAcademicEventsWithPaginationService();
const deleteAcademicEventsService = new DeleteAcademicEventsService();
const createOrUpdateAcademicEventsService = new CreateOrUpdateAcademicEventsService();

// ✅ servicios extra
const createOrUpdateAcademicEventsCertificateService = new CreateOrUpdateAcademicEventsCertificateService();
const getAcademicEventsTypeService = new GetAcademicEventsTypeService();
const getAcademicEventsRolesService = new GetAcademicEventsRolesService();

export default defineComponent({
  name: 'AcademicEventsStep',
  components: {
    AppIcon,
    AppButton,
    AppDrawer,
    AppFormField,
    AppAttachmentDropzone,
    AppCardDashboard,
    AppCard,
    AppBadge,
    AppModal,
    AppConfirmDeleteModal,
    AppPulseLoading,
    AppAutocomplete,
  },
  setup() {
    const events = ref<AcademicEventRow[]>([]);

    const eventTypeOptions = ref<CatalogItem[]>([]);
    const roleOptions = ref<CatalogItem[]>([]);

    const loading = ref(true);
    const resumeStore = useResumeStore();

    const isDrawerOpen = ref(false);
    const editingId = ref<number | null>(null);
    const selectedFile = ref<File | null>(null);

    const modalDelete = ref(false);
    const currentEvent = ref<AcademicEventRow | null>(null);

    const userPeopleId = ref<number | null>(null);

    const form = reactive({
      eventName: '',
      eventTypeId: null as number | null,
      roleId: null as number | null,
      organizingInstitution: '',
      year: null as number | null,
      description: '',
      certificateUrl: '', // solo para mostrar si llega del GET
    });

    const v$ = useVuelidate(
      {
        form: {
          eventName: { required },
          eventTypeId: { required },
          roleId: { required },
          organizingInstitution: { required },
          year: { required },
          description: {},
          certificateUrl: {},
        },
      },
      { form }
    );

    const extractItems = (response: any): any[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const mapApiToRow = (x: AcademicEventApiItem): AcademicEventRow => {
      const typeId = x.eventType?.id ?? null;
      const roleId = x.role?.id ?? null;

      const typeName = x.eventType?.name ?? '—';
      const roleName = x.role?.name ?? '—';

      const cert = x.certificateUrl ?? null;

      return {
        id: x.id,
        eventName: x.eventName,
        organizingInstitution: x.organizingInstitution,
        year: x.year,
        description: x.description ?? '',

        eventTypeId: typeId,
        roleId,

        typeName,
        roleName,

        certificateUrl: cert,
        hasCertificate: !!cert,
      };
    };

    const loadCatalogs = async () => {
      // ✅ tipos
      const typeResp = await getAcademicEventsTypeService.run({ noPag: true });
      const typeItems = extractItems(typeResp) as CatalogItem[];
      eventTypeOptions.value = Array.isArray(typeItems) ? typeItems : [];

      // ✅ roles
      const roleResp = await getAcademicEventsRolesService.run({ noPag: true });
      const roleItems = extractItems(roleResp) as CatalogItem[];
      roleOptions.value = Array.isArray(roleItems) ? roleItems : [];
    };
    const loadEvents = async () => {
      const resp = await getAcademicEventsWithPaginationService.run({
        noPag: true,
      });
      const items = extractItems(resp) as AcademicEventApiItem[];
      events.value = items.map(mapApiToRow);

      // ✅ Guardar en Pinia para pintarlo en el CV
      resumeStore.setEvents(events.value);
    };

    onMounted(async () => {
      loading.value = true;
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          userPeopleId.value = user?.people?.id ?? null;
        }

        await Promise.all([loadCatalogs(), loadEvents()]);
      } finally {
        loading.value = false;
      }
    });

    // ===== Stats =====
    const totalEvents = computed(() => events.value.length);

    const eventsByRoleName = computed(() => {
      return events.value.reduce((acc, e) => {
        acc[e.roleName] = (acc[e.roleName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    });

    const resetForm = () => {
      form.eventName = '';
      form.eventTypeId = null;
      form.roleId = null;
      form.organizingInstitution = '';
      form.year = null;
      form.description = '';
      form.certificateUrl = '';

      selectedFile.value = null;
      v$.value.$reset();
    };

    const openCreate = () => {
      editingId.value = null;
      resetForm();
      isDrawerOpen.value = true;
    };

    const openEdit = (id: number) => {
      const item = events.value.find((e) => e.id === id);
      if (!item) return;

      editingId.value = id;

      form.eventName = item.eventName;
      form.eventTypeId = item.eventTypeId;
      form.roleId = item.roleId;
      form.organizingInstitution = item.organizingInstitution;
      form.year = item.year;
      form.description = item.description || '';
      form.certificateUrl = item.certificateUrl || '';

      selectedFile.value = null;
      v$.value.$reset();
      isDrawerOpen.value = true;
    };

    const closeDrawer = () => {
      isDrawerOpen.value = false;
      editingId.value = null;
      resetForm();
    };

    // ===== Delete =====
    const openModalDelete = (row: AcademicEventRow) => {
      modalDelete.value = true;
      currentEvent.value = row;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentEvent.value = null;
      await loadEvents();
    };

    const deleteAcademicEvent = async () => {
      try {
        loading.value = true;
        await deleteAcademicEventsService.run(Number(currentEvent.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando evento académico:', e);
      } finally {
        loading.value = false;
      }
    };

    const handleViewCertificate = (row: AcademicEventRow) => {
      if (!row.certificateUrl) {
        return;
      }
      window.open(row.certificateUrl, '_blank', 'noopener,noreferrer');
    };

    // ===== Save + Upload binario =====
    const handleSubmit = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;

      if (!userPeopleId.value) {
        alert('No se encontró peopleId del usuario en localStorage.');
        return;
      }

      loading.value = true;

      try {
        const id = editingId.value ? Number(editingId.value) : undefined;

        // 1) guardar/actualizar evento
        const payload: any = {
          id,
          peopleId: Number(userPeopleId.value),
          eventName: form.eventName,
          eventTypeId: Number(form.eventTypeId),
          roleId: Number(form.roleId),
          organizingInstitution: form.organizingInstitution,
          year: Number(form.year),
          description: form.description?.trim() || undefined,

          // si tu API acepta url directa (opcional). Igual el GET trae certificateUrl
          certificateUrl: form.certificateUrl?.trim() || undefined,
        };

        const saveResp = await createOrUpdateAcademicEventsService.run(payload, id);

        // ✅ fallback si update no devuelve body
        const eventId = saveResp?.data?.id ?? saveResp?.id ?? saveResp?.item?.id ?? payload.id;

        if (!eventId) throw new Error('No se pudo obtener el id del evento.');

        // 2) subir archivo SOLO si hay nuevo archivo
        if (selectedFile.value) {
          await createOrUpdateAcademicEventsCertificateService.run({
            id: Number(eventId),
            peopleId: Number(userPeopleId.value),
            archivo: selectedFile.value, // ✅ SOLO binario
          });
        }

        // 3) refrescar para traer certificateUrl actualizado
        await loadEvents();
        closeDrawer();
      } catch (e) {
        console.log('Error guardando evento académico:', e);
      } finally {
        loading.value = false;
      }
    };

    return {
      // data
      events,

      // catalogs
      eventTypeOptions,
      roleOptions,

      // state
      loading,

      // drawer + form
      isDrawerOpen,
      editingId,
      selectedFile,
      form,
      v$,

      // stats
      totalEvents,
      eventsByRoleName,

      // actions
      openCreate,
      openEdit,
      closeDrawer,
      handleSubmit,

      // delete
      modalDelete,
      openModalDelete,
      closeModalDelete,
      deleteAcademicEvent,

      // certificate
      handleViewCertificate,
    };
  },
});
</script>

<style scoped>
/* (Dejo tu CSS tal cual lo pegaste, sin tocarlo) */

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

/* Stats */
.statsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 14px;
}
@media (min-width: 900px) {
  .statsGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.statValue {
  font-size: 30px;
  font-weight: 900;
  color: #101828;
}
.statValue.primary {
  color: var(--color-primary, #1b2e83);
}
.statValue.success {
  color: #027a48;
}
.statValue.mutedValue {
  color: #667085;
}
.statHint {
  font-size: 12px;
  color: #667085;
  font-weight: 700;
}

/* Filter */
.filterRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 10px 0 14px;
}
.filterLeft {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.filterIcon {
  font-size: 16px;
  color: #667085;
}
.filterRight {
  color: #667085;
  font-size: 13px;
}
.select {
  min-width: 220px;
}

/* Empty */
.emptyWrap {
  max-width: 720px;
  margin-top: 10px;
}
.footerActions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 0;
}
.muted {
  color: #667085;
  margin: 0;
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
/* GRID como formación */
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

/* Header (badges + dot a la derecha) */
.cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.chips {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.dotOk {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #027a48;
  box-shadow: 0 0 0 5px rgba(2, 122, 72, 0.12);
  flex: 0 0 auto;
}

/* Body spacing */
.cardBody {
  padding-top: 6px;
}
.mainTitle {
  margin: 6px 0 10px;
  font-weight: 900;
  font-size: 22px;
  line-height: 1.2;
  color: #101828;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta {
  display: grid;
  gap: 12px;
  padding: 14px 0;
}
.metaRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 12px;
}
.metaLabel {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #667085;
  font-weight: 700;
}
.metaIcon {
  font-size: 18px;
  color: #98a2b3;
}
.metaValue {
  text-align: right;
  font-size: 18px;
  font-weight: 800;
  color: #101828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.desc {
  border-top: 1px solid #eef2f7;
  padding-top: 14px;
  margin-top: 4px;
  color: #667085;
  font-size: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-group {
  gap: 0.5rem;
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
</style>
