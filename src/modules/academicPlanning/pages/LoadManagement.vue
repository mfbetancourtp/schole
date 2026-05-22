<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton style="color: white" variant="primary" outlined @click="openCreateDrawer('duplicar')">
        <AppIcon icon="copy" class="me-2" />
        Duplicar periodo anterior
      </AppButton>

      <AppButton style="color: white" variant="primary" @click="openCreateDrawer('desde-cero')">
        <AppIcon icon="plus" class="me-2" />
        Crear nueva carga
      </AppButton>
    </template>

    <template #content>
      <AppPulseLoading v-if="isInitialLoading" />
      <div class="loadManagement">
        <AppCard>
          <template #body>
            <!-- ── Selectores de período y programa ── -->
            <div class="row g-3 align-items-end loadManagement__selectorsRow">
              <div class="col-12 col-md-3 col-xl-2 loadManagement__selectorCol loadManagement__selectorCol--period">
                <AppFormField label="Periodo académico">
                  <AppAutocomplete
                    class="loadManagement__topFilter loadManagement__topFilter--period"
                    :options="periodOptions"
                    :clearable="false"
                    v-model="selectedPeriodo"
                    @search="handlePeriodSearch"
                  />
                </AppFormField>
              </div>

              <div class="col-12 col-md-4 col-xl-3 loadManagement__selectorCol loadManagement__selectorCol--program">
                <AppFormField label="Programa">
                  <AppAutocomplete class="loadManagement__topFilter loadManagement__topFilter--program" :options="programOptions" :clearable="false" label="name" v-model="selectedPrograma" />
                </AppFormField>
              </div>
            </div>

            <!-- ── Tarjetas de resumen ── -->
            <div class="loadManagement__statsGrid">
              <AppStatCard v-for="card in summaryCards" :key="card.label" class="loadManagement__statCard" :label="card.label" :value="card.value" :icon="card.icon" :variant="card.variant" />
            </div>
          </template>
        </AppCard>

        <!-- ── Generar horario ── -->
        <div v-if="selectedPeriodo" class="loadManagement__timetableCard">
          <div class="loadManagement__timetableCardLeft">
            <div class="loadManagement__timetableCardIcon">
              <AppIcon icon="calendar-alt" />
            </div>
            <div>
              <h4 class="loadManagement__timetableCardTitle">Generar horario</h4>
              <p class="loadManagement__timetableCardSubtitle">Genera automáticamente el horario para la oferta curricular del periodo seleccionado.</p>
            </div>
          </div>

          <div class="loadManagement__timetableCardRight">
            <!-- Generando -->
            <div v-if="generatingTimetable" class="loadManagement__timetableLoading">
              <div class="spinner-border spinner-border-sm text-primary flex-shrink-0" role="status"></div>
              <p class="mb-0 fw-semibold text-dark" style="font-size: 0.875rem">Generando horario...</p>
            </div>

            <!-- Acciones -->
            <div v-else class="loadManagement__timetableActions">
              <AppButton variant="primary" @click="timetableInfoModalVisible = true">
                <AppIcon icon="magic" class="me-2" />
                Generar horario
              </AppButton>

              <AppButton v-if="lastTimetable" variant="secondary" outlined @click="goToTimetable">
                <AppIcon icon="eye" class="me-2" />
                Ver horario
              </AppButton>
            </div>
          </div>
        </div>

        <!-- Modal informativo de generación de horario -->
        <AppModal v-model="timetableInfoModalVisible">
          <AppFormModal v-if="timetableInfoModalVisible" :title="'Generación de horario'">
            <template v-slot:content>
              <div class="d-flex align-items-center gap-3">
                <AppIcon icon="clock" size="3x" class="text-warning" />
                <span>
                  La última versión se generará al rededor de
                  <strong>10 minutos</strong> dependiendo del total de las asignaturas. Puedes continuar trabajando mientras el proceso finaliza.
                </span>
              </div>
            </template>
            <template v-slot:actions>
              <AppButton variant="primary" @click="confirmGenerateTimetable">
                <AppIcon icon="magic" class="me-2" />
                Entendido, generar
              </AppButton>
            </template>
          </AppFormModal>
        </AppModal>

        <!-- ── Tabla principal con AppDataList ── -->
        <div>
          <AppDataList
            ref="loadManagementListRef"
            name="load-management"
            :service="loadManagementDataListService"
            :params="loadManagementParams"
            :enable-search="true"
            :default-per-page="10"
            :show-filter-steps="true"
            filter-trigger-placement="title"
            row-key="key"
            @filter="applyPendingFilters"
            @filter-open="syncPendingFilters"
            @filter-cancel="syncPendingFilters"
          >
            <!-- Título de la tarjeta -->
            <template #title>
              <div class="loadManagement__sectionTitle">
                <div class="loadManagement__sectionTitleLabel">
                  <AppIcon icon="table" class="me-2" />
                  Gestión de asignaturas y grupos
                </div>

                <AppBadge class="loadManagement__sectionBadge" :label="`${loadManagementTableCount} registros`" variant="ghost" />
              </div>
            </template>
            <!-- Panel de filtros (dropdown) -->
            <template #filters>
              <div class="loadManagement__filtersPanel">
                <AppFilter>
                  <label for="load-management-semester">Semestre</label>
                  <AppAutocomplete input-id="load-management-semester" :options="semesterOptions" :clearable="true" label="name" :append-to-body="false" v-model="pendingSemester" />
                </AppFilter>

                <AppFilter>
                  <label for="load-management-state">Estado</label>
                  <AppAutocomplete input-id="load-management-state" :options="stateOptions" :clearable="true" :append-to-body="false" v-model="pendingState" />
                </AppFilter>

                <AppFilter>
                  <label for="load-management-campus">Campus</label>
                  <AppAutocomplete input-id="load-management-campus" :options="campusOptions" :clearable="true" :append-to-body="false" v-model="pendingCampus" />
                </AppFilter>

                <AppFilter>
                  <label for="load-management-shared">Asignaturas</label>
                  <label class="loadManagement__check loadManagement__check--compact">
                    <input id="load-management-shared" v-model="pendingOnlyShared" type="checkbox" class="form-check-input mt-0" />
                    <span class="loadManagement__checkText">Solo asignaturas transversales</span>
                  </label>
                </AppFilter>
              </div>
            </template>

            <!-- ── Columna: Expandir/Colapsar ── -->
            <AppDataListColumn :width="56">
              <template #default="{ row }">
                <div class="loadManagement__toggleCell">
                  <button v-if="row.hasChildren" type="button" class="loadManagement__collapseBtn" @click.stop="toggleGroup(row.key)">
                    <AppIcon :icon="row.isExpanded ? 'chevron-down' : 'chevron-right'" />
                  </button>
                </div>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Código ── -->
            <AppDataListColumn label="Código" :width="120">
              <template #default="{ row }">
                <span class="fw-semibold" :class="{ 'loadManagement__codeCell--child': row.isChild }">
                  {{ row.isChild ? '↳' : row.assignment.subject?.code }}
                </span>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Asignatura ── -->
            <AppDataListColumn label="Asignatura">
              <template #default="{ row }">
                <div class="loadManagement__subjectCell" :class="{ 'loadManagement__subjectCell--child': row.isChild }">
                  <div v-if="!row.isChild">
                    <div class="loadManagement__subjectHeading">
                      <span class="fw-semibold text-dark">{{ row.assignment.subject?.name }}</span>
                      <AppBadge v-if="row.hasTransversal" label="Transversal" variant="ghost" class="loadManagement__subjectBadge" />
                    </div>
                    <small v-if="row.groupCount > 1" class="text-muted"> {{ row.groupCount }} grupos asociados </small>
                  </div>

                  <button v-if="!row.isChild" type="button" class="loadManagement__miniBtn loadManagement__rowAction" @click.stop="addGroup(row.assignment)">
                    <AppIcon icon="plus" class="me-1" />
                    Grupo
                  </button>
                </div>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Grupo ── -->
            <AppDataListColumn label="Código de grupo" :width="80" position="center">
              <template #default="{ row }">
                <span class="loadManagement__groupTag">
                  {{ row.assignment.code }}
                </span>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Campus ── -->
            <AppDataListColumn label="Campus" :width="180">
              <template #default="{ row }">
                {{ row.assignment.campus?.name || 'Sin campus' }}
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Semestre ── -->
            <AppDataListColumn label="Semestre" :width="100" position="center">
              <template #default="{ row }">
                <span v-if="!row.isChild">{{ row.assignment.curriculumperiod || 'Sin asignar' }}</span>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Intensidad horaria ── -->
            <AppDataListColumn label="Intensidad" :width="100" position="center">
              <template #default="{ row }"> {{ getAssignmentHours(row.assignment) }}h </template>
            </AppDataListColumn>

            <!-- ── Columna: Cupos ── -->
            <AppDataListColumn label="Cupos" :width="130" position="center">
              <template #default="{ row }">
                <input
                  v-model="capacityDrafts[row.assignment.id]"
                  type="number"
                  min="0"
                  class="form-control loadManagement__capacityInput"
                  :disabled="capacitySavingState[row.assignment.id] === true"
                  @blur="saveCapacity(row.assignment)"
                />
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Docente ── -->
            <AppDataListColumn label="Docente" :width="295">
              <template #default="{ row }">
                <div class="loadManagement__teacherCell">
                  <AppAutocompleteRich
                    class="bg-white loadManagement__teacherField loadManagement__teacherSelect loadManagement__teacherSelect--single"
                    :modelValue="getTeacherSelectModel(row.assignment)"
                    :options="getTeacherAutocompleteOptions(row.assignment)"
                    :service="teacherAutocompleteService"
                    :params-service="teacherAutocompleteParams"
                    :remote-per-page="10"
                    min-width="220px"
                    max-width="240px"
                    dropdown-max-height="440px"
                    label="fullName"
                    placeholder="Buscar docente..."
                    :append-to-body="false"
                    :load-on-open="true"
                    @option:selected="handleAssignTeacher(row.assignment, $event)"
                    @update:modelValue="
                      (val) => {
                        if (!val) handleClearTeacher(row.assignment);
                      }
                    "
                  >
                    <template #option="{ fullName, availabilityState, availableHours, maxHours }">
                      <div class="loadManagement__teacherDropdownOption">
                        <div class="loadManagement__teacherOption">
                          <span class="loadManagement__teacherDot" :class="`loadManagement__teacherDot--${availabilityState}`"></span>
                          <div class="loadManagement__teacherInfo">
                            <strong>{{ fullName }}</strong>
                            <small>{{ availableHours }}h disponibles de {{ maxHours }}h</small>
                          </div>
                        </div>

                        <div class="loadManagement__teacherBar">
                          <span
                            class="loadManagement__teacherBarFill"
                            :class="`loadManagement__teacherBarFill--${availabilityState}`"
                            :style="{
                              width: `${getTeacherAvailabilityPercent({
                                availableHours,
                                maxHours,
                              })}%`,
                            }"
                          ></span>
                        </div>
                      </div>
                    </template>

                    <template #selected-option="{ fullName, availabilityState }">
                      <div class="loadManagement__teacherSelectedValue">
                        <span class="loadManagement__teacherDot" :class="`loadManagement__teacherDot--${availabilityState}`"></span>
                        <span class="text-truncate">{{ fullName }}</span>
                      </div>
                    </template>

                    <template #no-options="{ search, searching, isLoadingRemote }">
                      <div class="loadManagement__teacherNoOptions">
                        <span v-if="isLoadingRemote">Cargando docentes disponibles...</span>
                        <span v-else-if="searching && String(search).trim().length < 2"> Escribe al menos 2 caracteres para buscar docentes. </span>
                        <span v-else-if="searching"> No se encontraron docentes para esta búsqueda. </span>
                        <span v-else>Selecciona una opción o escribe para buscar docentes disponibles.</span>
                      </div>
                    </template>
                  </AppAutocompleteRich>

                  <button
                    v-if="getAssignedTeacherUserId(row.assignment)"
                    type="button"
                    class="loadManagement__eyeBtn"
                    title="Ver detalles"
                    @click.stop="openTeacherDetail(getAssignedTeacherUserId(row.assignment), getAssignedTeacherId(row.assignment))"
                  >
                    <AppIcon icon="eye" />
                  </button>
                </div>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Docente auxiliar ── -->
            <AppDataListColumn label="Docente auxiliar" :width="335">
              <template #default="{ row }">
                <div class="loadManagement__teacherCell">
                  <AppAutocompleteRich
                    class="bg-white loadManagement__teacherField loadManagement__teacherSelect loadManagement__teacherSelect--single"
                    :modelValue="getAuxiliaryTeacherModel(row.assignment)"
                    :options="getAuxiliaryTeacherAutocompleteOptions(row.assignment)"
                    :service="teacherAutocompleteService"
                    :params-service="auxTeacherAutocompleteParams"
                    :remote-per-page="10"
                    min-width="220px"
                    max-width="240px"
                    dropdown-max-height="440px"
                    label="fullName"
                    placeholder="Buscar docente auxiliar..."
                    :append-to-body="false"
                    :load-on-open="true"
                    @option:selected="handleAssignAuxiliaryTeacher(row.assignment, $event)"
                    @update:modelValue="
                      (val) => {
                        if (!val) handleClearAuxiliaryTeacher(row.assignment);
                      }
                    "
                  >
                    <template #option="{ fullName, availabilityState, availableHours, maxHours }">
                      <div class="loadManagement__teacherDropdownOption">
                        <div class="loadManagement__teacherOption">
                          <span class="loadManagement__teacherDot" :class="`loadManagement__teacherDot--${availabilityState}`"></span>
                          <div class="loadManagement__teacherInfo">
                            <strong>{{ fullName }}</strong>
                            <small>{{ availableHours }}h disponibles de {{ maxHours }}h</small>
                          </div>
                        </div>

                        <div class="loadManagement__teacherBar">
                          <span
                            class="loadManagement__teacherBarFill"
                            :class="`loadManagement__teacherBarFill--${availabilityState}`"
                            :style="{
                              width: `${getTeacherAvailabilityPercent({
                                availableHours,
                                maxHours,
                              })}%`,
                            }"
                          ></span>
                        </div>
                      </div>
                    </template>

                    <template #selected-option="{ fullName, availabilityState }">
                      <div class="loadManagement__teacherSelectedValue">
                        <span class="loadManagement__teacherDot" :class="`loadManagement__teacherDot--${availabilityState}`"></span>
                        <span class="text-truncate">{{ fullName }}</span>
                      </div>
                    </template>
                  </AppAutocompleteRich>

                  <button
                    v-if="getAuxiliaryTeacherModel(row.assignment)?.id"
                    type="button"
                    class="loadManagement__eyeBtn"
                    title="Ver detalles"
                    @click.stop="openTeacherDetail(getAuxiliaryTeacherModel(row.assignment)?.userId ?? row.assignment?.secondaryTeacher?.userId, getAuxiliaryTeacherModel(row.assignment)?.id)"
                  >
                    <AppIcon icon="eye" />
                  </button>
                </div>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Estado ── -->
            <AppDataListColumn label="Estado" :width="170">
              <template #default="{ row }">
                <div class="loadManagement__statusCell">
                  <AppBadge :label="getAssignmentStatusLabel(getAssignmentState(row.assignment))" :variant="getAssignmentStatusVariant(getAssignmentState(row.assignment))" />
                  <button v-if="row.isChild" type="button" class="loadManagement__deleteBtn" @click.stop="deleteGroup(row.assignment.id)">
                    <AppIcon icon="trash" />
                  </button>
                </div>
              </template>
            </AppDataListColumn>

            <!-- ── Columna: Acciones ── -->
            <AppDataListColumn label="Acciones" :width="110" position="center">
              <template #default="{ row }">
                <AppCheckPermission v-if="hasAssignedTeacher(row.assignment)" permission="academicPlanning.subjectAssignments.edit">
                  <AppButton v-tooltip="'Personalizar sincronización'" icon="sync" outlined :size="'sm'" @click.stop="openCustomizeSynchronizationModal(row.assignment)" />
                </AppCheckPermission>
              </template>
            </AppDataListColumn>
          </AppDataList>
        </div>
      </div>

      <!-- ── Drawers ── -->
      <LoadManagementCreateDrawer
        :isVisible="isCreateDrawerVisible"
        :initial-type="drawerInitialType"
        :academic-period-id="selectedPeriodo"
        :program-id="selectedPrograma"
        :period-options="periodOptions"
        :program-name="currentProgramName"
        @update:isVisible="isCreateDrawerVisible = $event"
        @create="handleCreateLoad"
      />

      <TeacherLoadDetailDrawer :isVisible="isTeacherDrawerVisible" :user-id="selectedTeacherUserId" :academic-period-id="selectedPeriodo" @update:isVisible="isTeacherDrawerVisible = $event" />

      <AppModal v-model="isDeleteSectionModalOpen">
        <AppConfirmDeleteModal v-if="isDeleteSectionModalOpen" entity="sección" @confirmDelete="confirmDeleteSection" @close="isDeleteSectionModalOpen = false" />
      </AppModal>

      <AppModal v-model="customizeSynchronizationModal" :size="'lg'">
        <CustomizeSynchronization
          v-if="customizeSynchronizationModal && subjectAssignmentId"
          :data="customizeSynchronizationData"
          :subject-assignment-id="subjectAssignmentId"
          @close="CloseCustomizeSynchronizationModal"
        />
      </AppModal>

      <AppModal v-model="synchronizationReportModal" :size="'xl'">
        <SynchronizationReport v-if="synchronizationReportModal" :data="currentData.value" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppAutocompleteRich from '../../../shared/components/Forms/AppAutocompleteRich.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDataList from '../../../shared/components/DataList/AppDataList.vue';
