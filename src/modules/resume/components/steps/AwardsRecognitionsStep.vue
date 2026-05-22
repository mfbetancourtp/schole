<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="trophy" class="iconBig trophyIcon" />
        </div>
        <div>
          <h2 class="hTitle">Premios y Reconocimientos</h2>
          <p class="hSub">Distinciones y méritos académicos obtenidos</p>
        </div>
      </div>

      <AppButton type="button" class="btnPrimary btnAdd" @click="openCreate">
        <AppIcon icon="plus" class="iconSm" />
        Agregar Reconocimiento
      </AppButton>
    </div>

    <!-- ✅ Loading -->
    <AppPulseLoading v-if="loading" />

    <!-- Stats -->
    <div class="statsGrid" v-if="!loading && awards.length">
      <AppCardDashboard>
        <template #title>
          <div class="statTitleRow">
            <AppIcon icon="award" />
            <span>Total</span>
          </div>
        </template>
        <template #body>
          <div class="statValue">{{ awards.length }}</div>
          <div class="statHint">Reconocimientos</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard v-for="y in recentYears" :key="y">
        <template #title>Año {{ y }}</template>
        <template #body>
          <div class="statValue primary">{{ awardsByYear[y] }}</div>
          <div class="statHint">Registrados</div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Empty -->
    <div v-if="!loading && !awards.length" class="emptyWrap">
      <AppCardDashboard>
        <template #title>No hay reconocimientos registrados</template>
        <template #body>
          <p class="muted">Comienza agregando tu primer premio o reconocimiento</p>
        </template>
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Reconocimiento
            </AppButton>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Cards -->
    <div v-else-if="!loading" class="grid-cards">
      <AppCard v-for="award in awards" :key="award.id">
        <!-- TITLE -->
        <template #title>
          <div class="cardHead">
            <div class="chips">
              <div class="badgeIcon">
                <AppIcon icon="award" class="awardIcon" />
              </div>

              <div class="headText">
                <div class="headTitleRow">
                  <h3 class="cardTitle" :title="award.name">
                    {{ award.name }}
                  </h3>

                  <span v-if="award.hasDocument" class="dotOk" title="Documento adjunto" />
                </div>

                <div class="meta">
                  <div class="metaRow">
                    <span class="metaLabel">
                      <AppIcon icon="building" class="metaIcon" />
                      Entidad
                    </span>
                    <span class="metaValue" :title="award.grantingEntity">
                      {{ award.grantingEntity }}
                    </span>
                  </div>

                  <div class="metaRow">
                    <span class="metaLabel">
                      <AppIcon icon="calendar" class="metaIcon" />
                      Año
                    </span>
                    <span class="metaValue">{{ award.year }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- BODY -->
        <template #body>
          <div class="cardBody">
            <div v-if="award.description" class="desc" :title="award.description">
              {{ award.description }}
            </div>
          </div>
        </template>

        <!-- FOOTER -->
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnSecondary" @click="openEdit(award.id)">
              <AppIcon icon="pen" />
              Editar
            </AppButton>

            <AppButton type="button" class="btnDanger" @click="openModalDelete(award)">
              <AppIcon icon="trash" />
              Eliminar
            </AppButton>

            <AppButton v-if="award.certificateUrl" type="button" @click="handleViewDocument(award)">
              <AppIcon icon="eye" />
              Ver
            </AppButton>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Note -->
    <div v-if="!loading && awards.length" class="note">
      <h4 class="noteTitle">Sobre los reconocimientos:</h4>
      <ul class="noteList">
        <li>Los reconocimientos deben estar respaldados por documentación oficial.</li>
        <li>Incluye premios académicos, distinciones institucionales y reconocimientos profesionales.</li>
        <li>Esta información puede ser visible en documentos oficiales y hojas de vida públicas.</li>
      </ul>
    </div>

    <!-- Modal delete -->
    <AppModal v-model="modalDelete">
      <AppConfirmDeleteModal v-if="modalDelete" entity="reconocimiento" @confirmDelete="deleteAward" />
    </AppModal>

    <!-- Drawer -->
    <AppDrawer :isVisible="isDrawerOpen" size="lg" @update:isVisible="isDrawerOpen = $event">
      <template #head>
        <div class="drawerHead">
          <div>
            <h2 class="drawerHead__title">
              {{ editingId ? 'Editar Reconocimiento' : 'Agregar Reconocimiento' }}
            </h2>
            <p class="drawerHead__subtitle">Registra el mérito y adjunta el soporte (opcional)</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="gridForm">
              <div class="colSpan2">
                <AppFormField :label="'Nombre del Reconocimiento'" :form-control="v$.form.name">
                  <input type="text" class="form-control" required v-model="v$.form.name.$model" placeholder="Ej: Premio Nacional de Investigación..." />
                </AppFormField>
              </div>

              <AppFormField :label="'Entidad Otorgante'" :form-control="v$.form.grantingEntity">
                <input type="text" class="form-control" required v-model="v$.form.grantingEntity.$model" placeholder="Nombre de la entidad o institución" />
              </AppFormField>

              <!-- ✅ Año con AppAutocomplete (sin select) -->
              <AppFormField :label="'Año'" :form-control="v$.form.year">
                <AppAutocomplete input-id="year" :options="yearOptions" label="label" :reduce="(o:any) => o.value" v-model="v$.form.year.$model" :clearable="true" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Descripción'" :form-control="v$.form.description">
                  <textarea rows="5" class="form-control" v-model="v$.form.description.$model" placeholder="Describe el reconocimiento, méritos, alcance, relevancia..." />
                </AppFormField>
                <p class="charCount">{{ form.description.length }} caracteres</p>
              </div>

              <div class="colSpan2">
                <AppAttachmentDropzone
                  v-model="selectedFile"
                  :isShowDelete="false"
                  v-model:certificateUrl="form.certificateUrl"
                  isTitle="Adjuntar Soporte"
                  isHelper="PDF, JPG, PNG (máx. 5MB)"
                  isAccept=".pdf,.jpg,.jpeg,.png"
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
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';

// Servicios
import { GetRecognitionsWithPaginationService } from '../../services/getRecognitionsWithPagination.service';
import { CreateOrUpdateRecognitionsService } from '../../services/createOrUpdateRecognitions.service';
import { DeleteRecognitionsService } from '../../services/deleteRecognitions.service';

// ✅ subir archivo binario
import { CreateOrUpdateRecognitionsCertificateService } from '../../services/createOrUpdateRecognitionsCertificate.service';

interface RecognitionApiItem {
  id: number;
  recognitionName: string;
  awardingEntity: string;
  year: number;
  description?: string | null;
  certificateUrl?: string | null;
  people?: { id: number; names: string };
}

interface AwardRecognitionRow {
  id: number;
  name: string;
  grantingEntity: string;
  year: string;
  description: string;
  hasDocument: boolean;
  certificateUrl?: string | null;
}

type YearOption = { label: string; value: string };

const getRecognitionWithPaginationService = new GetRecognitionsWithPaginationService();
const createOrUpdateRecognitionService = new CreateOrUpdateRecognitionsService();
const deleteRecognitionService = new DeleteRecognitionsService();
const createOrUpdateRecognitionsCertificateService = new CreateOrUpdateRecognitionsCertificateService();

export default defineComponent({
  name: 'AwardsRecognitionsStep',
  components: {
    AppIcon,
    AppButton,
    AppDrawer,
    AppFormField,
    AppAttachmentDropzone,
    AppCardDashboard,
    AppCard,
    AppPulseLoading,
    AppAutocomplete,
    AppModal,
    AppConfirmDeleteModal,
  },
  setup() {
    const awards = ref<AwardRecognitionRow[]>([]);

    const loading = ref(true);

    const isDrawerOpen = ref(false);
    const editingId = ref<number | null>(null);
    const selectedFile = ref<File | null>(null);
    const resumeStore = useResumeStore();
    const modalDelete = ref(false);
    const currentAward = ref<AwardRecognitionRow | null>(null);

    const userPeopleId = ref<number | null>(null);

    const form = reactive({
      name: '',
      grantingEntity: '',
      year: '', // string
      description: '',
      certificateUrl: '', // ✅ para pintar cuando venga del GET
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          grantingEntity: { required },
          year: { required },
          description: {},
          certificateUrl: {},
        },
      },
      { form }
    );

    const years = computed(() => {
      const current = new Date().getFullYear();
      return Array.from({ length: 50 }, (_, i) => current - i);
    });

    // ✅ opciones para AppAutocomplete del año
    const yearOptions = computed<YearOption[]>(() => years.value.map((y) => ({ label: String(y), value: String(y) })));

    const awardsByYear = computed(() => {
      return awards.value.reduce((acc, a) => {
        acc[a.year] = (acc[a.year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    });

    const recentYears = computed(() => {
      return Object.keys(awardsByYear.value)
        .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
        .slice(0, 3);
    });

    const extractItemsFromResponse = (response: any): RecognitionApiItem[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const mapApiToRow = (x: RecognitionApiItem): AwardRecognitionRow => {
      const cert = x.certificateUrl ?? null;
      return {
        id: x.id,
        name: x.recognitionName,
        grantingEntity: x.awardingEntity,
        year: String(x.year),
        description: x.description ?? '',
        hasDocument: !!cert,
        certificateUrl: cert,
      };
    };

    const loadFromService = async () => {
      const response = await getRecognitionWithPaginationService.run({
        noPag: true,
      });
      const items = extractItemsFromResponse(response);
      awards.value = items.map(mapApiToRow);

      // ✅ Guardar para el CV
      resumeStore.setAwards(awards.value);
    };

    onMounted(async () => {
      loading.value = true;
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          userPeopleId.value = user?.people?.id ?? null;
        }
        await loadFromService();
      } finally {
        loading.value = false;
      }
    });

    const resetForm = () => {
      form.name = '';
      form.grantingEntity = '';
      form.year = '';
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
      const item = awards.value.find((a) => a.id === id);
      if (!item) return;

      editingId.value = id;
      resetForm();

      form.name = item.name;
      form.grantingEntity = item.grantingEntity;
      form.year = item.year;
      form.description = item.description || '';
      form.certificateUrl = item.certificateUrl || '';

      isDrawerOpen.value = true;
    };

    const closeDrawer = () => {
      isDrawerOpen.value = false;
      editingId.value = null;
      resetForm();
    };

    const openModalDelete = (item: AwardRecognitionRow) => {
      modalDelete.value = true;
      currentAward.value = item;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentAward.value = null;
      await loadFromService();
    };

    const deleteAward = async () => {
      try {
        await deleteRecognitionService.run(Number(currentAward.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando reconocimiento:', e);
      }
    };

    const handleViewDocument = (award: AwardRecognitionRow) => {
      if (!award.certificateUrl) return;
      window.open(award.certificateUrl, '_blank', 'noopener,noreferrer');
    };

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

        // 1) guardar/actualizar reconocimiento
        const payload: any = {
          id,
          peopleId: Number(userPeopleId.value),
          recognitionName: form.name,
          awardingEntity: form.grantingEntity,
          year: Number(form.year),
          description: form.description?.trim() || undefined,
          certificateUrl: form.certificateUrl?.trim() || undefined,
        };

        const saveResp = await createOrUpdateRecognitionService.run(payload, id);

        // ✅ fallback cuando update no devuelve body
        const recognitionId = saveResp?.data?.id ?? saveResp?.id ?? saveResp?.item?.id ?? payload.id;

        if (!recognitionId) throw new Error('No se pudo obtener el id');

        // 2) ✅ subir archivo SOLO si se seleccionó un archivo nuevo (binario)
        if (selectedFile.value) {
          await createOrUpdateRecognitionsCertificateService.run({
            id: Number(recognitionId),
            peopleId: Number(userPeopleId.value),
            archivo: selectedFile.value, // ✅ solo binario
          });
        }

        // 3) refrescar para traer certificateUrl actualizado
        await loadFromService();
        closeDrawer();
      } catch (e) {
        console.log('Error guardando reconocimiento:', e);
      } finally {
        loading.value = false;
      }
    };

    return {
      awards,

      loading,

      // stats
      awardsByYear,
      recentYears,

      // year autocomplete
      yearOptions,

      // drawer + form
      isDrawerOpen,
      editingId,
      selectedFile,
      form,
      v$,

      // actions
      openCreate,
      openEdit,
      closeDrawer,
      handleViewDocument,
      handleSubmit,

      // delete
      modalDelete,
      openModalDelete,
      closeModalDelete,
      deleteAward,
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
  border-radius: 12px;
}
.trophyBox {
  background: linear-gradient(135deg, #fefce8, #fff7ed);
  border: 1px solid #fed7aa;
}
.iconBig {
  font-size: 28px;
}
.trophyIcon {
  color: #ca8a04;
}
.iconSm {
  font-size: 16px;
}
.hTitle {
  margin: 0;
  font-weight: 800;
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
.statTitleRow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.statValue {
  font-size: 32px;
  font-weight: 900;
  color: #101828;
}
.statValue.primary {
  color: var(--color-primary, #1b2e83);
}
.statHint {
  font-size: 12px;
  color: #667085;
  font-weight: 700;
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

/* List */
.listWrap {
  display: grid;
  gap: 14px;
}
.awardCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  transition: 0.18s ease;
}
.awardCard:hover {
  box-shadow: 0 14px 28px rgba(16, 24, 40, 0.1);
  transform: translateY(-1px);
}

.cardHeader {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.badgeIcon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fefce8, #fff7ed);
  border: 1px solid #fed7aa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.awardIcon {
  color: #ca8a04;
  font-size: 18px;
}
.cardHeaderMain {
  flex: 1;
  min-width: 0;
}
.titleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.cardTitle {
  margin: 0;
  font-weight: 900;
  color: #101828;
  line-height: 1.25;
  flex: 1;
}
.docBox {
  padding: 8px;
  border-radius: 12px;
  background: #ecfdf3;
  border: 1px solid #abefc6;
  flex-shrink: 0;
}
.docIcon {
  color: #027a48;
  font-size: 16px;
}

.meta {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}
.metaRow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;
}
.metaIcon {
  font-size: 14px;
  color: #9ca3af;
}
.metaText {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 520px;
}

.desc {
  margin-top: 12px;
  color: #667085;
  font-size: 13px;
  line-height: 1.55;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #f3f4f6;
}
.btnGhost {
  padding: 10px 14px;
  background: transparent;
  border: 1px dashed #d0d5dd;
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

/* Note */
.note {
  margin-top: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  padding: 16px;
}
.noteTitle {
  margin: 0 0 10px;
  font-weight: 900;
  color: #1e3a8a;
}
.noteList {
  margin: 0;
  padding-left: 18px;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.7;
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
.btn-group {
  gap: 0.5rem;
}
/* Grid igual al de eventos/formación */
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
}

/* Card head layout */
.awardCard {
  height: 100%;
}

/* Header: icon + contenido */
.cardHead {
  display: block;
}

.chips {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  align-items: start;
}

.badgeIcon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fefce8, #fff7ed);
  border: 1px solid #fed7aa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.awardIcon {
  color: #ca8a04;
  font-size: 18px;
}

.headText {
  min-width: 0;
}

.headTitleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cardTitle {
  margin: 0;
  font-weight: 900;
  font-size: 20px;
  line-height: 1.2;
  color: #101828;
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dot ok (documento adjunto) */
.dotOk {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #027a48;
  box-shadow: 0 0 0 5px rgba(2, 122, 72, 0.12);
  flex: 0 0 auto;
  margin-top: 4px;
}

/* Meta como en eventos */
.meta {
  display: grid;
  gap: 12px;
  padding: 12px 0 0;
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
  font-size: 14px;
  color: #667085;
  font-weight: 700;
}

.metaIcon {
  font-size: 16px;
  color: #98a2b3;
}

.metaValue {
  text-align: right;
  font-size: 16px;
  font-weight: 800;
  color: #101828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Body */
.cardBody {
  padding-top: 6px;
}

.desc {
  border-top: 1px solid #eef2f7;
  padding-top: 14px;
  margin-top: 10px;
  color: #667085;
  font-size: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer franja gris con icon buttons */
.cardFooter {
  display: flex;
  justify-content: center;
  gap: 28px;
  padding: 16px 14px;
  background: #f8fafc;
  border-top: 1px solid #eef2f7;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.iconBtn {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.iconBtn :deep(button),
.iconBtn :deep(a) {
  width: 46px;
  height: 46px;
  padding: 0 !important;
  border-radius: 12px;
}

.iconBtn.danger :deep(button),
.iconBtn.danger :deep(a) {
  color: #ef4444;
}
</style>
