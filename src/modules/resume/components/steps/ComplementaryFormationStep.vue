<template>
  <div>
    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="award" />
        </div>

        <div class="w-100">
          <h3 class="sectionHead__title">Formación Complementaria</h3>
          <p class="sectionHead__subtitle">Educación No Formal</p>
        </div>
      </div>

      <AppButton type="button" class="btnPrimary addBtn" @click="openCreate">
        <AppIcon icon="plus" />
        Agregar Formación
      </AppButton>
    </div>
    <AppPulseLoading v-if="loading" />
    <!-- Stats -->
    <div class="statsGrid">
      <AppCardDashboard>
        <template #title>Total de Formaciones</template>
        <template #body>
          <div class="statValue primary">{{ formations.length }}</div>
          <div class="statHint">Registros en tu hoja de vida</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Intensidad Total</template>
        <template #body>
          <div class="statValue">{{ totalHours }} <span class="statUnit">hrs</span></div>
          <div class="statHint">Suma de horas reportadas</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Tipos Diferentes</template>
        <template #body>
          <div class="statValue">{{ typeKeys.length }}</div>
          <div class="statHint">Categorías registradas</div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Distribución por tipo -->
    <div v-if="typeKeys.length" class="distWrap">
      <AppCardDashboard>
        <template #title>
          <div class="distTitleRow">
            <AppIcon icon="chart-line" />
            <span>Distribución por Tipo</span>
          </div>
        </template>

        <template #body>
          <div class="distBadges">
            <div v-for="k in typeKeys" :key="k" class="distItem">
              <AppBadge :label="k">
                <span class="distCount">{{ typeCount[k] }}</span>
              </AppBadge>
            </div>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Empty -->
    <div v-if="!formations.length" class="emptyWrap">
      <AppCardDashboard>
        <template #title>No hay formaciones complementarias registradas</template>
        <template #body>
          <p class="muted">Comienza agregando cursos, diplomados, certificaciones y más.</p>
        </template>
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Formación
            </AppButton>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Grid -->
    <div v-else class="grid-cards">
      <AppCard v-for="f in formations" :key="f.id">
        <template #title>
          <div class="cardTitleRow">
            <div class="titleLeft">
              <AppBadge :label="f.educationLevel?.name || '—'" />
            </div>
          </div>
        </template>

        <template #body>
          <div class="body">
            <div class="mainTitle" :title="f.courseName">
              {{ f.courseName }}
            </div>

            <div class="meta">
              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="university" class="metaIcon" />
                  Institución
                </span>
                <span class="metaValue clamp2" :title="f.institution">
                  {{ f.institution }}
                </span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="globe" class="metaIcon" />
                  País
                </span>
                <span class="metaValue" :title="f.country?.name">
                  {{ f.country?.name || '—' }}
                </span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="clock" class="metaIcon" />
                  Intensidad
                </span>
                <span class="metaValue">{{ f.hourlyIntensity }} horas</span>
              </div>

              <div class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="calendar" class="metaIcon" />
                  Finalización
                </span>
                <span class="metaValue">{{ normalizeDateInput(f.dateCompletion) }}</span>
              </div>

              <div v-if="f.certifiedCode" class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="shield-alt" class="metaIcon" />
                  Código
                </span>
                <span class="metaValue mono" :title="f.certifiedCode">
                  {{ f.certifiedCode }}
                </span>
              </div>

              <div v-if="f.certificateUrl" class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="paperclip" class="metaIcon" />
                  Soporte
                </span>
                <span class="metaValue">Adjunto</span>
              </div>
              <div v-else class="metaRow">
                <span class="metaLabel">
                  <AppIcon icon="paperclip" class="metaIcon" />
                  Soporte
                </span>
                <span class="metaValue">Sin adjunto</span>
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
            <p class="drawerHead__subtitle">Registra educación no formal</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <!-- Tipo (levelTypeId) -->
              <AppFormField :form-control="v$.form.levelTypeId" label="Tipo">
                <AppAutocomplete input-id="levelTypeId" :options="levelTypes" label="name" :reduce="(o:any) => o.id" v-model="v$.form.levelTypeId.$model" :clearable="true" />
              </AppFormField>

              <!-- Intensidad (hourlyIntensity) -->
              <AppFormField :form-control="v$.form.hourlyIntensity" label="Intensidad Horaria">
                <input type="number" min="1" class="form-control" v-model.number="v$.form.hourlyIntensity.$model" placeholder="Ej: 40" />
              </AppFormField>
            </div>

            <!-- Nombre (courseName) -->
            <AppFormField :form-control="v$.form.courseName" label="Curso / Certificación">
              <input type="text" class="form-control" v-model="v$.form.courseName.$model" placeholder="Ej: Diplomado en Desarrollo Backend con NestJS" />
            </AppFormField>

            <div class="form-row">
              <AppFormField :form-control="v$.form.institution" label="Institución">
                <input type="text" class="form-control" v-model="v$.form.institution.$model" placeholder="Nombre de la institución" />
              </AppFormField>

              <!-- País (countryId) -->
              <AppFormField :form-control="v$.form.countryId" label="País">
                <AppGeographicSearch :key="drawerKey" :search-key="'country'" :id="v$.form.countryId.$model" @geographic-data="(data:any) => (v$.form.countryId.$model = data.id)" />
              </AppFormField>
            </div>

            <!-- Fecha (dateCompletion) -->
            <div class="form-row">
              <AppFormField :form-control="v$.form.dateCompletion" label="Fecha de finalización">
                <input type="date" class="form-control" v-model="v$.form.dateCompletion.$model" />
              </AppFormField>

              <!-- Código (certifiedCode) -->
              <AppFormField :form-control="v$.form.certifiedCode" label="Código (Opcional)">
                <input type="text" class="form-control mono" v-model="v$.form.certifiedCode.$model" placeholder="Ej: CERT-2024-001" />
              </AppFormField>
            </div>

            <!-- Si luego vas a subir archivo, aquí puedes convertirlo a URL antes de guardar -->
            <div class="colSpan2">
              <AppAttachmentDropzone
                v-model="selectedFile"
                v-model:certificateUrl="form.certificateUrl"
                :isShowDelete="false"
                isTitle="Adjuntar Certificado"
                isHelper="PDF, DOC, DOCX (máx. 5MB)"
                isAccept=".pdf,.doc,.docx"
                :isMaxSizeMB="5"
              />
            </div>
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

    <!-- Modal delete -->
    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="formación complementaria" @confirmDelete="deleteSupplementaryTraining" />
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
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppBadge from '../../../../shared/components/AppBadge.vue';
import AppCardDashboard from '../../../../shared/components/Card/AppCardDashboard.vue';
import AppAttachmentDropzone from '../../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppGeographicSearch from '../../../../shared/components/Forms/AppGeographicSearch.vue';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';

