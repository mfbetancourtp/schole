<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <div v-else>
        <div class="content-welcome">
          <AppCardDashboard style="background: rgb(185 210 235); margin-bottom: 1rem">
            <template #body>
              <div class="card-welcome">
                <div class="container-subCard">
                  <div class="content-title">
                    <h4>Bienvenido de nuevo 👋</h4>
                    <span>{{ userStorage.user.people.names }}</span>
                  </div>
                  <div class="content-body">
                    <p class="body-text">"Aquí tienes el control total de tus datos y estadísticas para tomar decisiones efectivas. ¡Comencemos!📊📖"</p>
                  </div>
                  <div class="content-button">
                    <AppButton class="mt-2 mb-2" data-bs-target="#collapseExample" aria-controls="collapseExample" data-bs-toggle="collapse" aria-expanded="false">
                      <AppIcon icon="sliders-h"></AppIcon>
                      {{ t('classroom.homeTeacher.showFilter') }}
                    </AppButton>
                  </div>
                </div>
                <div class="content-image">
                  <img class="img-fondo" src="../../../assets/imagesDashBoard/dashboard-icon.svg" alt="Fondo de login" />
                </div>
              </div>
            </template>
          </AppCardDashboard>
          <!-- <div class="container-carousel">
          <Carousel class="carousel" :autoplay="2000" :wrap-around="true">
            <Slide v-for="(image, index) in images" :key="index">
              <img :src="image" alt="Slide {{ index }}" class="carousel__image" />
            </Slide>

            <template #addons>
              <Pagination />
            </template>
          </Carousel>
        </div> -->
        </div>
        <section>
          <div class="content-filter collapse mt-2 mb-3" id="collapseExample">
            <div class="row">
              <AppFilter v-model="academicPeriodId" filter-name="homeTeacher.academicPeriodId">
                <label for="academicPeriodId">{{ t('academicPlanning.academicPeriods.singular') }}</label>
                <v-select
                  @option:selected="getLevelsFromAcademicPeriodId()"
                  :reduce="(academicPeriod: any) => academicPeriod.id"
                  :options="academicPeriods.value"
                  input-id="academicPeriodId"
                  v-model="academicPeriodId"
                  class="bg-white"
                  label="name"
                ></v-select>
              </AppFilter>

              <AppFilter v-model="levelId" filter-name="homeTeacher.levelId">
                <label for="levelId">{{ t('academicPrograms.levels.singular') }}</label>
                <v-select
                  @option:selected="getDegrees()"
                  :reduce="(level: any) => level.id"
                  :options="levels.value"
                  input-id="levelId"
                  v-model="levelId"
                  class="bg-white"
                  label="name"
                  multiple
                ></v-select>
              </AppFilter>
            </div>

            <div class="row">
              <AppFilter v-model="degreeId" filter-name="homeTeacher.degreeId">
                <label for="degreeId">{{ t('academicPrograms.degrees.singular') }}</label>
                <v-select
                  @option:selected="getGroups()"
                  :reduce="(degree: any) => degree.id"
                  :options="degrees.value"
                  input-id="degreeId"
                  v-model="degreeId"
                  class="bg-white"
                  label="name"
                  multiple
                ></v-select>
              </AppFilter>
              <AppFilter v-model="groupId" filter-name="homeTeacher.groupId">
                <label for="groupId">{{ t('institutionalConfiguration.auxiliaryInformation.groups.singular') }}</label>
                <v-select :reduce="(group: any) => group.id" :options="groups.value" input-id="groupId" v-model="groupId" class="bg-white" label="name" multiple></v-select>
              </AppFilter>
            </div>
            <div class="col-1 ps-0 d-flex justify-content-end align-items-end w-100 mb-3">
              <div>
                <AppButton @click="getDasboard()">
                  {{ t('classroom.homeTeacher.filter') }}
                </AppButton>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div class="container-content d-flex flex-column gap-3">
            <div class="container-cards">
              <AppCardDashboard :class="selectCard === 'Total Estudiantes' ? ' selecterTotalStudents' : 'totalStudents'" @click="dataSelectCard('Total Estudiantes')">
                <template #title>
                  <span>Total Estudiantes</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.totalStudents }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="totalStudents" strokeColor="#5B5F62"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
              <AppCardDashboard :class="selectCard === 'Total Estudiantes Retirados' ? 'selecterRetiredStudents' : 'retiredStudents'" @click="dataSelectCard('Total Estudiantes Retirados')">
                <template #title>
                  <span>Total Estudiantes Retirados</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.retiredstudents }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="retiredStudents" fillColor="#5B5F62"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
              <AppCardDashboard :class="selectCard === 'Total Estudiantes Reinscritos' ? 'selecterRenewedStudents' : 'renewedStudents'" @click="dataSelectCard('Total Estudiantes Reinscritos')">
                <template #title>
                  <span>Total Estudiantes Reinscritos</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.renewedStudents }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="renewedStudents" fillColor="#5B5F62"></AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
              <AppCardDashboard :class="selectCard === 'Total Grados y Grupos' ? ' selecterTotalDegreesAndGroups' : 'totalDegreesAndGroups'" @click="dataSelectCard('Total Grados y Grupos')">
                <template #title>
                  <span>Total Grados y Grupos</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.degreesAndGroupsQuantity }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="totalDegreesAndGroups" strokeColor="#5B5F62"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
              <AppCardDashboard :class="selectCard === 'Total Asignaturas' ? 'selecterTotalSubjects' : 'totalSubjects'" @click="dataSelectCard('Total Asignaturas')">
                <template #title>
                  <span>Total Asignaturas</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.subjectsQuantityByLevel }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="subjectsByLevel"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
              <AppCardDashboard :class="selectCard === 'Total Docentes' ? ' selecterTeachersByLevel' : 'teachersByLevel'" @click="dataSelectCard('Total Docentes')">
                <template #title>
                  <span>Total Docentes</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.totalTeachersByLevel }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="teachersByLevel" fillColor="#5B5F62"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
              <AppCardDashboard :class="selectCard === 'Total Coordinadores' ? ' selecterTotalCordinators' : 'totalCordinators'" @click="dataSelectCard('Total Coordinadores')">
                <template #title>
                  <span>Total Coordinadores</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>
                        {{ dashboard.value?.coordinatorsQuantityByLevel }}
                      </h3>
                    </div>

                    <AppGetIcon class="form-icon__graph" name="totalCordinators" strokeColor="##5B5F62"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>

              <!-- PENDIENTE DEL SERVICIO -->
              <AppCardDashboard :class="selectCard === 'Total Administrativos' ? ' selecterStudentsByCourse' : 'studentsByCourse'" @click="dataSelectCard('Total Administrativos')">
                <template #title>
                  <span>Total Administrativos</span>
                </template>
                <template #body>
                  <div class="card-graph">
                    <div class="content-icon">
                      <h3>{{ dashboard.value?.administrative }}</h3>
                    </div>
                    <AppGetIcon class="form-icon__graph" name="studentsByCourse" strokeColor="#5B5F62"> </AppGetIcon>
                  </div>
                </template>
              </AppCardDashboard>
            </div>

            <!-- GRÁFICAS -->
            <div class="container-graph mb-3">
              <chart class="w-100" typeGraph="bar" :dataDashboard="dataGraphAcademicPeriod" :dataOptions="dataGraphoptionsPeriods">
                <template #content-header>
                  <h4 class="title-graph">Gráfica por Periodos</h4>
                </template>
              </chart>
              <chart class="w-100" typeGraph="line" :dataDashboard="dataGraphlevels" :dataOptions="dataGraphoptionsLevels">
                <template #content-header>
                  <h4 class="title-graph">Gráfica por Niveles</h4>
                </template>
              </chart>
            </div>
          </div>
        </section>
        <!-- TABLAS -->
        <AppLoading v-if="loadingTable"></AppLoading>
        <section v-else>
          <!-- Total Estudiantes -->
          <AppDatatable v-if="selectCard === 'Total Estudiantes'" class="mt-2 mb-3" :service="getAllStudentWithPagination" :params="dataSendAllStudent" label="Total Estudiantes">
            <AppDatatableColumn label="Nombres" field="names" :sortable="true" v-slot="{ row }">
              <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                <AppAvatar :size="'sm'"></AppAvatar>

                <div class="tw-min-w-0 tw-ml-4">
                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                    {{ row.names }}
                  </div>
                  <div class="tw-leading-5 tw-truncate tw-font-light">
                    {{ row.lastnames }}
                  </div>
                </div>
              </div>
            </AppDatatableColumn>
            <AppDatatableColumn label="Identificacion" field="identification" :sortable="true" v-slot="{ row }">
              {{ row.identification }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Correo Electrónico" field="email" :sortable="true" v-slot="{ row }">
              {{ row.email }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nivel" field="levelName" :sortable="true" v-slot="{ row }">
              {{ row.levelName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeName" :sortable="true" v-slot="{ row }">
              {{ row.degreeName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupName" :sortable="true" v-slot="{ row }">
              {{ row.groupName }}
            </AppDatatableColumn>
          </AppDatatable>
          <!-- Total Estudiantes Retirados -->
          <AppDatatable v-if="selectCard === 'Total Estudiantes Retirados'" class="mt-2 mb-3" :service="getRetiredStudentsWithPagination" :params="dataSendStudentsRetired">
            <AppDatatableColumn label="Nombres" field="names" :sortable="true" v-slot="{ row }">
              <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                <AppAvatar :size="'sm'" :name="row.names ?? '?'"></AppAvatar>

                <div class="tw-min-w-0 tw-ml-4">
                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                    {{ row.names }}
                  </div>
                  <div class="tw-leading-5 tw-truncate tw-font-light">
                    {{ row.lastnames }}
                  </div>
                </div>
              </div>
            </AppDatatableColumn>
            <AppDatatableColumn label="Identificacion" field="identification" :sortable="true" v-slot="{ row }">
              {{ row.identification }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Correo Electrónico" field="email" :sortable="true" v-slot="{ row }">
              {{ row.email }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Fecha de Retiro" field="retiredDate" :sortable="true" v-slot="{ row }">
              {{ row.retiredDate }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nivel" field="levelName" :sortable="true" v-slot="{ row }">
              {{ row.levelName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeName" :sortable="true" v-slot="{ row }">
              {{ row.degreeName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupName" :sortable="true" v-slot="{ row }">
              {{ row.groupName }}
            </AppDatatableColumn>
          </AppDatatable>
          <!-- Total Estudiantes Reinscritos -->
          <AppDatatable v-if="selectCard === 'Total Estudiantes Reinscritos'" class="mt-2 mb-3" :service="getRenewedStudentsWithPagination" :params="dataSendRenewedStudents">
            <AppDatatableColumn label="Nombres" field="names" :sortable="true" v-slot="{ row }">
              <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                <AppAvatar :size="'sm'" :name="row.names ?? '?'"></AppAvatar>

                <div class="tw-min-w-0 tw-ml-4">
                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                    {{ row.names }}
                  </div>
                  <div class="tw-leading-5 tw-truncate tw-font-light">
                    {{ row.lastnames }}
                  </div>
                </div>
              </div>
            </AppDatatableColumn>
            <AppDatatableColumn label="Identificacion" field="identification" :sortable="true" v-slot="{ row }">
              {{ row.identification }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Correo Electrónico" field="email" :sortable="true" v-slot="{ row }">
              {{ row.email }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nivel" field="levelName" :sortable="true" v-slot="{ row }">
              {{ row.levelName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeName" :sortable="true" v-slot="{ row }">
              {{ row.degreeName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupName" :sortable="true" v-slot="{ row }">
              {{ row.groupName }}
            </AppDatatableColumn>
          </AppDatatable>
          <!-- Total Grados y Grupos -->
          <AppDatatable v-if="selectCard === 'Total Grados y Grupos'" class="mt-2 mb-3" :service="getDegreesAndGroupsWithPagination" :params="dataSendDegreesAndGroups">
            <AppDatatableColumn label="Nivel" field="levelName" :sortable="true" v-slot="{ row }">
              {{ row.levelName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeName" :sortable="true" v-slot="{ row }">
              {{ row.degreeName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupName" :sortable="true" v-slot="{ row }">
              {{ row.groupName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Cupo" field="Cupo" :sortable="true" v-slot="{ row }">
              {{ row.quota }}
            </AppDatatableColumn>

            <AppDatatableColumn label="Director de Curso" field="Grado" :sortable="true" v-slot="{ row }">
              {{ row.directorsNames[0].names }}
              {{ row.directorsNames[0].lastnames }}
              <!-- {{ row.directorsNames.map(director => `${director.names} ${director.lastnames}`).join(', ') }} -->
            </AppDatatableColumn>
          </AppDatatable>
          <!-- Total Asignaturas -->
          <AppDatatable v-if="selectCard === 'Total Asignaturas'" class="mt-2 mb-3" :service="getSubjectsByLevelWithPagination" :params="dataSendSubjectsByLevel">
            <AppDatatableColumn label="Nombre del Área" field="areaName" :sortable="true" v-slot="{ row }">
              {{ row.areaName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nombre Asignatura" field="subjectName" :sortable="true" v-slot="{ row }">
              {{ row.subjectName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nivel" field="levelName" :sortable="true" v-slot="{ row }">
              {{ row.levelName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeName" :sortable="true" v-slot="{ row }">
              {{ row.degreeName }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupName" :sortable="true" v-slot="{ row }">
              {{ row.groupName }}
            </AppDatatableColumn>
          </AppDatatable>
          <!-- Total Docentes -->
          <AppDatatable v-if="selectCard === 'Total Docentes'" class="mt-2 mb-3" :service="getTeachersByLevelWithPagination" :params="dataSendTeachersByLevel">
            <AppDatatableColumn label="Nombres" field="names" :sortable="true" v-slot="{ row }">
              <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                <AppAvatar :size="'sm'" :name="row.names ?? '?'"></AppAvatar>

                <div class="tw-min-w-0 tw-ml-4">
                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                    {{ row.teacherNames }}
                  </div>
                  <div class="tw-leading-5 tw-truncate tw-font-light">
                    {{ row.teacherLastnames }}
                  </div>
                </div>
              </div>
            </AppDatatableColumn>
            <AppDatatableColumn label="Identificacion" field="identification" :sortable="true" v-slot="{ row }">
              {{ row.teacherIdentification }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Correo Electrónico" field="email" :sortable="true" v-slot="{ row }">
              {{ row.teacherEmail }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nivel" field="levelNames" :sortable="true" v-slot="{ row }">
              {{ row.levelNames.join(', ') }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeNames" :sortable="true" v-slot="{ row }">
              {{ row.degreeNames.join(', ') }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupNames" :sortable="true" v-slot="{ row }">
              {{ row.groupNames.join(', ') }}
            </AppDatatableColumn>
          </AppDatatable>
          <!-- Total Coordinadores -->
          <AppDatatable v-if="selectCard === 'Total Coordinadores'" class="mt-2 mb-3" :service="getCoordinatorsByLevelWithPagination" :params="dataSendCordinators">
            <AppDatatableColumn label="Nombres" field="names" :sortable="true" v-slot="{ row }">
              <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                <AppAvatar :size="'sm'"></AppAvatar>

                <div class="tw-min-w-0 tw-ml-4">
                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                    {{ row.coordinatorNames }}
                  </div>
                  <div class="tw-leading-5 tw-truncate tw-font-light">
                    {{ row.coordinatorLastnames }}
                  </div>
                </div>
              </div>
            </AppDatatableColumn>
            <AppDatatableColumn label="Identificacion" field="identification" :sortable="true" v-slot="{ row }">
              {{ row.coordinatorIdentification }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Correo Electrónico" field="email" :sortable="true" v-slot="{ row }">
              {{ row.coordinatorEmail }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Nivel" field="levelNames" :sortable="true" v-slot="{ row }">
              {{ row.levelNames.join(', ') }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grado" field="degreeNames" :sortable="true" v-slot="{ row }">
              {{ row.degreeNames.join(', ') }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Grupo" field="groupNames" :sortable="true" v-slot="{ row }">
              {{ row.groupNames.join(', ') }}
            </AppDatatableColumn>
          </AppDatatable>
          <!-- SERVICIO PENDIENTE -->
          <!-- Total Administrativos -->
          <AppDatatable v-if="selectCard === 'Total Administrativos'" class="mt-2 mb-3" :service="getAllAdministrations" :params="dataSendAllAdministrations">
            <AppDatatableColumn label="Nombres" field="names" :sortable="true" v-slot="{ row }">
              <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                <AppAvatar :size="'sm'" :name="row.names ?? '?'"></AppAvatar>

                <div class="tw-min-w-0 tw-ml-4">
                  <div class="tw-font-medium tw-leading-5 tw-truncate">
                    {{ row.administrativeNames }}
                  </div>
                  <div class="tw-leading-5 tw-truncate tw-font-light">
                    {{ row.administrativeLastnames }}
                  </div>
                </div>
              </div>
            </AppDatatableColumn>
            <AppDatatableColumn label="Identificacion" field="administrativeIdentification" :sortable="true" v-slot="{ row }">
              {{ row.administrativeIdentification }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Correo Electrónico" field="administrativeEmail" :sortable="true" v-slot="{ row }">
              {{ row.administrativeEmail }}
            </AppDatatableColumn>
            <AppDatatableColumn label="Rol" field="rolName" :sortable="true" v-slot="{ row }">
              {{ row.rolName }}
            </AppDatatableColumn>
          </AppDatatable>
        </section>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
//import 'vue3-carousel/dist/carousel.css';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import chart from '../../../shared/components/Card/chart.vue';
//import AppAvatar from '../../../shared/components/AppAvatar.vue';
import { useUserStore } from '../../../stores/user';
import { useHeaderStore } from '../../../stores/header.store';

import { GetFiltersAttendanceService } from '../../administration/services/getFiltersAttendance.service';
import { GetLevelsByAcademicPeriodIdService } from '../../administration/services/getLevelsByAcademicPeriodId.service';

import { GetAdminDashboard } from '../services/getAdminDasboard.service';
import { GetAllStudentWithPagination } from '../services/getAllStudentWithPagination.service';
import { GetCoordinatorsByLevelWithPagination } from '../services/getCoordinatorsByLevel.service';
import { GetDegreesAndGroupsWithPagination } from '../services/getDegreesAndGroups.service';
import { GetSubjectsByLevelWithPagination } from '../services/getSubjectsByLevelWithPagination.service';
import { GetAllAdministrations } from '../services/getAllAdministrations.service';
import { GetTeachersByLevelWithPagination } from '../services/getTeachersByLevelWithPagination.service';
import { GetRetiredStudentsWithPagination } from '../services/getRetiredStudentsWithPagination.service';
import { GetRenewedStudentsWithPagination } from '../services/getRenewedStudentsWithPagination.service';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

const getFiltersAttendanceService = new GetFiltersAttendanceService();
const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();

const getAdminDashboard = new GetAdminDashboard();
const getCoordinatorsByLevelWithPagination = new GetCoordinatorsByLevelWithPagination();
const getDegreesAndGroupsWithPagination = new GetDegreesAndGroupsWithPagination();
const getSubjectsByLevelWithPagination = new GetSubjectsByLevelWithPagination();
const getAllStudentWithPagination = new GetAllStudentWithPagination();
const getAllAdministrations = new GetAllAdministrations();
const getTeachersByLevelWithPagination = new GetTeachersByLevelWithPagination();
const getRetiredStudentsWithPagination = new GetRetiredStudentsWithPagination();
const getRenewedStudentsWithPagination = new GetRenewedStudentsWithPagination();

export default defineComponent({
  components: {
    AppIcon,
    AppBaseList,
    AppButton,
    AppFilter,
    AppCardDashboard,
    AppLoading,
    AppGetIcon,
    chart,
    AppDatatable,
    AppDatatableColumn,
    //AppAvatar,
  },
  name: 'HomeDashboard',
  setup() {
    const userStorage = useUserStore();
    const router = useRouter();

    const loading = ref(true);
    const loadingTable = ref(true);
    const title = 'DashBoard';
    const { t } = useI18n();

    const academicPeriodId = ref();
    const levelId = ref();
    const degreeId = ref();
    const groupId = ref();
    const teacherId = ref();
    const selectCard = ref();

    const dashboard: { value: any } = reactive({
      value: {},
    });
    const dataGraphAcademicPeriod = ref<any[]>([]);
    const dataGraphlevels = ref<any[]>([]);
    const dataGraphoptionsLevels = ref({});
    const dataGraphoptionsPeriods = ref({});

    const academicPeriods: { value: any[] } = reactive({ value: [] });
    const levels: { value: any[] } = reactive({ value: [] });
    const degrees: { value: any[] } = reactive({ value: [] });
    const groups: { value: any[] } = reactive({ value: [] });

    onMounted(async () => {
      try {
        // ⚠️ Esto navega fuera de la vista y no verás el widget:
        // router.push(userStorage.items[0].children[0].link);

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Home', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        const filters: any = await getFiltersAttendanceService.run();
        academicPeriods.value = filters.academicPeriods;

        let localfilters: any = localStorage.getItem('filters') ?? '';
        if (localfilters) {
          localfilters = JSON.parse(localfilters);

          if (localfilters['homeTeacher.academicPeriodId']) {
            await getLevelsFromAcademicPeriodId(localfilters['homeTeacher.academicPeriodId']);

            if (localfilters['homeTeacher.levelId']) {
              await getDegrees(localfilters['homeTeacher.levelId']);

              if (localfilters['homeTeacher.degreeId']) {
                await getGroups(localfilters['homeTeacher.degreeId']);
              }
            }
          }
          academicPeriodId.value = localfilters['homeTeacher.academicPeriodId'] ?? null;
          levelId.value = localfilters['homeTeacher.levelId'] ?? null;
          degreeId.value = localfilters['homeTeacher.degreeId'] ?? null;
          groupId.value = localfilters['homeTeacher.groupId'] ?? null;
          teacherId.value = localfilters['homeTeacher.teacherId'] ?? null;
        }

        await getDasboard();
        dataSelectCard('Total Estudiantes');
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const convertToCommaSeparatedString = (value: any) => {
      if (Array.isArray(value)) return value.join(',');
      return value;
    };

    const getDasboard = async () => {
      loadingTable.value = true;
      const params = {
        academicPeriodId: academicPeriodId.value,
        levelId: convertToCommaSeparatedString(levelId.value),
        degreeId: convertToCommaSeparatedString(degreeId.value),
        groupId: convertToCommaSeparatedString(groupId.value),
      };

      dashboard.value = await getAdminDashboard.run(params);
      const dataLevels: any[] = [];
      dashboard.value.studentsBylevel.map((item: any) =>
        item.levels.map((subitem: any) => {
          const verifyLevels = dataLevels.find((datas: any) => datas.levelId === subitem.levelId);
          if (!verifyLevels) dataLevels.push(subitem);
        })
      );

      // GRAFICA POR PERIODOS
      dataGraphAcademicPeriod.value = [
        {
          name: 'Total Estudiantes',
          data: dashboard.value.studentsBylevel.map((item: any) => item.total),
        },
      ];
      dataGraphoptionsPeriods.value = {
        chart: { type: 'bar', height: 350 },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
            distributed: true,
          },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
          categories: dashboard.value.studentsBylevel.map((item: any) => item.academicPeriodName),
        },
        fill: { opacity: 1 },
        theme: { palette: 'palette2' },
      };

      // GRAFICA POR NIVELES
      dataGraphlevels.value = dashboard.value.studentsBylevel.map((level: any) => ({
        name: level.academicPeriodName,
        data: level.levels.map((item: any) => item.total),
      }));
      dataGraphoptionsLevels.value = {
        chart: { height: 350, type: 'line', zoom: { enabled: false } },
        dataLabels: { enabled: false },
        stroke: { width: [5, 7, 5], curve: 'straight', dashArray: [8, 5, 0] },
        markers: { size: 0, hover: { sizeOffset: 6 } },
        xaxis: {
          categories: dataLevels.map((item: any) => item.levelName?.split('-')[0] || ''),
          labels: {
            rotate: -60,
            rotateAlways: false,
            hideOverlappingLabels: true,
            showDuplicates: false,
            trim: false,
            maxHeight: 120,
            style: {
              colors: [],
              fontSize: '10px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              cssClass: 'apexcharts-xaxis-label',
            },
          },
        },
        theme: { palette: 'palette8' },
      };

      loadingTable.value = false;
    };

    const getLevelsFromAcademicPeriodId = async (academicPeriodIdFilter: any = null) => {
      levels.value = [];
      degrees.value = [];
      groups.value = [];

      levelId.value = null;
      degreeId.value = null;
      groupId.value = null;

      const permission = 'classroom-administration.home-teacher';
      levels.value = await getLevelsByAcademicPeriodIdService.run(academicPeriodId.value ?? academicPeriodIdFilter, permission);
    };

    const getDegrees = async (levelIdsFilter: Array<any> = []) => {
      degrees.value = [];
      groups.value = [];
      degreeId.value = null;
      groupId.value = null;

      levels.value.forEach((level: any) => {
        if (levelIdsFilter.length === 0 || levelIdsFilter.includes(level.id)) {
          degrees.value.push(...level.degrees);
        }
      });
    };

    const getGroups = async (degreeIdFilter: Array<any> = []) => {
      groups.value = [];
      const addedGroupIds = new Set();

      degrees.value.forEach((degree: any) => {
        if (degreeIdFilter.length === 0 || degreeIdFilter.includes(degree.id)) {
          degree.groups.forEach((group: any) => {
            if (!addedGroupIds.has(group.id)) {
              addedGroupIds.add(group.id);
              groups.value.push(group);
            }
          });
        }
      });
    };

    const dataSelectCard = (title: string) => {
      selectCard.value = title;
    };

    const dataSendCordinators = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendDegreesAndGroups = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendSubjectsByLevel = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendAllStudent = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendTeachersByLevel = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendRenewedStudents = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendStudentsRetired = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));
    const dataSendAllAdministrations = computed(() => ({
      academicPeriodId: academicPeriodId.value,
      levelId: convertToCommaSeparatedString(levelId.value),
      degreeId: convertToCommaSeparatedString(degreeId.value),
      groupId: convertToCommaSeparatedString(groupId.value),
    }));

    return {
      loading,
      loadingTable,
      t,
      title,
      dashboard,
      dataGraphAcademicPeriod,
      dataGraphlevels,
      dataGraphoptionsPeriods,
      dataGraphoptionsLevels,

      academicPeriods,
      degrees,
      levels,
      groups,

      academicPeriodId,
      levelId,
      degreeId,
      groupId,
      teacherId,

      getLevelsFromAcademicPeriodId,
      getDegrees,
      getGroups,
      getDasboard,

      // images,
      userStorage,

      dataSendAllStudent,
      getAllStudentWithPagination,
      getCoordinatorsByLevelWithPagination,
      dataSendCordinators,
      getDegreesAndGroupsWithPagination,
      dataSendDegreesAndGroups,
      getSubjectsByLevelWithPagination,
      dataSendSubjectsByLevel,
      getAllAdministrations,
      dataSendAllAdministrations,
      getTeachersByLevelWithPagination,
      dataSendTeachersByLevel,
      getRenewedStudentsWithPagination,
      dataSendRenewedStudents,
      getRetiredStudentsWithPagination,
      dataSendStudentsRetired,

      selectCard,
      dataSelectCard,
    };
  },
});
</script>

<style scoped>
.container-card {
  display: flex;
  width: 100%;
  gap: 15px;
}

.content-welcome {
  width: 100%;
  display: flex;
  gap: 1rem;
}

.container-cards {
  /* display: flex; */
  /* flex-wrap: wrap; */
  margin-bottom: 5px;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(315px, 1fr));
}

.card-welcome {
  width: 100%;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
}

.container-subCard {
  display: flex;
  text-align: left;
  flex-direction: column;
  /* width: 50%; */
  gap: 5px;
}

.content-title {
  color: white;
}

.card-graph {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-graph {
  display: flex;
  justify-content: center;
}

.content-image {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.img-fondo {
  max-width: 55%;
  min-width: 50%;
  height: auto;
}

.container-carousel {
  display: contents;
}

.carousel {
  width: 500px;
  border-radius: 16px;
  background: #fff;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.container-graph {
  width: 100%;
  height: 50%;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.content-filter {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  border-radius: 16px;
  padding: 24px;
  height: auto;
  gap: 5px;
  justify-content: center;
  width: 100%;
}

.form-icon__graph {
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* colores cards */
.totalDegreesAndGroups,
.studentsByCourse {
  background: #ffefc4;
  box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.totalDegreesAndGroups:hover,
.studentsByCourse:hover,
.selecterTotalDegreesAndGroups,
.selecterStudentsByCourse {
  background: #ffe399;
  box-shadow: 1px 2px 6px 0px rgba(0, 0, 0, 0.4);
  transform: scale(0.94);
}

.totalSubjects,
.retiredStudents {
  background: #bcedcc;
  box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.totalSubjects:hover,
.retiredStudents:hover,
.selecterRetiredStudents,
.selecterTotalSubjects {
  background: #91deaa;
  box-shadow: 1px 2px 6px 0px rgba(0, 0, 0, 0.4);
  transform: scale(0.94);
}

.totalCordinators,
.totalStudents {
  background: #ace6f1;
  cursor: pointer;
}

.totalCordinators:hover,
.totalStudents:hover,
.selecterTotalStudents,
.selecterTotalCordinators {
  background: #8ae1ef;
  box-shadow: 1px 2px 6px 0px rgba(0, 0, 0, 0.4);
  transform: scale(0.94);
}

.renewedStudents,
.teachersByLevel {
  background: #ffaeae;
  box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.renewedStudents:hover,
.teachersByLevel:hover,
.selecterTeachersByLevel,
.selecterRenewedStudents {
  background: #fd8686;
  box-shadow: 1px 2px 6px 0px rgba(0, 0, 0, 0.4);
  transform: scale(0.94);
}

@media (max-width: 1100px) {
  .content-welcome {
    flex-direction: column;
  }

  /* .img-fondo {
    max-width: 100%;
    min-width: 50%;
    height: auto;
  } */

  /* 
  .carousel {
    width: 500px;
    border-radius: 16px;
    background: #fff;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  } */

  /* .container-carousel {
    width: 100%;
    height: 30vh;
    display: flex;
  }

  .carousel__image {
    width: 100%;
    height: 26vh;
  } */
  .container-graph {
    flex-direction: column;
  }
}

@media (max-width: 900px) {
  .container-graph {
    flex-direction: column;
  }

  .card-welcome {
    flex-direction: column;
  }

  .container-subCard {
    text-align: center;
  }

  .content-image {
    justify-content: center;
  }

  .img-fondo {
    max-width: 40%;
    min-width: 35%;
    height: auto;
  }
}
</style>