import AppDataListColumn from '../../../shared/components/DataList/AppDataListColumn.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppPulseLoading from '../../../shared/components/AppPulseLoading.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

import CustomizeSynchronization from '../components/CustomizeSynchronization.vue';
import LoadManagementCreateDrawer from '../components/LoadManagementCreateDrawer.vue';
import SynchronizationReport from '../components/SynchronizationReport.vue';
import TeacherLoadDetailDrawer from '../components/TeacherLoadDetailDrawer.vue';

import type {
  AcademicLoadCampus,
  AcademicLoadPeriod,
  AcademicLoadProgram,
  LoadAssignmentApiState,
  LoadAssignmentState,
  LoadCreationType,
  LoadManagementStatsData,
  SelectOption,
  TeacherBankTeacher,
} from '../dtos/academicLoadManagement.dto';
import {
  academicLoadPeriodOptions,
  academicLoadStateOptions,
  computeTeacherAvailability,
  getLoadAssignmentLabel,
  getLoadAssignmentVariant,
  loadAssignmentsMock,
  teacherBankTeachersMock,
} from '../mocks/academicLoadManagement';
import { GetPlanningAcademicPeriodsService } from '../services/getPlanningAcademicPeriods.service';
import { GenerateTimetableService } from '../services/generateTimetable.service';
import { GetAllTimetablesService } from '../services/getAllTimetables.service';
import { GetCurriculumOfferingsService } from '../services/getCurriculumOfferings.service';
import { InstitutionsService } from '../../../shared/services/institutions.service';
import { AssignOfferingTeacherService } from '../services/assignOfferingTeacher.service';
import { CreateOfferingSectionService } from '../services/createOfferingSection.service';
import { GetLoadManagementStatsService } from '../services/getLoadManagementStats.service';
import { GetOfferingSectionsService } from '../services/getOfferingSections.service';
import { GetTeacherContractsService } from '../services/getTeacherContracts.service';
import { GetCurriculumPeriodsByOfferingsService } from '../services/getCurriculumPeriodsByOfferings.service';
import { DeleteOfferingTeacherService } from '../services/deleteOfferingTeacher.service';
import { DeleteOfferingSectionService } from '../services/deleteOfferingSection.service';
import { UpdateOfferingSectionService } from '../services/updateOfferingSection.service';
import { GetProgramsService } from '../../academicPrograms/services/getPrograms.service';
import { GetOrganizationsCampusesService } from '../../institutionalConfiguration/services/getOrganizationsCampuses.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodsService = new GetPlanningAcademicPeriodsService();
const generateTimetableService = new GenerateTimetableService();
const getAllTimetablesService = new GetAllTimetablesService();
const getCurriculumOfferingsService = new GetCurriculumOfferingsService();
const institutionsService = new InstitutionsService();
const assignOfferingTeacherService = new AssignOfferingTeacherService();
const createOfferingSectionService = new CreateOfferingSectionService();
const getProgramsService = new GetProgramsService();
const getLoadManagementStatsService = new GetLoadManagementStatsService();
const getOfferingSectionsService = new GetOfferingSectionsService();
const getTeacherContractsService = new GetTeacherContractsService();
const getCurriculumPeriodsByOfferingsService = new GetCurriculumPeriodsByOfferingsService();
const deleteOfferingTeacherService = new DeleteOfferingTeacherService();
const deleteOfferingSectionService = new DeleteOfferingSectionService();
const updateOfferingSectionService = new UpdateOfferingSectionService();
const getOrganizationsCampusesService = new GetOrganizationsCampusesService();

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizeAcademicPeriodCode = (value: string) => value.replace(/-0+(\d+)$/, '-$1');

