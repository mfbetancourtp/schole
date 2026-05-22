<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="sectionHead">
      <div class="contentIconTitle">
        <div class="sectionHead__icon">
          <AppIcon icon="book-open" class="iconBig" />
        </div>
        <div>
          <h2 class="hTitle">Experiencia Docente</h2>
          <p class="hSub">Trayectoria académica como docente</p>
        </div>
      </div>
      <AppButton type="button" class="btnPrimary addBtn" @click="openCreate">
        <AppIcon icon="plus" />
        Agregar Experiencia
      </AppButton>
      <AppPulseLoading v-if="loading" />
    </div>

    <!-- Stats -->
    <div class="statsGrid" v-if="experiences.length">
      <AppCardDashboard>
        <template #title>Años de Experiencia</template>
        <template #body>
          <div class="statValue primary">{{ totalYears }}</div>
          <div class="statHint">Aprox. según fechas</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Instituciones</template>
        <template #body>
          <div class="statValue">{{ uniqueInstitutions }}</div>
          <div class="statHint">Diferentes instituciones</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Posiciones Actuales</template>
        <template #body>
          <div class="statValue success">{{ currentPositions }}</div>
          <div class="statHint">En curso</div>
        </template>
      </AppCardDashboard>

      <AppCardDashboard>
        <template #title>Total Registros</template>
        <template #body>
          <div class="statValue">{{ experiences.length }}</div>
          <div class="statHint">Experiencias registradas</div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Distribución por nivel -->
    <div v-if="levelKeys.length" class="distWrap">
      <AppCardDashboard>
        <template #title>
          <div class="distTitleRow">
            <AppIcon icon="chart-line" />
            <span>Distribución por Nivel Educativo</span>
          </div>
        </template>

        <template #body>
          <div class="distBadges">
            <div v-for="k in levelKeys" :key="k" class="distItem">
              <AppBadge :label="k">
                <span class="distCount">{{ levelCount[k] }}</span>
              </AppBadge>
            </div>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Empty -->
    <div v-if="!experiences.length" class="emptyWrap">
      <AppCardDashboard>
        <template #title>No hay experiencia docente registrada</template>
        <template #body>
          <p class="muted">Comienza agregando tu primera experiencia como docente</p>
        </template>
        <template #footer>
          <div class="footerActions">
            <AppButton type="button" class="btnPrimary" @click="openCreate">
              <AppIcon icon="plus" />
              Agregar Experiencia Docente
            </AppButton>
          </div>
        </template>
      </AppCardDashboard>
    </div>

    <!-- Timeline -->
    <div v-else class="timelineWrap">
      <TimelineList :items="experiences" :itemKey="'id'" :getDotIcon="() => 'book-open'">
        <template #item="{ item: experience }">
          <AppCard>
            <template #body>
              <div class="cardTop">
                <div class="cardTopLeft">
                  <div class="titleRow">
                    <h3 class="pos">{{ experience.institutionName }}</h3>
                    <AppBadge :label="experience.educationType?.name || '—'" />
                  </div>

                  <p class="company">
                    <AppIcon icon="graduation-cap" class="infoIcon" />
                    <span class="companyText">{{ experience.academicProgram }}</span>
                  </p>

                  <div class="grid2">
                    <div class="infoRow">
                      <AppIcon icon="calendar" class="infoIcon" />
                      <span>
                        {{ normalizeDateInput(experience.startDate) }} -
                        {{ experience.isCurrent ? 'Actual' : normalizeDateInput(experience.endDate) }}
                      </span>
                    </div>

                    <div class="infoRow">
                      <AppIcon icon="user" class="infoIcon" />
                      <span class="truncate">{{ experience.directSupervisor || '—' }}</span>
                    </div>

                    <div class="infoRow colSpan2">
                      <AppIcon icon="phone" class="infoIcon" />
                      <span>{{ experience.contactNumber || '—' }}</span>
                    </div>
                  </div>

                  <div class="subjectsBox">
                    <p class="fnLabel">
                      <AppIcon icon="book" class="infoIcon" />
                      Asignaturas impartidas:
                    </p>

                    <div class="subjectTags">
                      <span v-for="(s, idx) in subjectsToList(experience.courseName)" :key="idx" class="tag" :title="s">
                        {{ s }}
                      </span>
                    </div>
                  </div>

                  <div v-if="experience.comments" class="functionsBox">
                    <p class="fnLabel">Observaciones:</p>
                    <p class="fnText">{{ experience.comments }}</p>
                  </div>
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

    <!-- Drawer -->
    <AppDrawer :isVisible="isDrawerOpen" size="lg" @update:isVisible="isDrawerOpen = $event">
      <template #head>
        <div class="drawerHead">
          <div>
            <h2 class="drawerHead__title">
              {{ editingId ? 'Editar Experiencia Docente' : 'Agregar Experiencia Docente' }}
            </h2>
            <p class="drawerHead__subtitle">Registra tu trayectoria como docente</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="drawerBody">
          <form @submit.prevent="handleSubmit">
            <div class="gridForm">
              <div class="colSpan2">
                <AppFormField :label="'Institución Educativa'" :form-control="v$.form.institutionName">
                  <input type="text" class="form-control" v-model="v$.form.institutionName.$model" placeholder="Nombre de la institución" />
                </AppFormField>
              </div>

              <AppFormField :label="'Programa Académico'" :form-control="v$.form.academicProgram">
                <input type="text" class="form-control" v-model="v$.form.academicProgram.$model" placeholder="Ej: Ingeniería de Sistemas" />
              </AppFormField>

              <!-- NIVEL EDUCATIVO (id) -->
              <AppFormField :label="'Nivel Educativo'" :form-control="v$.form.educationLevelId">
                <AppAutocomplete input-id="educationLevelId" :options="educationLevels" label="name" :reduce="(o:any) => o.id" v-model="v$.form.educationLevelId.$model" :clearable="true" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Asignaturas Impartidas'" :form-control="v$.form.courseName">
                  <textarea rows="3" class="form-control" v-model="v$.form.courseName.$model" placeholder="Separa las asignaturas con comas. Ej: Programación I, Algoritmos..." />
                </AppFormField>
                <p class="hint">Separa cada asignatura con una coma</p>
              </div>

              <AppFormField :label="'Fecha de Inicio'" :form-control="v$.form.startDate">
                <input type="date" class="form-control" v-model="v$.form.startDate.$model" />
              </AppFormField>

              <div>
                <AppFormField :label="'Fecha de Fin'" :form-control="v$.form.endDate">
                  <input type="date" class="form-control" :disabled="isCurrentPosition" :class="{ disabled: isCurrentPosition }" v-model="v$.form.endDate.$model" />
                </AppFormField>

                <div class="checkRow">
                  <input id="current-teaching" type="checkbox" v-model="isCurrentPosition" @change="toggleCurrent" />
                  <label for="current-teaching">Trabajo aquí actualmente</label>
                </div>
              </div>

              <AppFormField :label="'Jefe Directo'" :form-control="v$.form.directSupervisor">
                <input type="text" class="form-control" v-model="v$.form.directSupervisor.$model" placeholder="Nombre del jefe directo o coordinador" />
              </AppFormField>

              <AppFormField :label="'Número de Contacto'" :form-control="v$.form.contactNumber">
                <input type="tel" class="form-control" v-model="v$.form.contactNumber.$model" placeholder="3001234567" />
              </AppFormField>

              <div class="colSpan2">
                <AppFormField :label="'Observaciones'" :form-control="v$.form.comments">
                  <textarea rows="4" class="form-control" v-model="v$.form.comments.$model" placeholder="Descripción adicional, logros, metodologías aplicadas, etc." />
                </AppFormField>

                <p class="charCount">{{ form.comments.length }} caracteres</p>
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
      <AppConfirmDeleteModal v-if="modalDelete" entity="experiencia docente" @confirmDelete="deleteTeachingExperience" />
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
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppDrawer from '../../../../shared/components/AppDrawer.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppBadge from '../../../../shared/components/AppBadge.vue';
import AppCardDashboard from '../../../../shared/components/Card/AppCardDashboard.vue';
import TimelineList from '../../../../shared/components/TimeLine/TimelineList.vue';