import { GetSupplementaryTrainingsWithPaginationService } from '../../services/getSupplementaryTrainingsWithPagination.service';
import { GetEducationTypesService } from '../../services/getEducationTypes.service';
import { CreateOrUpdateSupplementaryTrainingsService } from '../../services/createOrUpdateSupplementaryTrainings.service';
import { DeleteSupplementaryTrainingsService } from '../../services/deleteSupplementaryTrainings.service';
import { CreateOrUpdateSupplementaryTrainingsCertificateService } from '../../services/createOrUpdateSupplementaryTrainingsCertificate.service';

interface SupplementaryTraining {
  id: number;
  hourlyIntensity: number;
  courseName: string;
  institution: string;
  dateCompletion: string;
  educationLevel?: { id: number; name: string };
  country?: { id: number; name: string };
  certifiedCode?: string;
  certificateUrl?: string;
}

const getSupplementaryTrainingsWithPaginationService = new GetSupplementaryTrainingsWithPaginationService();
const getEducationTypesService = new GetEducationTypesService();
const createOrUpdateSupplementaryTrainingsService = new CreateOrUpdateSupplementaryTrainingsService();
const createOrUpdateSupplementaryTrainingsCertificateService = new CreateOrUpdateSupplementaryTrainingsCertificateService();
const deleteSupplementaryTrainingsService = new DeleteSupplementaryTrainingsService();