const isSameProgramContext = (left?: string, right?: string) => {
  if (!left || !right) return false;

  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  return normalizedLeft === normalizedRight || normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
};

const mapApiLoadStateToLocalState = (state: LoadAssignmentApiState): LoadAssignmentState => {
  if (state === 'assigned') return 'asignado';
  if (state === 'pending') return 'pendiente';

  return 'error';
};

const mapApiTeacherAvailabilityToLocalState = (state?: string | null) => {
  if (state === 'available') return 'disponible';
  if (state === 'near_limit') return 'cercano';
  if (state === 'no_availability') return 'completo';

  return 'disponible';
};

const mapLocalLoadStateToApiState = (state: LoadAssignmentState | null): LoadAssignmentApiState | undefined => {
  if (state === 'asignado') return 'assigned';
  if (state === 'pendiente') return 'pending';
  if (state === 'error') return 'error';

  return undefined;
};

const mapSectionStatusToLocalState = (value?: string | null): LoadAssignmentState => {
  const normalizedValue = normalizeText(value ?? '');

  if (normalizedValue.includes('asign')) return 'asignado';
  if (normalizedValue.includes('pend')) return 'pendiente';

  return 'error';
};

const romanSemesterMap: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
};

const parseSemesterValue = (value?: string | null): number => {
  const normalizedValue = normalizeText(value ?? '');
  const semesterToken = normalizedValue.replace('semestre', '').trim();

  if (!semesterToken) return 0;

  const numericValue = Number(semesterToken);
  if (!Number.isNaN(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return romanSemesterMap[semesterToken] ?? 0;
};

const createFallbackAcademicPeriods = (): AcademicLoadPeriod[] =>
  academicLoadPeriodOptions.map((period, index) => ({
    id: -(index + 1),
    institutionId: 0,
    code: normalizeAcademicPeriodCode(String(period.id)),
    name: period.name,
    programTypeId: 0,
    startDate: '',
    endDate: '',
    active: index === 0 ? 1 : 0,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  }));

const createEmptyTeacherSummary = () => ({
  id: null,
  fullName: '',
  contractType: null,
  hours: null,
  status: 'Pendiente',
});

const createTeacherSummaryFromOption = (teacherOption: any) => ({
  id: teacherOption?.id ?? null,
  userId: teacherOption?.userId ?? null,
  fullName: teacherOption?.fullName || '',
  contractType: teacherOption?.contractType || null,
  hours: {
    assigned: teacherOption?.assignedHours ?? 0,
    max: teacherOption?.maxHours ?? 0,
  },
  status: 'Asignado',
});

const mapTeacherSummaryToOption = (teacherSummary: any) => {
  if (!teacherSummary?.id && !teacherSummary?.fullName) {
    return null;
  }

  const assignedHours = Number(teacherSummary?.hours?.assigned ?? 0);
  const maxHours = Number(teacherSummary?.hours?.max ?? 0);

  return {
    id: teacherSummary?.id ?? null,
    // En la respuesta de la API, primaryTeacher.id y secondaryTeacher.id son el userId del docente
    userId: teacherSummary?.userId ?? teacherSummary?.id ?? null,
    fullName: teacherSummary?.fullName || '',
    contractType: teacherSummary?.contractType || null,
    assignedHours,
    availableHours: Math.max(maxHours - assignedHours, 0),
    maxHours,
    availabilityState: computeTeacherAvailability(assignedHours, maxHours),
    programName: '',
  };
};

const mapTeacherContractToOption = (teacher: any) => ({
  id: teacher.teacherId ?? teacher.id,
  userId: teacher.userId ?? null,
  contractRecordId: teacher.id,
  fullName: teacher.fullName,
  contractType: teacher.contractType?.name || '',
  maxHours: Number(teacher.maxHours ?? 0),
  assignedHours: Number(teacher.assignedHours ?? 0),
  availableHours: Number(teacher.availableHours ?? 0),
  availabilityState: mapApiTeacherAvailabilityToLocalState(teacher.status),
  programName: '',
});

const mergeTeacherContractsCatalog = (currentItems: any[] = [], incomingItems: any[] = []) => {
  const mergedItems = new Map<string, any>();

  [...currentItems, ...incomingItems].forEach((item) => {
    const itemKey = String(item?.id ?? item?.teacherId ?? '');
    if (!itemKey) return;
    mergedItems.set(itemKey, item);
  });

  return Array.from(mergedItems.values());
};

const normalizeTeacherContractsResponse = (response: any, perPage = 10) => {
  if (Array.isArray(response?.data) && response?.pagination) {
    return {
      data: response.data,
      total: Number(response.pagination.total ?? 0),
      page: Number(response.pagination.page ?? 1),
      pagination: response.pagination,
    };
  }

  if (Array.isArray(response?.data?.data) && response?.data?.pagination) {
    return {
      data: response.data.data,
      total: Number(response.data.pagination.total ?? 0),
      page: Number(response.data.pagination.page ?? 1),
      pagination: response.data.pagination,
    };
  }

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page: 1,
      pagination: {
        page: 1,
        perPage: response.length || perPage,
        total: response.length,
        pageCount: response.length ? 1 : 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  return {
    data: [],
    total: 0,
    page: 1,
    pagination: {
      page: 1,
      perPage,
      total: 0,
      pageCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
};

const normalizeCollectionResponse = (response: any): any[] => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const mapMockAssignmentsToServiceShape = (items: any[] = []) =>
  items.map((item) => {
    const teacher = teacherBankTeachersMock.find((teacherItem) => teacherItem.id === item.docenteId);

    return {
      id: item.id,
      code: item.grupo,
      academicPeriodId: 0,
      campus: null,
      primaryTeacher: item.docenteId
        ? {
            id: item.docenteId,
            fullName: teacher?.nombre || '',
            contractType: item.tipoContrato === '-' ? null : item.tipoContrato,
            hours: {
              assigned: 0,
              max: teacher?.horasMaximas ?? 0,
            },
            status: getLoadAssignmentLabel(item.estado),
          }
        : createEmptyTeacherSummary(),
      secondaryTeacher: createEmptyTeacherSummary(),
      auxiliaryTeachers: [],
      isShared: Boolean(item.esTransversal),
      curriculumperiod: item.semestre ? `Semestre ${item.semestre}` : '',
      status: getLoadAssignmentLabel(item.estado),
      subject: {
        id: 0,
        institutionId: 0,
        areaId: null,
        name: item.nombre,
        code: item.codigo,
        description: item.nombre,
        shortName: item.nombre,
        credits: null,
        theoricalHours: null,
        practicalHours: null,
        maximumHours: item.intensidadHoraria,
      },
      academicPeriodCode: item.periodo,
      programName: item.programa,
    };
  });

export default defineComponent({
  name: 'LoadManagementPage',
  components: {
    AppAutocomplete,
    AppAutocompleteRich,
    AppBadge,
    AppBaseList,
    AppButton,
    AppCard,
    AppCheckPermission,
    AppConfirmDeleteModal,
    AppFormModal,
    AppPulseLoading,
    AppDataList,
    AppDataListColumn,
    AppFilter,
    AppModal,
    AppFormField,
    AppIcon,
    AppStatCard,
    CustomizeSynchronization,
    LoadManagementCreateDrawer,
    SynchronizationReport,
    TeacherLoadDetailDrawer,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const title = 'Gestión de carga académica';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const headerStorage = useHeaderStore();
    const isInitialLoading = ref(false);
    const academicPeriodsCatalog = ref<AcademicLoadPeriod[]>([]);
    const programOptions = ref<AcademicLoadProgram[]>([]);
    const campusesCatalog = ref<AcademicLoadCampus[]>([]);
    const teacherContractsCatalog = ref<any[]>([]);
    const loadManagementStats = ref<LoadManagementStatsData | null>(null);
    const loadManagementListRef = ref<any>(null);
    const offeringSectionsTotal = ref(0);
    const capacityDrafts = ref<Record<number, string>>({});
    const capacitySavingState = ref<Record<number, boolean>>({});
    const teacherAssignBusy = ref<Set<number>>(new Set());

    const mapAcademicPeriodToOption = (academicPeriod: AcademicLoadPeriod): SelectOption<number> => ({
      id: academicPeriod.id,
      name: academicPeriod.code || academicPeriod.name,
    });

    const mapCampusToOption = (campus: AcademicLoadCampus): SelectOption<number> => ({
      id: campus.id,
      name: campus.name,
    });

    // ── Opciones de selectores ──────────────────────────────────────────────────

    const periodOptions = ref<SelectOption<number>[]>([]);
    const campusOptions = computed<SelectOption<number>[]>(() => campusesCatalog.value.map(mapCampusToOption));
    const semesterOptions = ref<any[]>([]);
    const stateOptions = computed<SelectOption<LoadAssignmentState>[]>(() => {
      if (!loadManagementStats.value?.status?.length) {
        return academicLoadStateOptions;
      }

      return loadManagementStats.value.status.map((statusOption) => ({
        id: mapApiLoadStateToLocalState(statusOption.key),
        name: statusOption.label,
      }));
    });

    // ── Estado de filtros ───────────────────────────────────────────────────────

    const selectedPeriodo = ref<number | null>(null);
    const selectedPrograma = ref<number | null>(null);
    const selectedCampus = ref<number | null>(null);
    const selectedSemester = ref<number | null>(null);
    const selectedState = ref<LoadAssignmentState | null>(null);
    const onlyShared = ref(false);
    const pendingCampus = ref<number | null>(null);
    const pendingSemester = ref<number | null>(null);
    const pendingState = ref<LoadAssignmentState | null>(null);
    const pendingOnlyShared = ref(false);
    const collapsedGroupKeys = ref<string[]>([]);

    // ── Estado de drawers ───────────────────────────────────────────────────────

    const drawerInitialType = ref<LoadCreationType>('duplicar');
    const isCreateDrawerVisible = ref(false);
    const isTeacherDrawerVisible = ref(false);
    const selectedTeacherUserId = ref<number | null>(null);
    const isDeleteSectionModalOpen = ref(false);
    const sectionToDeleteId = ref<number | null>(null);
    const customizeSynchronizationModal = ref(false);
    const synchronizationReportModal = ref(false);
    const subjectAssignmentId = ref<number | null>(null);
    const selectedSynchronizationAssignment = ref<any>(null);
    const currentData: { value: any } = reactive({
      value: null,
    });

    // ── Datos de asignaciones ───────────────────────────────────────────────────

    const assignments = ref<any[]>(mapMockAssignmentsToServiceShape(loadAssignmentsMock));

    const baseTeacherCatalog = computed(() => {
      if (teacherContractsCatalog.value.length) {
        return teacherContractsCatalog.value.map(mapTeacherContractToOption);
      }

      return teacherBankTeachersMock.map((teacher) => ({
        id: teacher.id,
        contractRecordId: teacher.id,
        fullName: teacher.nombre,
        contractType: teacher.tipoContrato,
        maxHours: teacher.horasMaximas,
        assignedHours: teacher.horasAsignadas,
        availableHours: Math.max(teacher.horasMaximas - teacher.horasAsignadas, 0),
        availabilityState: teacher.estado,
        programName: teacher.programa,
      }));
    });

    const getAcademicPeriodById = (academicPeriodId: number | null) => academicPeriodsCatalog.value.find((academicPeriod) => academicPeriod.id === academicPeriodId) || null;

    const getAssignedTeacher = (assignment: any) => {
      if (assignment?.primaryTeacher?.id || assignment?.primaryTeacher?.fullName) {
        return assignment.primaryTeacher;
      }

      return null;
    };

    const hasAssignedTeacher = (assignment: any) => {
      const primaryTeacher = getAssignedTeacher(assignment);
      const secondaryTeacher = assignment?.secondaryTeacher;
      const auxiliaryTeacher = getAuxiliaryTeacherModel(assignment);

      return Boolean(
        primaryTeacher?.id ||
          primaryTeacher?.userId ||
          primaryTeacher?.fullName ||
          secondaryTeacher?.id ||
          secondaryTeacher?.userId ||
          secondaryTeacher?.fullName ||
          auxiliaryTeacher?.id ||
          auxiliaryTeacher?.userId ||
          auxiliaryTeacher?.fullName
      );
    };

    const getAssignedTeacherId = (assignment: any) => getAssignedTeacher(assignment)?.id ?? null;

    const getAssignmentHours = (assignment: any) => Number((assignment?.subject?.theoricalHours ?? 0) + (assignment?.subject?.practicalHours ?? 0));
    const getAssignmentCapacity = (assignment: any) => {
      const rawCapacity = assignment?.capacity;
      if (rawCapacity === null || rawCapacity === undefined || rawCapacity === '') {
        return null;
      }

      const parsedCapacity = Number(rawCapacity);
      return Number.isFinite(parsedCapacity) ? parsedCapacity : null;
    };

    const getAssignmentSemester = (assignment: any) => parseSemesterValue(assignment?.curriculumperiod);

    const getAssignmentState = (assignment: any): LoadAssignmentState => mapSectionStatusToLocalState(assignment?.status);

    const getAuxiliaryTeacherModel = (assignment: any) => {
      if (Array.isArray(assignment?.auxiliaryTeachers) && assignment.auxiliaryTeachers.length) {
        return assignment.auxiliaryTeachers[0];
      }

      return null;
    };

    const mapOfferingSectionsToAssignments = (items: any[] = []): any[] =>
      items.flatMap((item) =>
        (item?.sections || []).map((section: any) => {
          const secondaryTeacherOption = mapTeacherSummaryToOption(section?.secondaryTeacher);

          return {
            ...section,
            primaryTeacher: section?.primaryTeacher || createEmptyTeacherSummary(),
            secondaryTeacher: section?.secondaryTeacher || createEmptyTeacherSummary(),
            auxiliaryTeachers: secondaryTeacherOption ? [secondaryTeacherOption] : [],
            subject: item?.subject || {},
            academicPeriodCode: currentAcademicPeriodCode.value,
            programName: currentProgramName.value,
          };
        })
      );

    const normalizeOfferingSectionsResponse = (response: any) => ({
      items: Array.isArray(response?.data) ? response.data : [],
      total: Number(response?.pagination?.total ?? 0),
    });

    const syncCapacityDrafts = (items: any[] = []) => {
      const nextDrafts: Record<number, string> = {};

      items.forEach((item) => {
        const itemId = Number(item?.id ?? 0);
        if (!itemId) return;

        const assignmentCapacity = getAssignmentCapacity(item);
        nextDrafts[itemId] = assignmentCapacity === null ? '' : String(assignmentCapacity);
      });

      capacityDrafts.value = nextDrafts;
    };

    const normalizeCapacityDraft = (value: unknown) => {
      if (value === '' || value === null || value === undefined) {
        return null;
      }

      const parsedValue = Number(value);

      if (!Number.isFinite(parsedValue)) {
        return null;
      }

      return Math.max(0, parsedValue);
    };

    const syncSelectedAcademicPeriod = (preferredAcademicPeriodId?: number | null) => {
      if (!academicPeriodsCatalog.value.length) {
        selectedPeriodo.value = null;
        return;
      }

      const preferredAcademicPeriod = preferredAcademicPeriodId ? getAcademicPeriodById(preferredAcademicPeriodId) : null;

      if (preferredAcademicPeriod) {
        selectedPeriodo.value = preferredAcademicPeriod.id;
        return;
      }

      const currentAcademicPeriod = getAcademicPeriodById(selectedPeriodo.value);

      if (currentAcademicPeriod) {
        selectedPeriodo.value = currentAcademicPeriod.id;
        return;
      }

      selectedPeriodo.value = academicPeriodsCatalog.value[0].id;
    };

    const fetchPeriodOptions = async (search?: string): Promise<AcademicLoadPeriod[]> => {
      return getAcademicPeriodsService.run({
        active: 1,
        sort: 'id',
        order: 'DESC',
        page: 1,
        perPage: 10,
        search: search || undefined,
      });
    };

    const handlePeriodSearch = async (query: string, loading: (state: boolean) => void) => {
      loading(true);
      try {
        const academicPeriods = await fetchPeriodOptions(query);
        const newOptions = academicPeriods.map(mapAcademicPeriodToOption);

        // Always keep the currently selected period in the list so it never gets deselected
        if (selectedPeriodo.value !== null && !newOptions.some((o) => o.id === selectedPeriodo.value)) {
          const currentOption = periodOptions.value.find((o) => o.id === selectedPeriodo.value);
          if (currentOption) newOptions.unshift(currentOption);
        }

        periodOptions.value = newOptions;
      } catch (error) {
        console.log(error);
      } finally {
        loading(false);
      }
    };

    const loadAcademicPeriods = async () => {
      try {
        const academicPeriods = await fetchPeriodOptions();

        academicPeriodsCatalog.value = academicPeriods;
        periodOptions.value = academicPeriods.map(mapAcademicPeriodToOption);
        syncSelectedAcademicPeriod(academicPeriods[0]?.id ?? null);
      } catch (error) {
        console.log(error);
        academicPeriodsCatalog.value = createFallbackAcademicPeriods();
        periodOptions.value = academicPeriodsCatalog.value.map(mapAcademicPeriodToOption);
        syncSelectedAcademicPeriod(academicPeriodsCatalog.value[0]?.id ?? null);
        loadManagementStats.value = null;
      }
    };

    const loadPrograms = async (academicPeriodId?: number | null) => {
      try {
        programOptions.value = await getProgramsService.run({
          noPag: true,
          ...(academicPeriodId ? { academicPeriodId } : {}),
        });
        selectedPrograma.value = programOptions.value[0]?.id ?? null;
      } catch (error) {
        console.log(error);
        programOptions.value = [];
        selectedPrograma.value = null;
      }
    };

    const loadCampuses = async () => {
      try {
        const response = await getOrganizationsCampusesService.run();
        const campuses = Array.isArray(response?.data) ? response.data : [];

        campusesCatalog.value = campuses.slice().sort((currentCampus: AcademicLoadCampus, nextCampus: AcademicLoadCampus) => currentCampus.name.localeCompare(nextCampus.name));
      } catch (error) {
        console.log(error);
        campusesCatalog.value = [];
      }
    };

    const loadSemesters = async () => {
      if (!selectedPeriodo.value || !selectedPrograma.value) {
        semesterOptions.value = [];
        selectedSemester.value = null;
        pendingSemester.value = null;
        return;
      }

      try {
        const params: any = {
          academicPeriodId: selectedPeriodo.value,
          programId: selectedPrograma.value,
        };

        if (pendingCampus.value) {
          params.campusId = pendingCampus.value;
        }

        semesterOptions.value = await getCurriculumPeriodsByOfferingsService.run(params);

        if (selectedSemester.value && !semesterOptions.value.some((semester) => semester.id === selectedSemester.value)) {
          selectedSemester.value = null;
        }

        if (pendingSemester.value && !semesterOptions.value.some((semester) => semester.id === pendingSemester.value)) {
          pendingSemester.value = null;
        }
      } catch (error) {
        console.log(error);
        semesterOptions.value = [];
        selectedSemester.value = null;
        pendingSemester.value = null;
      }
    };

    const loadLoadManagementStats = async (academicPeriodId: number | null) => {
      if (!academicPeriodId || academicPeriodId < 0) {
        loadManagementStats.value = null;
        return;
      }

      try {
        loadManagementStats.value = await getLoadManagementStatsService.run({
          academicPeriodId: academicPeriodId,
          programId: selectedPrograma.value,
        });
      } catch (error) {
        console.log(error);
        loadManagementStats.value = null;
      }
    };

    const teacherAutocompleteParams = computed(() => ({
      academicPeriodId: selectedPeriodo.value ?? undefined,
      sort: 'id',
      order: 'ASC',
      teacherType: 'teacher',
    }));

    const auxTeacherAutocompleteParams = computed(() => ({
      academicPeriodId: selectedPeriodo.value ?? undefined,
      sort: 'id',
      order: 'ASC',
      teacherType: 'auxTeacher',
    }));

    const teacherAutocompleteService = {
      async run(params: any) {
        if (!selectedPeriodo.value) {
          return {
            data: [],
            total: 0,
            page: 1,
            pagination: {
              page: 1,
              perPage: Number(params?.perPage ?? 10),
              total: 0,
              pageCount: 0,
              hasPreviousPage: false,
              hasNextPage: false,
            },
          };
        }

        const response = await getTeacherContractsService.run({
          academicPeriodId: selectedPeriodo.value,
          sort: 'id',
          order: 'ASC',
          page: Number(params?.page ?? 1),
          perPage: Number(params?.perPage ?? 10),
          search: params?.search,
          teacherType: params?.teacherType,
        });
        const normalizedResponse = normalizeTeacherContractsResponse(response, Number(params?.perPage ?? 10));

        teacherContractsCatalog.value = mergeTeacherContractsCatalog(teacherContractsCatalog.value, normalizedResponse.data);

        return {
          ...normalizedResponse,
          data: normalizedResponse.data.map(mapTeacherContractToOption),
        };
      },
    };

    const loadTeachersForSelectors = async (academicPeriodId: number | null) => {
      if (!academicPeriodId || academicPeriodId < 0) {
        teacherContractsCatalog.value = [];
        return;
      }

      try {
        const response = normalizeTeacherContractsResponse(
          await getTeacherContractsService.run({
            sort: 'id',
            order: 'ASC',
            academicPeriodId,
            page: 1,
            perPage: 10,
          }),
          10
        );

        teacherContractsCatalog.value = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.log(error);
        teacherContractsCatalog.value = [];
      }
    };

    const persistTeacherAssignment = async (teacherUserId: number, offeringSectionId: number, isPrimary: boolean): Promise<number | null> => {
      if (!teacherUserId || !offeringSectionId) {
        return null;
      }

      const response = await assignOfferingTeacherService.run({
        teacherUserId,
        offeringSectionId,
        isPrimary,
      });

      if (selectedPeriodo.value) {
        void loadTeachersForSelectors(selectedPeriodo.value);
        void loadLoadManagementStats(selectedPeriodo.value);
      }

      return response?.id ?? response?.offeringSubjectTeacherId ?? null;
    };

    const removeOfferingTeacher = async (offeringSubjectTeacherId: number | null | undefined) => {
      if (!offeringSubjectTeacherId) return;
      await deleteOfferingTeacherService.run(offeringSubjectTeacherId);

      if (selectedPeriodo.value) {
        void loadTeachersForSelectors(selectedPeriodo.value);
        void loadLoadManagementStats(selectedPeriodo.value);
      }
    };

    onMounted(async () => {
      headerStorage.module = { name: 'Planeación académica', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      isInitialLoading.value = true;
      try {
        await Promise.all([loadAcademicPeriods(), loadCampuses()]);
        await loadPrograms(selectedPeriodo.value);
        void loadLoadManagementStats(selectedPeriodo.value);
        await loadCurrentTimetable();
      } finally {
        isInitialLoading.value = false;
      }
    });

    watch(academicPeriodsCatalog, () => {
      syncSelectedAcademicPeriod();
    });

    watch(programOptions, (options) => {
      if (!options.length) {
        selectedPrograma.value = null;
        return;
      }

      if (!options.some((program) => program.id === selectedPrograma.value)) {
        selectedPrograma.value = options[0].id;
      }
    });

    watch(stateOptions, (options) => {
      if (selectedState.value && !options.some((option) => option.id === selectedState.value)) {
        selectedState.value = null;
      }

      if (pendingState.value && !options.some((option) => option.id === pendingState.value)) {
        pendingState.value = selectedState.value;
      }
    });

    watch([selectedPeriodo, selectedPrograma], () => {
      selectedSemester.value = null;
      pendingSemester.value = null;
      void loadSemesters();
    });

    watch(pendingCampus, () => {
      void loadSemesters();
    });

    watch(
      assignments,
      (items) => {
        syncCapacityDrafts(items);
      },
      { immediate: true }
    );

    watch(selectedPeriodo, async (newAcademicPeriodId) => {
      if (newAcademicPeriodId === null) {
        syncSelectedAcademicPeriod();
        loadManagementStats.value = null;
        teacherContractsCatalog.value = [];
        assignments.value = [];
        offeringSectionsTotal.value = 0;
        void syncLoadManagementDataList();
        return;
      }

      void loadTeachersForSelectors(newAcademicPeriodId);
      await loadPrograms(newAcademicPeriodId);
      void loadLoadManagementStats(newAcademicPeriodId);
    });

    watch(selectedPrograma, (newProgramId) => {
      if (newProgramId === null) {
        void syncLoadManagementDataList();
        return;
      }
      void loadLoadManagementStats(selectedPeriodo.value);
    });

    // ── Computeds de datos ──────────────────────────────────────────────────────

    const currentAcademicPeriodCode = computed(() => normalizeAcademicPeriodCode(getAcademicPeriodById(selectedPeriodo.value)?.code || ''));
    const currentProgramName = computed(() => programOptions.value.find((program) => program.id === selectedPrograma.value)?.name || '');
    const loadManagementParams = computed(() => ({
      academicPeriodId: selectedPeriodo.value ?? undefined,
      programId: selectedPrograma.value ?? undefined,
      campusId: selectedCampus.value ?? undefined,
      curriculumPeriodId: selectedSemester.value ?? undefined,
      onlyShared: onlyShared.value === true ? 1 : undefined,
      status: mapLocalLoadStateToApiState(selectedState.value),
    }));
    const effectiveLoadManagementTotal = computed(() => {
      return offeringSectionsTotal.value || groupedAssignments.value.length;
    });
    const loadManagementTableCount = computed(() => effectiveLoadManagementTotal.value || groupedAssignments.value.length);

    const syncLoadManagementDataList = async () => {
      await nextTick();

      if (!loadManagementListRef.value) return;

      loadManagementListRef.value.setData(flattenedRows.value, effectiveLoadManagementTotal.value);
    };

    const loadManagementDataListService = {
      async run(params: any) {
        if (!params.academicPeriodId) {
          assignments.value = [];
          offeringSectionsTotal.value = 0;

          return {
            data: [],
            total: 0,
          };
        }

        const queryParams = {
          academicPeriodId: params.academicPeriodId,
          programId: params.programId,
          campusId: params.campusId,
          curriculumPeriodId: params.curriculumPeriodId,
          onlyShared: params.onlyShared,
          status: params.status,
          page: Number(params.page ?? 1),
          perPage: Number(params.perPage ?? 10),
          sort: params.sort || 'id',
          order: 'DESC',
          search: params.search,
        };

        try {
          const response = await getOfferingSectionsService.run(queryParams);
          const normalizedResponse = normalizeOfferingSectionsResponse(response);

          assignments.value = mapOfferingSectionsToAssignments(normalizedResponse.items);
          offeringSectionsTotal.value = normalizedResponse.total;

          return {
            data: flattenedRows.value,
            total: effectiveLoadManagementTotal.value,
          };
        } catch (error) {
          console.log(error);
          assignments.value = [];
          offeringSectionsTotal.value = 0;

          return {
            data: [],
            total: 0,
          };
        }
      },
    };

    const scopedAssignments = computed(() =>
      assignments.value.filter((item) => {
        const matchesAcademicPeriod = !currentAcademicPeriodCode.value || item.academicPeriodCode === currentAcademicPeriodCode.value;
        const matchesProgram = !currentProgramName.value || isSameProgramContext(item.programName, currentProgramName.value);

        return matchesAcademicPeriod && matchesProgram;
      })
    );

    const filteredAssignments = computed(() =>
      scopedAssignments.value.filter((item) => {
        if (selectedState.value && getAssignmentState(item) !== selectedState.value) return false;
        if (onlyShared.value && !item.isShared) return false;
        return true;
      })
    );

    const teacherOptions = computed<any[]>(() =>
      baseTeacherCatalog.value.map((teacher) => {
        const teacherAssignments = scopedAssignments.value.filter((item) => getAssignedTeacherId(item) === teacher.id);
        const localAssignedHours = teacherAssignments.reduce((total, item) => total + getAssignmentHours(item), 0);
        const assignedHours = teacherContractsCatalog.value.length ? teacher.assignedHours : localAssignedHours;
        const availableHours = teacherContractsCatalog.value.length ? teacher.availableHours : Math.max(teacher.maxHours - assignedHours, 0);
        const availabilityState = teacherContractsCatalog.value.length ? teacher.availabilityState : computeTeacherAvailability(assignedHours, teacher.maxHours);

        return {
          id: teacher.id,
          userId: teacher.userId,
          contractRecordId: teacher.contractRecordId,
          fullName: teacher.fullName,
          contractType: teacher.contractType,
          assignedHours,
          availableHours,
          maxHours: teacher.maxHours,
          availabilityState,
          programName: teacher.programName,
        };
      })
    );

    const getTeacherById = (teacherId: number | null, teacherFullName?: string | null) => {
      if (teacherId) {
        const teacherById = teacherOptions.value.find((item) => item.id === teacherId || item.contractRecordId === teacherId);
        if (teacherById) return teacherById;
      }

      if (teacherFullName) {
        return teacherOptions.value.find((item) => normalizeText(item.fullName) === normalizeText(teacherFullName)) || null;
      }

      return null;
    };

    const getAssignedTeacherUserId = (assignment: any) => getTeacherSelectModel(assignment)?.userId ?? getAssignedTeacher(assignment)?.userId ?? null;

    const getTeacherSelectModel = (assignment: any) => {
      const assignedTeacher = getAssignedTeacher(assignment);
      if (!assignedTeacher) return null;

      return getTeacherById(assignedTeacher.id, assignedTeacher.fullName) || mapTeacherSummaryToOption(assignedTeacher);
    };

    const getTeacherAutocompleteOptions = (assignment: any) => {
      const selectedTeacher = getTeacherSelectModel(assignment);
      return selectedTeacher ? [selectedTeacher] : [];
    };

    const getAuxiliaryTeacherAutocompleteOptions = (assignment: any) => {
      const auxiliaryTeacher = getAuxiliaryTeacherModel(assignment);
      return auxiliaryTeacher ? [auxiliaryTeacher] : [];
    };

    const getTeacherAvailabilityPercent = ({ availableHours, maxHours }: { availableHours: number; maxHours: number }) => {
      if (!maxHours) return 0;
      return Math.max(0, Math.min(100, Math.round((availableHours / maxHours) * 100)));
    };

    // ── Agrupación por código → árbol aplanado ──────────────────────────────────

    const groupedAssignments = computed(() => {
      const groups: Record<string, any[]> = {};

      filteredAssignments.value.forEach((item) => {
        const subjectCode = item?.subject?.code || '';
        if (!groups[subjectCode]) groups[subjectCode] = [];
        groups[subjectCode].push(item);
      });

      return Object.keys(groups).map((subjectCode) => ({
        subjectCode,
        items: groups[subjectCode].slice().sort((a, b) => String(a?.code || '').localeCompare(String(b?.code || ''))),
      }));
    });

    const buildGroupKey = (assignment: any) => `${assignment.academicPeriodCode}-${assignment.programName}-${assignment.subject?.code}`;

    const isExpanded = (groupKey: string) => !collapsedGroupKeys.value.includes(groupKey);

    /**
     * Convierte la estructura agrupada en filas planas para AppDataList.
     * Las filas hijo se insertan inmediatamente después del padre si está expandido.
     */
    const flattenedRows = computed<any[]>(() => {
      const rows: any[] = [];

      groupedAssignments.value.forEach((group) => {
        const [parentAssignment, ...childAssignments] = group.items;
        const groupKey = buildGroupKey(parentAssignment);
        const hasChildren = childAssignments.length > 0;
        const expanded = isExpanded(groupKey);

        // Fila padre
        rows.push({
          key: groupKey,
          assignment: parentAssignment,
          groupCount: group.items.length,
          isChild: false,
          isExpanded: expanded,
          hasChildren,
          hasTransversal: group.items.some((item) => item.isShared),
        });

        // Filas hijas (solo si el grupo está expandido)
        if (expanded && hasChildren) {
          childAssignments.forEach((assignment) => {
            rows.push({
              key: `${groupKey}-${assignment.id}`,
              assignment,
              groupCount: group.items.length,
              isChild: true,
              isExpanded: false,
              hasChildren: false,
              hasTransversal: Boolean(assignment.isShared),
            });
          });
        }
      });

      return rows;
    });

    // ── Tarjetas de resumen ─────────────────────────────────────────────────────

    const totalAssignments = computed(() => scopedAssignments.value.length);
    const assignedCount = computed(() => scopedAssignments.value.filter((item) => getAssignedTeacherId(item) !== null).length);
    const pendingCount = computed(() => loadManagementStats.value?.pendingCount ?? totalAssignments.value - assignedCount.value);
    const assignedCountDisplay = computed(() => {
      if (loadManagementStats.value) {
        return Math.round((loadManagementStats.value.totalSubjects * loadManagementStats.value.assignedPercentage) / 100);
      }

      return assignedCount.value;
    });
    const assignedPercentage = computed(() => {
      if (typeof loadManagementStats.value?.assignedPercentage === 'number') {
        return loadManagementStats.value.assignedPercentage;
      }

      if (!totalAssignments.value) return 0;
      return Math.round((assignedCount.value / totalAssignments.value) * 100);
    });

    const summaryCards = computed(() => [
      {
        label: 'Total de asignaturas',
        value: loadManagementStats.value?.totalSubjects ?? totalAssignments.value,
        icon: 'book-open',
        variant: 'blue',
      },
      {
        label: 'Asignadas',
        value: `${assignedPercentage.value}%`,
        icon: 'check-circle',
        variant: 'green',
      },
      {
        label: 'Pendientes',
        value: pendingCount.value,
        icon: 'exclamation-triangle',
        variant: 'red',
      },
    ]);

    // ── Computeds auxiliares ────────────────────────────────────────────────────

    const hasAppliedFilters = computed(() => selectedSemester.value !== null || selectedState.value !== null || onlyShared.value);

    const hasPendingFilters = computed(() => pendingSemester.value !== null || pendingState.value !== null || pendingOnlyShared.value);

    const hasActiveFilters = computed(() => hasAppliedFilters.value || hasPendingFilters.value);

    const selectedTeacher = computed<TeacherBankTeacher | null>(() => {
      if (!selectedTeacherUserId.value) return null;

      const teacher = teacherOptions.value.find((item) => item.userId === selectedTeacherUserId.value);
      if (!teacher) return null;

      return {
        id: teacher.id,
        nombre: teacher.fullName,
        tipoContrato: teacher.contractType,
        horasAsignadas: teacher.assignedHours,
        horasMaximas: teacher.maxHours,
        estado: teacher.availabilityState,
        programa: currentProgramName.value || teacher.programName || '',
        asignaturas: scopedAssignments.value
          .filter((item) => getAssignedTeacherId(item) === teacher.id)
          .map((item) => ({
            codigo: item.subject?.code,
            nombre: item.subject?.name,
            grupo: item.code,
            horas: getAssignmentHours(item),
            semestre: getAssignmentSemester(item),
          })),
      };
    });

    const customizeSynchronizationData = computed(() => ({
      ...selectedSynchronizationAssignment.value,
      lmsInstitutionPlatformId:
        selectedSynchronizationAssignment.value?.lmsInstitutionPlatformId ??
        selectedSynchronizationAssignment.value?.subject?.lmsInstitutionPlatformId ??
        selectedSynchronizationAssignment.value?.course?.lmsInstitutionPlatformId ??
        null,
    }));

    // ── Acciones ────────────────────────────────────────────────────────────────

    const syncPendingFilters = () => {
      pendingCampus.value = selectedCampus.value;
      pendingSemester.value = selectedSemester.value;
      pendingState.value = selectedState.value;
      pendingOnlyShared.value = onlyShared.value;
    };

    const applyPendingFilters = () => {
      selectedCampus.value = pendingCampus.value;
      selectedSemester.value = pendingSemester.value;
      selectedState.value = pendingState.value;
      onlyShared.value = pendingOnlyShared.value;
    };

    const clearFilters = () => {
      pendingCampus.value = null;
      pendingSemester.value = null;
      pendingState.value = null;
      pendingOnlyShared.value = false;
      selectedCampus.value = null;
      selectedSemester.value = null;
      selectedState.value = null;
      onlyShared.value = false;
    };

    const getAssignmentStatusLabel = (state: LoadAssignmentState) => getLoadAssignmentLabel(state);
    const getAssignmentStatusVariant = (state: LoadAssignmentState) => getLoadAssignmentVariant(state);

    const toggleGroup = (groupKey: string) => {
      if (collapsedGroupKeys.value.includes(groupKey)) {
        collapsedGroupKeys.value = collapsedGroupKeys.value.filter((k) => k !== groupKey);
      } else {
        collapsedGroupKeys.value = [...collapsedGroupKeys.value, groupKey];
      }

      void syncLoadManagementDataList();
    };

    const addGroup = async (assignment: any) => {
      const academicPeriodId = Number(assignment?.academicPeriodId ?? selectedPeriodo.value ?? 0);
      const subjectId = Number(assignment?.subject?.id ?? 0);
      const campusId = Number(assignment?.campus?.id ?? selectedCampus.value ?? 0);

      if (!academicPeriodId || !subjectId || !campusId) {
        return;
      }

      try {
        await createOfferingSectionService.run({
          academicPeriodId,
          subjectId,
          campusId,
          programId: selectedPrograma.value ?? undefined,
        });

        collapsedGroupKeys.value = collapsedGroupKeys.value.filter((groupKey) => groupKey !== buildGroupKey(assignment));

        loadManagementListRef.value?.refresh?.();
        if (selectedPeriodo.value) {
          void loadLoadManagementStats(selectedPeriodo.value);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const deleteGroup = (assignmentId: number) => {
      sectionToDeleteId.value = assignmentId;
      isDeleteSectionModalOpen.value = true;
    };

    const confirmDeleteSection = async () => {
      if (!sectionToDeleteId.value) return;
      try {
        await deleteOfferingSectionService.run(sectionToDeleteId.value);
        isDeleteSectionModalOpen.value = false;
        sectionToDeleteId.value = null;
        loadManagementListRef.value?.refresh?.();
        if (selectedPeriodo.value) {
          void loadLoadManagementStats(selectedPeriodo.value);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const resolveSubjectAssignmentId = (assignment: any) => {
      const resolvedId = assignment?.subjectAssignmentId ?? assignment?.subjectAssignment?.id ?? assignment?.course?.subjectAssignmentId ?? assignment?.id ?? null;

      const numericId = Number(resolvedId);
      return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
    };

    const openCustomizeSynchronizationModal = (assignment: any) => {
      const resolvedSubjectAssignmentId = resolveSubjectAssignmentId(assignment);
      if (!resolvedSubjectAssignmentId) return;

      subjectAssignmentId.value = resolvedSubjectAssignmentId;
      selectedSynchronizationAssignment.value = assignment;
      customizeSynchronizationModal.value = true;
    };

    const CloseCustomizeSynchronizationModal = async (data: any) => {
      customizeSynchronizationModal.value = false;

      await openSynchronizationReportModal(data);
    };

    const openSynchronizationReportModal = (data: any) => {
      currentData.value = data;
      synchronizationReportModal.value = true;
    };

    const saveCapacity = async (assignment: any) => {
      const assignmentId = Number(assignment?.id ?? 0);

      if (!assignmentId) {
        return;
      }

      const nextCapacity = normalizeCapacityDraft(capacityDrafts.value[assignmentId]);
      const currentCapacity = getAssignmentCapacity(assignment);

      if (nextCapacity === null) {
        capacityDrafts.value = {
          ...capacityDrafts.value,
          [assignmentId]: currentCapacity === null ? '' : String(currentCapacity),
        };
        return;
      }

      if (nextCapacity === currentCapacity) {
        capacityDrafts.value = {
          ...capacityDrafts.value,
          [assignmentId]: String(nextCapacity),
        };
        return;
      }

      const previousDraft = capacityDrafts.value[assignmentId];
      const previousCapacity = assignment?.capacity;

      capacitySavingState.value = {
        ...capacitySavingState.value,
        [assignmentId]: true,
      };

      assignment.capacity = nextCapacity;
      capacityDrafts.value = {
        ...capacityDrafts.value,
        [assignmentId]: String(nextCapacity),
      };

      try {
        await updateOfferingSectionService.run(assignmentId, {
          capacity: nextCapacity,
        });
      } catch (error) {
        assignment.capacity = previousCapacity;
        capacityDrafts.value = {
          ...capacityDrafts.value,
          [assignmentId]: previousDraft,
        };
        console.log(error);
      } finally {
        capacitySavingState.value = {
          ...capacitySavingState.value,
          [assignmentId]: false,
        };
      }
    };

    // Llamado solo cuando el usuario SELECCIONA un docente (nunca al limpiar)
    const handleAssignTeacher = async (assignment: any, teacherOption: any) => {
      const teacherId = teacherOption?.id ?? null;
      if (!teacherId) return;

      const currentTeacherId = assignment?.primaryTeacher?.id ?? null;
      if (teacherId === currentTeacherId) return;

      if (teacherAssignBusy.value.has(assignment.id)) return;
      teacherAssignBusy.value.add(assignment.id);

      const previousPrimaryTeacher = assignment.primaryTeacher ? { ...assignment.primaryTeacher } : createEmptyTeacherSummary();
      const previousStatus = assignment.status;
      const currentOfferingSubjectTeacherId = assignment?.primaryTeacher?.offeringSubjectTeacherId ?? null;
      const selectedTeacherOption = getTeacherById(teacherId) ?? teacherOption;
      const teacherUserId = selectedTeacherOption?.userId ?? null;

      if (!teacherUserId) {
        teacherAssignBusy.value.delete(assignment.id);
        return;
      }

      const projectedHours =
        scopedAssignments.value.filter((item) => getAssignedTeacherId(item) === teacherId && item.id !== assignment.id).reduce((total, item) => total + getAssignmentHours(item), 0) +
        getAssignmentHours(assignment);

      assignment.primaryTeacher = createTeacherSummaryFromOption(selectedTeacherOption);
      assignment.status = projectedHours > (selectedTeacherOption?.maxHours || 0) ? 'Error' : 'Asignado';

      try {
        if (currentOfferingSubjectTeacherId) {
          await removeOfferingTeacher(currentOfferingSubjectTeacherId);
        }
        const offeringSubjectTeacherId = await persistTeacherAssignment(teacherUserId, assignment.id, true);
        assignment.primaryTeacher = {
          ...assignment.primaryTeacher,
          offeringSubjectTeacherId,
        };
        loadManagementListRef.value?.refresh?.();
      } catch (error) {
        assignment.primaryTeacher = previousPrimaryTeacher;
        assignment.status = previousStatus;
        console.log(error);
      } finally {
        teacherAssignBusy.value.delete(assignment.id);
      }
    };

    // Llamado solo cuando el usuario da click en la X del selector
    const handleClearTeacher = async (assignment: any) => {
      const currentTeacherId = assignment?.primaryTeacher?.id ?? null;
      if (!currentTeacherId) return;

      const previousPrimaryTeacher = { ...assignment.primaryTeacher };
      const previousStatus = assignment.status;
      const currentOfferingSubjectTeacherId = assignment?.primaryTeacher?.offeringSubjectTeacherId ?? null;

      assignment.primaryTeacher = createEmptyTeacherSummary();
      assignment.status = assignment?.secondaryTeacher?.id || assignment?.secondaryTeacher?.fullName ? 'Asignado' : 'Pendiente';

      try {
        await removeOfferingTeacher(currentOfferingSubjectTeacherId);
      } catch (error) {
        assignment.primaryTeacher = previousPrimaryTeacher;
        assignment.status = previousStatus;
        console.log(error);
      }
    };

    // Llamado solo cuando el usuario SELECCIONA un docente auxiliar (nunca al limpiar)
    const handleAssignAuxiliaryTeacher = async (assignment: any, teacherOption: any) => {
      const auxiliaryTeacherId = teacherOption?.id ?? null;
      if (!auxiliaryTeacherId) return;

      const currentAuxiliaryTeacherId = assignment?.auxiliaryTeachers?.[0]?.id ?? null;
      if (auxiliaryTeacherId === currentAuxiliaryTeacherId) return;

      const busyKey = -(assignment.id as number);
      if (teacherAssignBusy.value.has(busyKey)) return;
      teacherAssignBusy.value.add(busyKey);

      const previousAuxiliaryTeachers = Array.isArray(assignment?.auxiliaryTeachers) ? [...assignment.auxiliaryTeachers] : [];
      const previousSecondaryTeacher = assignment.secondaryTeacher ? { ...assignment.secondaryTeacher } : createEmptyTeacherSummary();
      const currentOfferingSubjectTeacherId = assignment?.secondaryTeacher?.offeringSubjectTeacherId ?? null;
      const auxiliaryTeacherUserId = teacherOption?.userId ?? null;

      if (!auxiliaryTeacherUserId) {
        teacherAssignBusy.value.delete(busyKey);
        return;
      }

      assignment.auxiliaryTeachers = [teacherOption];
      assignment.secondaryTeacher = createTeacherSummaryFromOption(teacherOption);

      try {
        if (currentOfferingSubjectTeacherId) {
          await removeOfferingTeacher(currentOfferingSubjectTeacherId);
        }
        const offeringSubjectTeacherId = await persistTeacherAssignment(auxiliaryTeacherUserId, assignment.id, false);
        assignment.secondaryTeacher = {
          ...assignment.secondaryTeacher,
          offeringSubjectTeacherId,
        };
        loadManagementListRef.value?.refresh?.();
      } catch (error) {
        assignment.auxiliaryTeachers = previousAuxiliaryTeachers;
        assignment.secondaryTeacher = previousSecondaryTeacher;
        console.log(error);
      } finally {
        teacherAssignBusy.value.delete(busyKey);
      }
    };

    // Llamado solo cuando el usuario da click en la X del selector auxiliar
    const handleClearAuxiliaryTeacher = async (assignment: any) => {
      const currentAuxiliaryTeacherId = assignment?.auxiliaryTeachers?.[0]?.id ?? null;
      if (!currentAuxiliaryTeacherId) return;

      const previousAuxiliaryTeachers = [...assignment.auxiliaryTeachers];
      const previousSecondaryTeacher = { ...assignment.secondaryTeacher };
      const currentOfferingSubjectTeacherId = assignment?.secondaryTeacher?.offeringSubjectTeacherId ?? null;

      assignment.auxiliaryTeachers = [];
      assignment.secondaryTeacher = createEmptyTeacherSummary();

      try {
        await removeOfferingTeacher(currentOfferingSubjectTeacherId);
      } catch (error) {
        assignment.auxiliaryTeachers = previousAuxiliaryTeachers;
        assignment.secondaryTeacher = previousSecondaryTeacher;
        console.log(error);
      }
    };

    const resolveTeacherUserId = (userId: number | null | undefined, teacherId: number | null | undefined): number | null => {
      if (userId) return userId;
      if (teacherId) {
        const found = teacherOptions.value.find((t) => t.id === teacherId || t.contractRecordId === teacherId);
        if (found?.userId) return found.userId;
      }
      return null;
    };

    const openTeacherDetail = (userId: number | null | undefined, teacherId?: number | null) => {
      const resolvedUserId = resolveTeacherUserId(userId, teacherId);
      if (!resolvedUserId) return;
      selectedTeacherUserId.value = resolvedUserId;
      isTeacherDrawerVisible.value = true;
    };

    // ── Generar horario ────────────────────────────────────────────────────────

    const generatingTimetable = ref(false);
    const lastTimetable = ref<any>(null);
    const timetableInfoModalVisible = ref(false);

    const loadCurrentTimetable = async () => {
      if (!selectedPeriodo.value || selectedPeriodo.value < 0) {
        lastTimetable.value = null;
        return;
      }

      try {
        const institutionId = institutionsService.getSelectedInstitution()?.id;
        const offeringsRes = await getCurriculumOfferingsService.run({
          noPag: 'true',
          academicPeriodId: selectedPeriodo.value,
          programId: selectedPrograma.value ?? undefined,
        });
        const offerings = normalizeCollectionResponse(offeringsRes);
        const curriculumOfferingId = offerings[0]?.id;

        if (!curriculumOfferingId) {
          lastTimetable.value = null;
          return;
        }

        const timetables = await getAllTimetablesService.run({
          institutionId,
          curriculumOfferingId,
        });
        lastTimetable.value = timetables.length ? timetables[0] : null;
      } catch (e) {
        console.error('[LoadManagement] loadCurrentTimetable', e);
      }
    };

    watch(selectedPeriodo, () => {
      lastTimetable.value = null;
      void loadCurrentTimetable();
    });

    const confirmGenerateTimetable = () => {
      timetableInfoModalVisible.value = false;
      void generateTimetable();
    };

    const generateTimetable = async () => {
      if (!selectedPeriodo.value) return;
      generatingTimetable.value = true;
      try {
        const institutionId = institutionsService.getSelectedInstitution()?.id;
        const offeringsRes = await getCurriculumOfferingsService.run({
          noPag: 'true',
          academicPeriodId: selectedPeriodo.value,
        });
        const offerings = offeringsRes.data;
        if (!offerings.length) {
          console.warn('[LoadManagement] Sin oferta curricular para este periodo');
          return;
        }
        const curriculumOfferingId = offerings[0].id;
        await generateTimetableService.run({
          institutionId,
          curriculumOfferingId,
        });
        await loadCurrentTimetable();
      } catch (e) {
        console.error('[LoadManagement] generateTimetable', e);
      } finally {
        generatingTimetable.value = false;
      }
    };

    const goToTimetable = () => {
      if (!lastTimetable.value) return;
      router.push({
        name: 'academicPlanning.timetableView',
        params: {
          id: lastTimetable.value._id ?? lastTimetable.value.id ?? 'view',
        },
        state: { timetable: JSON.stringify(lastTimetable.value) },
      });
    };

    const openCreateDrawer = (type: LoadCreationType) => {
      drawerInitialType.value = type;
      isCreateDrawerVisible.value = true;
    };

    const handleCreateLoad = () => {
      loadManagementListRef.value?.refresh?.();
      if (selectedPeriodo.value) {
        void loadLoadManagementStats(selectedPeriodo.value);
      }
    };

    return {
      isInitialLoading,
      // Filtros y selectores
      clearFilters,
      filteredAssignments,
      hasActiveFilters,
      loadManagementDataListService,
      loadManagementListRef,
      loadManagementParams,
      loadManagementTableCount,
      campusOptions,
      onlyShared,
      pendingCampus,
      pendingOnlyShared,
      pendingSemester,
      pendingState,
      periodOptions,
      handlePeriodSearch,
      programOptions,
      applyPendingFilters,
      selectedPeriodo,
      selectedPrograma,
      selectedCampus,
      selectedSemester,
      selectedState,
      semesterOptions,
      syncPendingFilters,
      stateOptions,
      // Tabla
      flattenedRows,
      toggleGroup,
      addGroup,
      deleteGroup,
      confirmDeleteSection,
      isDeleteSectionModalOpen,
      customizeSynchronizationData,
      customizeSynchronizationModal,
      synchronizationReportModal,
      subjectAssignmentId,
      currentData,
      openCustomizeSynchronizationModal,
      CloseCustomizeSynchronizationModal,
      // Docentes
      getTeacherById,
      getAssignedTeacher,
      hasAssignedTeacher,
      getAssignedTeacherId,
      getAssignedTeacherUserId,
      getAssignmentHours,
      capacityDrafts,
      capacitySavingState,
      getAssignmentState,
      getAuxiliaryTeacherModel,
      saveCapacity,
      handleAssignTeacher,
      handleClearTeacher,
      handleAssignAuxiliaryTeacher,
      handleClearAuxiliaryTeacher,
      openTeacherDetail,
      selectedTeacher,
      teacherAutocompleteParams,
      auxTeacherAutocompleteParams,
      teacherAutocompleteService,
      teacherOptions,
      getTeacherAvailabilityPercent,
      getTeacherAutocompleteOptions,
      getAuxiliaryTeacherAutocompleteOptions,
      getTeacherSelectModel,
      // Estado
      getAssignmentStatusLabel,
      getAssignmentStatusVariant,
      // Drawers
      drawerInitialType,
      handleCreateLoad,
      isCreateDrawerVisible,
      isTeacherDrawerVisible,
      selectedTeacherUserId,
      openCreateDrawer,
      // Resumen
      assignedCountDisplay,
      assignedPercentage,
      pendingCount,
      summaryCards,
      // Generar horario
      generatingTimetable,
      lastTimetable,
      timetableInfoModalVisible,
      confirmGenerateTimetable,
      generateTimetable,
      loadCurrentTimetable,
      goToTimetable,
      // Meta
      currentProgramName,
      routes,
      title,
    };
  },
});
</script>

<style scoped>
.loadManagement__overviewCard :deep(.o-card-title) {
  display: none;
}

.loadManagement__overviewCard :deep(.o-card-body) {
  gap: 1rem;
  padding: 1.25rem 1.25rem 1.5rem;
}

/* ── Selectores ── */
.loadManagement__selectorsRow {
  align-items: end;
}
.loadManagement__selectorCol {
  flex: 0 0 auto;
}
.loadManagement__selectorCol--period {
  min-width: 220px;
  max-width: 250px;
}
.loadManagement__selectorCol--program {
  min-width: 320px;
  max-width: 420px;
}

.loadManagement__topFilter {
  display: block;
  width: 100%;
}

.loadManagement__topFilter :deep(.v-select) {
  width: 100%;
}

.loadManagement__topFilter :deep(.vs__dropdown-toggle) {
  width: 100%;
}

.loadManagement__topFilter :deep(.vs__selected-options) {
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

.loadManagement__topFilter :deep(.vs__selected) {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.loadManagement__topFilter :deep(.vs__search) {
  min-width: 0;
  flex: 1 1 auto;
}

.loadManagement__topFilter :deep(.vs__dropdown-menu) {
  min-width: 100%;
}

.loadManagement__topFilter--program :deep(.vs__dropdown-menu) {
  min-width: 340px;
}

/* ── Estadísticas ── */
.loadManagement__statsGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 0;
}

.loadManagement__statsGrid :deep(.appStatCard) {
  min-height: 0;
  padding: 0.8rem 0.95rem;
  gap: 0.2rem;
  border-radius: 14px;
}

.loadManagement__statsGrid :deep(.appStatCard__head) {
  align-items: center;
  gap: 0.4rem;
}

.loadManagement__statsGrid :deep(.appStatCard__label) {
  font-size: 0.74rem;
  letter-spacing: 0.04em;
}

.loadManagement__statsGrid :deep(.appStatCard__value) {
  font-size: 1.6rem;
  line-height: 1;
}

.loadManagement__statsGrid :deep(.appStatCard__icon) {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 7px;
  font-size: 0.82rem;
}

/* ── Título de sección ── */
.loadManagement__sectionTitle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: #0f172a;
}

.loadManagement__sectionTitleLabel {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
}

.loadManagement__sectionBadge {
  flex-shrink: 0;
}

/* ── Filtros dentro del panel de AppDataList ── */
.loadManagement__filtersPanel {
  display: grid;
  gap: 0.5rem;
}

.loadManagement__check {
  min-height: 42px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.9rem;
  background: #f8fafc;
  width: 100%;
}

.loadManagement__checkText {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.2;
}

.loadManagement__check--compact {
  width: auto;
  min-width: 210px;
  white-space: nowrap;
}

.loadManagement__clearBtn {
  margin-left: auto;
}

/* ── Celda de expand/collapse ── */
.loadManagement__toggleCell {
  display: flex;
  justify-content: center;
}

.loadManagement__collapseBtn {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: none;
  background: rgba(148, 163, 184, 0.15);
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.loadManagement__collapseBtn:hover {
  background: rgba(148, 163, 184, 0.3);
}

/* ── Celda código ── */
.loadManagement__codeCell--child {
  color: #94a3b8;
}

/* ── Celda asignatura ── */
.loadManagement__subjectCell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 220px;
}

.loadManagement__subjectCell--child {
  min-width: auto;
}

.loadManagement__subjectHeading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.loadManagement__subjectBadge {
  flex-shrink: 0;
}

/* ── Botones inline ── */
.loadManagement__miniBtn,
.loadManagement__linkBtn,
.loadManagement__deleteBtn {
  border: none;
  background: transparent;
  cursor: pointer;
}

.loadManagement__miniBtn {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), var(--opacity-color-100));
  color: #fff;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* El botón "Grupo" aparece solo al hacer hover en la fila */
.loadManagement__rowAction {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* Se activa cuando la fila de AppDataList está en hover */
:deep(.adl__row:hover .loadManagement__rowAction) {
  opacity: 1;
  pointer-events: auto;
}

/* ── Tag de grupo ── */
.loadManagement__groupTag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.1rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  color: var(--color-primary);
  font-weight: 700;
}

.loadManagement__capacityInput {
  min-width: 5.5rem;
  max-width: 6.5rem;
  margin: 0 auto;
  text-align: center;
  padding: 0.4rem 0.55rem;
  border-radius: 10px;
  border-color: #d7dee8;
  box-shadow: none;
}

.loadManagement__capacityInput:focus {
  border-color: rgba(var(--color-primary-rgb), 0.6);
  box-shadow: 0 0 0 0.18rem rgba(var(--color-primary-rgb), 0.12);
}

.loadManagement__capacityInput:disabled {
  background: #f8fafc;
  color: #64748b;
}

:deep(.adl__th:last-child),
:deep(.adl__td:last-child) {
  position: sticky;
  right: 0;
  z-index: 2;
  background-color: var(--color-light, #fff);
  box-shadow: -10px 0 14px rgba(15, 23, 42, 0.06);
}

:deep(.adl__th:last-child) {
  z-index: 3;
  background-color: var(--bs-gray-100, #f8f9fa);
}

/* ── Select de docente ── */
.loadManagement__teacherField {
  width: 100%;
  min-width: 210px;
}

:deep(.adl__td) {
  position: relative;
  overflow: visible;
}

:deep(.adl__td:has(.loadManagement__teacherSelect:hover)),
:deep(.adl__td:has(.loadManagement__teacherSelect.vs--open)) {
  z-index: 80;
}

.loadManagement__teacherSelect {
  display: block;
  position: relative;
  z-index: 3;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.loadManagement__teacherSelect.vs--open {
  z-index: 90;
}

.loadManagement__teacherSelect :deep(.vs__dropdown-toggle) {
  min-height: 46px;
  padding: 0.35rem 0.7rem !important;
  border-radius: 10px;
  border: 1px solid #d7dee8;
  background: #ffffff;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.loadManagement__teacherSelect :deep(.vs__dropdown-toggle:hover) {
  border-color: #b8c4d3;
  background: #fcfdff;
}

.loadManagement__teacherSelect :deep(.vs__search),
.loadManagement__teacherSelect :deep(.vs__selected) {
  margin: 0;
  line-height: 1.25;
}

.loadManagement__teacherSelect :deep(.vs__search) {
  color: #0f172a;
  min-width: 0;
}

.loadManagement__teacherSelect :deep(.vs__search::placeholder) {
  color: #94a3b8;
}

.loadManagement__teacherSelect :deep(.vs__actions) {
  align-self: center;
  padding-left: 0.4rem;
}

.loadManagement__teacherSelect :deep(.vs__open-indicator) {
  color: #64748b;
}

.loadManagement__teacherSelect :deep(.vs__dropdown-menu) {
  min-width: max(100%, 290px);
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  padding: 0.35rem;
  z-index: 95;
}

.loadManagement__teacherSelect :deep(.vs__dropdown-option) {
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
}

.loadManagement__teacherSelect--single :deep(.vs__selected-options) {
  width: 100%;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  min-width: 0;
  overflow: hidden;
}

.loadManagement__teacherSelect--single :deep(.vs__selected) {
  width: 100%;
  max-width: none;
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.loadManagement__teacherSelect--single :deep(.vs__search) {
  width: 100% !important;
  min-width: 7rem;
  flex: 1 0 7rem;
}

.loadManagement__teacherSelect--multiple :deep(.vs__selected-options) {
  flex-direction: column;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 0.4rem;
  padding: 0.1rem 0;
  max-height: 7.5rem;
  overflow-y: auto;
}

.loadManagement__teacherSelect--multiple :deep(.vs__dropdown-toggle) {
  align-items: flex-start;
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
}

.loadManagement__teacherSelect--multiple :deep(.vs__selected) {
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
}

.loadManagement__teacherSelect--multiple :deep(.vs__search) {
  width: 100%;
}

.loadManagement__teacherDropdownOption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  width: 100%;
}

.loadManagement__teacherOption {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  min-width: 0;
  flex: 1 1 auto;
}

.loadManagement__teacherSelectedValue {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  min-width: 0;
  color: #0f172a;
}

.loadManagement__teacherSelectedValue .text-truncate {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loadManagement__teacherInfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.loadManagement__teacherInfo strong {
  font-size: 0.95rem;
  line-height: 1.15;
  white-space: normal;
}

.loadManagement__teacherInfo small {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.2;
  white-space: normal;
}

.loadManagement__teacherBar {
  width: 72px;
  height: 5px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
  flex-shrink: 0;
}

.loadManagement__teacherBarFill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.loadManagement__teacherBarFill--disponible {
  background: #22c55e;
}

.loadManagement__teacherBarFill--cercano {
  background: #f59e0b;
}

.loadManagement__teacherBarFill--completo {
  background: #ef4444;
}

.loadManagement__teacherNoOptions {
  color: #64748b;
  font-size: 0.9rem;
  padding: 0.45rem 0.25rem;
  line-height: 1.35;
}

/* Dot de disponibilidad del docente */
.loadManagement__teacherDot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.loadManagement__teacherDot--disponible {
  background: #22c55e;
}
.loadManagement__teacherDot--cercano {
  background: #f59e0b;
}
.loadManagement__teacherDot--completo {
  background: #ef4444;
}

/* ── Celda de horas ── */
.loadManagement__hoursCell,
.loadManagement__statusCell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
}

.loadManagement__linkBtn {
  color: var(--color-primary);
  font-weight: 600;
}

.loadManagement__deleteBtn {
  color: var(--color-danger);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .loadManagement__selectorCol,
  .loadManagement__selectorCol--period,
  .loadManagement__selectorCol--program {
    min-width: 0;
    max-width: 100%;
  }

  .loadManagement__statsGrid {
    grid-template-columns: 1fr;
  }

  .loadManagement__sectionTitle,
  .loadManagement__subjectCell,
  .loadManagement__hoursCell,
  .loadManagement__statusCell {
    align-items: flex-start;
    flex-direction: column;
  }

  .loadManagement__teacherSelect :deep(.vs__dropdown-menu) {
    min-width: 240px;
  }
}

.loadManagement__teacherCell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.loadManagement__eyeBtn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.loadManagement__eyeBtn:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  border-color: var(--color-primary);
}
.loadManagement {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
/* ── Generar horario card ──────────────────────────────────────────────────── */
.loadManagement__timetableCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e0e7ff;
  border-radius: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  flex-wrap: wrap;
}

.loadManagement__timetableCardLeft {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.loadManagement__timetableCardIcon {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 1.2rem;
}

.loadManagement__timetableCardTitle {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1e1b4b;
}

.loadManagement__timetableCardSubtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.loadManagement__timetableCardRight {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.loadManagement__timetableLoading {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.loadManagement__timetableActions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