import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';

import { GetTeachingExperiencesWithPaginationService } from '../../services/getTeachingExperiencesWithPagination.service';
import { GetEducationTypesService } from '../../services/getEducationTypes.service';
import { DeleteTeachingExperiencesService } from '../../services/deleteTeachingExperiences.service';
import { CreateOrUpdateTeachingExperiencesService } from '../../services/createOrUpdateTeachingExperiences.service';

type EducationType = { id: number; name: string };

interface TeachingExperienceApiItem {
  id: number;
  institutionName: string;
  academicProgram: string;
  courseName: string; // materias separadas por coma
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD | null
  directSupervisor: string;
  contactNumber: string;
  comments?: string | null;

  people?: { id: number; names: string };
  educationType?: { id: number; name: string };
  // client helper:
  isCurrent?: boolean;
}

const getTeachingExperiencesWithPaginationService = new GetTeachingExperiencesWithPaginationService();
const getEducationTypesService = new GetEducationTypesService();
const createOrUpdateTeachingExperiencesService = new CreateOrUpdateTeachingExperiencesService();
const deleteTeachingExperiencesService = new DeleteTeachingExperiencesService();

export default defineComponent({
  name: 'TeachingExperienceStep',
  components: {
    AppIcon,
    AppButton,
    AppCard,
    AppDrawer,
    AppFormField,
    AppBadge,
    AppCardDashboard,
    TimelineList,
    AppModal,
    AppConfirmDeleteModal,
    AppAutocomplete,
    AppPulseLoading,
  },
  setup() {
    const experiences = ref<TeachingExperienceApiItem[]>([]);
    const isDrawerOpen = ref(false);
    const editingId = ref<string | null>(null);
    const isCurrentPosition = ref(false);
    const loading = ref(true); // ✅ global
    const resumeStore = useResumeStore();
    const modalDelete = ref(false);
    const currentExperience = ref<TeachingExperienceApiItem | null>(null);

    const userPeopleId = ref<number | null>(null);

    // niveles vienen del backend (education types)
    const educationLevels = ref<EducationType[]>([]);

    const form = reactive({
      institutionName: '',
      academicProgram: '',
      educationLevelId: null as number | null,
      courseName: '',
      startDate: '',
      endDate: '',
      directSupervisor: '',
      contactNumber: '',
      comments: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          institutionName: { required },
          academicProgram: { required },
          educationLevelId: { required },
          courseName: { required },
          startDate: { required },
          endDate: {},
          directSupervisor: { required },
          contactNumber: { required },
          comments: {},
        },
      },
      { form }
    );

    const normalizeDateInput = (d?: string | null) => {
      if (!d) return '';
      return String(d).slice(0, 10);
    };

    const subjectsToList = (s: string) =>
      (s || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

    const extractItemsFromResponse = (response: any): TeachingExperienceApiItem[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      return [];
    };

    const loadEducationLevels = async () => {
      try {
        const response = await getEducationTypesService.run({
          noPag: true,
          educationCategoryId: 13, // ✅ ajusta si tu backend separa categorías
          lastLevelOnly: true,
        });

        educationLevels.value = response;
      } catch (e) {
        console.error('Error cargando niveles educativos:', e);
        educationLevels.value = [];
      }
    };

    const loadExperiences = async () => {
      const response = await getTeachingExperiencesWithPaginationService.run({
        noPag: true,
      });

      const items = extractItemsFromResponse(response);

      experiences.value = items.map((x) => ({
        ...x,
        endDate: x.endDate ?? null,
        isCurrent: !x.endDate,
      }));

      // ✅ Guardar en estado global para el CV
      resumeStore.setTeaching(experiences.value);
    };

    onMounted(async () => {
      loading.value = true;

      await loadEducationLevels();
      await loadExperiences();

      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        userPeopleId.value = user?.people?.id ?? null;
      }
      loading.value = false;
    });

    const resetForm = () => {
      form.institutionName = '';
      form.academicProgram = '';
      form.educationLevelId = null;
      form.courseName = '';
      form.startDate = '';
      form.endDate = '';
      form.directSupervisor = '';
      form.contactNumber = '';
      form.comments = '';
      isCurrentPosition.value = false;
      v$.value.$reset();
    };

    const openCreate = () => {
      editingId.value = null;
      resetForm();
      isDrawerOpen.value = true;
    };

    const openEdit = (id: number) => {
      const item = experiences.value.find((e) => e.id === id);
      if (!item) return;

      editingId.value = String(item.id);
      resetForm();

      form.institutionName = item.institutionName || '';
      form.academicProgram = item.academicProgram || '';
      // IMPORTANTE: tu GET devuelve educationType.id pero tu POST pide educationLevelId
      form.educationLevelId = item.educationType?.id ?? null;
      form.courseName = item.courseName || '';
      form.startDate = normalizeDateInput(item.startDate);
      form.endDate = normalizeDateInput(item.endDate || '');
      form.directSupervisor = item.directSupervisor || '';
      form.contactNumber = item.contactNumber || '';
      form.comments = (item.comments as any) || '';

      isCurrentPosition.value = !item.endDate;
      if (isCurrentPosition.value) form.endDate = '';

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

    // ===== Delete =====
    const openModalDelete = (item: TeachingExperienceApiItem) => {
      modalDelete.value = true;
      currentExperience.value = item;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      currentExperience.value = null;
      await loadExperiences();
    };

    const deleteTeachingExperience = async () => {
      try {
        await deleteTeachingExperiencesService.run(Number(currentExperience.value?.id));
        await closeModalDelete();
      } catch (e) {
        console.log('Error eliminando experiencia docente:', e);
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

      if (!userPeopleId.value) {
        alert('No se encontró peopleId del usuario en localStorage.');
        return;
      }
      loading.value = true;

      try {
        const id = editingId.value ? Number(editingId.value) : undefined;

        const payload = {
          peopleId: userPeopleId.value,
          institutionName: form.institutionName,
          academicProgram: form.academicProgram,
          educationLevelId: form.educationLevelId as number,
          courseName: form.courseName,
          startDate: form.startDate,
          endDate: isCurrentPosition.value ? undefined : form.endDate,
          directSupervisor: form.directSupervisor,
          contactNumber: form.contactNumber,
          comments: form.comments?.trim() || undefined,
        };

        await createOrUpdateTeachingExperiencesService.run(payload, id);

        await loadExperiences();
        closeDrawer();
      } catch (e) {
        console.log('Error guardando experiencia docente:', e);
      } finally {
        loading.value = false;
      }
    };

    // ===== Stats (calculados con fechas completas) =====
    const uniqueInstitutions = computed(() => {
      return new Set(experiences.value.map((e) => e.institutionName)).size;
    });

    const currentPositions = computed(() => {
      return experiences.value.filter((e) => e.isCurrent).length;
    });

    const levelCount = computed(() => {
      return experiences.value.reduce((acc, e) => {
        const k = e.educationType?.name || '—';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    });

    const levelKeys = computed(() => Object.keys(levelCount.value));

    const diffMonths = (start: string, end: string) => {
      const s = new Date(start);
      const e = new Date(end);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
      return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    };

    const totalYears = computed(() => {
      const now = new Date();
      const nowISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const totalMonths = experiences.value.reduce((acc, e) => {
        const start = e.startDate;
        const end = e.isCurrent ? nowISO : e.endDate || nowISO;
        const dm = diffMonths(start, end);
        return acc + Math.max(0, dm);
      }, 0);

      return Math.round(totalMonths / 12);
    });

    return {
      experiences,

      // drawer + form
      isDrawerOpen,
      editingId,
      isCurrentPosition,
      form,
      v$,

      // lists
      educationLevels,

      // helpers
      normalizeDateInput,
      subjectsToList,

      // stats
      totalYears,
      uniqueInstitutions,
      currentPositions,
      levelCount,
      levelKeys,

      // actions
      openCreate,
      openEdit,
      closeDrawer,
      toggleCurrent,
      handleSubmit,
      loading,

      // delete
      modalDelete,
      openModalDelete,
      closeModalDelete,
      deleteTeachingExperience,
    };
  },
});
</script>

<style scoped>
/* ===== Mantengo tu mismo look (copié el tuyo tal cual) ===== */

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
  font-size: 34px;
  font-weight: 900;
  color: #101828;
}
.statValue.primary {
  color: var(--color-primary, #1b2e83);
}
.statValue.success {
  color: #027a48;
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

/* Card content */
.titleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.pos {
  margin: 0;
  font-weight: 800;
  color: #111827;
}
.company {
  margin: 10px 0 0;
  font-weight: 700;
  color: #1e3a8a;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.companyText {
  min-width: 0;
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  color: #4b5563;
  font-size: 13px;
  margin-top: 12px;
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
.colSpan2 {
  grid-column: 1 / -1;
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

/* Subjects */
.subjectsBox {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f3f4f6;
}
.subjectTags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag {
  padding: 8px 10px;
  border-radius: 12px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Observations */
.functionsBox {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f3f4f6;
}
.fnLabel {
  margin: 0 0 6px;
  font-weight: 700;
  color: #374151;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  font-size: 18px;
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
.hint {
  margin: -8px 0 0;
  color: #6b7280;
  font-size: 12px;
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

/* Buttons */
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.addBtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  white-space: nowrap;
}
</style>