export default defineComponent({
  name: 'ComplementaryFormationStep',
  components: {
    AppIcon,
    AppButton,
    AppFormField,
    AppDrawer,
    AppBadge,
    AppCardDashboard,
    AppAttachmentDropzone,
    AppCard,
    AppModal,
    AppConfirmDeleteModal,
    AppGeographicSearch,
    AppPulseLoading,
    AppAutocomplete,
  },
  setup() {
    const formations = ref<SupplementaryTraining[]>([]);
    const levelTypes = ref<Array<{ id: number; name: string }>>([]);
    const resumeStore = useResumeStore();
    const loading = ref(true); // ✅ global

    const drawerOpen = ref(false);
    const editingId = ref<string | null>(null);
    const drawerKey = ref(0);

    const selectedFile = ref<File | null>(null); // ✅ nuevo archivo

    const modalDelete = ref(false);
    const currentFormation = ref<SupplementaryTraining | null>(null);

    const userPeopleId = ref<number | null>(null);

    const form = reactive({
      levelTypeId: null as number | null,
      hourlyIntensity: null as number | null,
      courseName: '',
      institution: '',
      countryId: null as number | null,
      dateCompletion: '', // YYYY-MM-DD
      certifiedCode: '',
      certificateUrl: '', // ✅ siempre viene del GET
    });

    const v$ = useVuelidate(
      {
        form: {
          levelTypeId: { required },
          hourlyIntensity: { required },
          courseName: { required },
          institution: { required },
          countryId: { required },
          dateCompletion: { required },
          certifiedCode: {},
          certificateUrl: {},
        },
      },
      { form }
    );

    const drawerTitle = computed(() => (editingId.value ? 'Editar Formación Complementaria' : 'Agregar Formación Complementaria'));

    const normalizeDateInput = (d?: string | null) => (d ? String(d).slice(0, 10) : '');

    const extractItems = (response: any): SupplementaryTraining[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const loadFormations = async () => {
      const response = await getSupplementaryTrainingsWithPaginationService.run({ noPag: true });

      formations.value = extractItems(response);

      // ✅ Guardar en estado global para el CV
      resumeStore.setComplementary(formations.value);
    };

    const loadLevelTypes = async () => {
      const response = await getEducationTypesService.run({
        noPag: true,
        educationCategoryId: 13, // 👈 si tu backend diferencia formal/no formal, ajusta este id
        lastLevelOnly: true,
      });

      levelTypes.value = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.data?.items)
        ? response.data.items
        : [];
    };

    onMounted(async () => {
      loading.value = true;

      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          userPeopleId.value = user?.people?.id ?? null;
        }

        await Promise.all([loadFormations(), loadLevelTypes()]);
      } finally {
        loading.value = false;
      }
    });

    const resetForm = () => {
      form.levelTypeId = null;
      form.hourlyIntensity = null;
      form.courseName = '';
      form.institution = '';
      form.countryId = null;
      form.dateCompletion = '';
      form.certifiedCode = '';
      form.certificateUrl = '';

      selectedFile.value = null;
      v$.value.$reset();
    };

    const openCreate = () => {
      editingId.value = null;
      resetForm();
      drawerKey.value++;
      drawerOpen.value = true;
    };

    const openEdit = (id: number) => {
      const item = formations.value.find((x) => x.id === id);
      if (!item) return;

      editingId.value = String(item.id);

      form.levelTypeId = item.educationLevel?.id ?? null;
      form.hourlyIntensity = item.hourlyIntensity ?? null;
      form.courseName = item.courseName ?? '';
      form.institution = item.institution ?? '';
      form.countryId = item.country?.id ?? null;
      form.dateCompletion = normalizeDateInput(item.dateCompletion);
      form.certifiedCode = item.certifiedCode ?? '';
      form.certificateUrl = item.certificateUrl ?? ''; // ✅ pinto URL

      selectedFile.value = null; // ✅ no hay nuevo archivo aún
      v$.value.$reset();
      drawerKey.value++;
      drawerOpen.value = true;
    };

    const closeDrawer = () => {
      drawerOpen.value = false;
      editingId.value = null;
      resetForm();
    };

    const handleSubmit = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      loading.value = true;

      try {
        const payload: any = {
          id: editingId.value ? Number(editingId.value) : undefined,
          peopleId: Number(userPeopleId.value),
          levelTypeId: form.levelTypeId as number,
          hourlyIntensity: Number(form.hourlyIntensity),
          courseName: form.courseName,
          institution: form.institution,
          countryId: form.countryId as number,
          dateCompletion: form.dateCompletion,
          certifiedCode: form.certifiedCode?.trim() || undefined,
          certificateUrl: form.certificateUrl || undefined, // si tu API lo guarda
        };

        // 1) guardar/actualizar
        const saveResp = await createOrUpdateSupplementaryTrainingsService.run(payload, payload.id);

        // ✅ fallback cuando update no devuelve body
        const trainingId = saveResp?.data?.id ?? saveResp?.id ?? saveResp?.item?.id ?? payload.id;

        if (!trainingId) throw new Error('No se pudo obtener el id');

        // 2) ✅ SOLO si se seleccionó un archivo nuevo
        if (selectedFile.value) {
          await createOrUpdateSupplementaryTrainingsCertificateService.run({
            id: Number(trainingId),
            peopleId: Number(userPeopleId.value),
            archivo: selectedFile.value, // ✅ binario
          });
        }

        // 3) refrescar para traer certificateUrl actualizado
        await loadFormations();
        closeDrawer();
      } catch (e) {
        console.log('Error guardando formación complementaria:', e);
      } finally {
        loading.value = false;
      }
    };

    // ===== Delete =====
    const openModalDelete = (item: SupplementaryTraining) => {
      modalDelete.value = true;
      currentFormation.value = item;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentFormation.value = null;
      await loadFormations();
    };

    const deleteSupplementaryTraining = async () => {
      try {
        await deleteSupplementaryTrainingsService.run(Number(currentFormation.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando formación complementaria:', e);
      }
    };

    // ===== Stats =====
    const totalHours = computed(() => formations.value.reduce((acc, f) => acc + (Number(f.hourlyIntensity) || 0), 0));

    const typeCount = computed(() => {
      return formations.value.reduce((acc, f) => {
        const key = f.educationLevel?.name || '—';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    });

    const typeKeys = computed(() => Object.keys(typeCount.value));

    return {
      formations,
      levelTypes,

      loading,

      drawerOpen,
      drawerTitle,
      editingId,

      selectedFile,
      form,
      v$,

      openCreate,
      openEdit,
      closeDrawer,
      handleSubmit,

      modalDelete,
      currentFormation,
      openModalDelete,
      closeModalDelete,
      deleteSupplementaryTraining,

      totalHours,
      typeCount,
      typeKeys,
      normalizeDateInput,
      drawerKey,
    };
  },
});
</script>

<style scoped>
/* Header */
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

/* Stats */
.statsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-bottom: 14px;
}
@media (min-width: 900px) {
  .statsGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .sectionHead {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
.statValue {
  font-size: 34px;
  font-weight: 900;
  color: #101828;
}
.statValue.primary {
  color: var(--color-primary, #1b2e83);
}
.statUnit {
  font-size: 16px;
  color: #667085;
  font-weight: 800;
}
.statHint {
  font-size: 12px;
  color: #667085;
  font-weight: 700;
}

/* Distribution */
.distWrap {
  margin-bottom: 14px;
}
.distTitleRow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.distBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}
.distItem :deep(.o-badge) {
  gap: 10px;
}
.distCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.35);
}

.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.titleLeft {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.body {
  display: grid;
  gap: 10px;
}
.mainTitle {
  font-size: 14px;
  font-weight: 900;
  color: #101828;
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta {
  display: grid;
  gap: 10px;
}
.metaRow {
  display: grid;
  grid-template-columns: 120px 1fr; /* ancho fijo para etiqueta, resto para valor */
  align-items: center;
}
.metaLabel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #667085;
  font-weight: 900;
  min-width: 0;
  white-space: nowrap;
}
.metaIcon {
  font-size: 14px;
}
.metaValue {
  font-size: 12px;
  color: #101828;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Para campos largos como institución (2 líneas máx) */
.clamp2 {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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

/* Drawer */
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

.colSpan2 {
  grid-column: 1 / -1;
}

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
.drawerFooterActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.muted {
  color: #667085;
  margin: 0;
}
</style>
