<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <!-- Botón de volver -->
    <template #actions>
      <AppButtonBack @click="goBack" />
    </template>

    <!-- Contenido principal -->
    <template v-slot:content>
      <!-- Selector oculto + pestañas -->
      <div style="display: none">
        <SelectionStudentsByParent @update-student-user-id="updateStudentUserId" />
      </div>
      <TabsStudent />

      <!-- Indicador de carga -->
      <AppLoading v-if="loading" />

      <!-- Cuando ya tengo los datos relacionados -->
      <div v-else-if="relatedData">
        <!-- Filtros -->
        <section class="d-flex justify-content-end">
          <AppDatatableFilters>
            <div class="mb-3 tw-flex-1">
              <label for="periodId">{{ t('Periodos') }}</label>
              <AppAutocomplete :options="relatedData.periods" input-id="periodId" v-model="periodId" />
            </div>
            <div class="mb-3 tw-flex-1">
              <label for="courseId">{{ t('Asignaturas') }}</label>
              <AppAutocomplete :options="relatedData.courses" input-id="courseId" v-model="courseId" />
            </div>
          </AppDatatableFilters>
        </section>

        <!-- 0. Mensaje global si no hay NADA en **ninguna** sección -->
        <AppEmptyResponse
          v-if="!activitiesStudent?.activities?.length && !activitiesStudent?.learningOutcomes?.length && !activitiesStudent?.competencies?.length && !activitiesStudent?.activityCategories?.length"
          size="sm"
          subtitle="Todavía no hay registros disponibles aquí"
        />

        <template v-else>
          <!-- 1. ACTIVIDADES NORMALES -->
          <section class="grid-cards mb-4">
            <template v-if="activitiesStudent?.activities?.length">
              <AppCard v-for="(activity, i) in activitiesStudent.activities" :key="i">
                <template #body>
                  <div class="border-bottom pb-1 d-flex justify-content-between align-items-center mb-3">
                    <span
                      :class="{
                        'text-danger': activity.status.includes('Sin entrega'),
                        'text-success': activity.status.includes('Calificado'),
                        'text-secondary': activity.status.includes('Entregado'),
                      }"
                    >
                      {{ activity.status }}
                    </span>
                    <span class="fs-8 text-muted">
                      {{ activity.dayName }}
                      {{ dayjs(activity.dateUntil, 'YYYY-MM-DD HH:mm:ss').format('h:mm A') }}
                    </span>
                  </div>
                  <h5 class="mb-1" style="font-weight: 500">
                    {{ activity.courseName }}
                  </h5>
                  <p class="m-0 mb-2">{{ activity.name }}</p>
                  <p v-if="activity.attachmentUrl" @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">Archivo adjunto</p>
                  <div v-if="activity.medals.length" class="d-flex flex-wrap justify-content-center">
                    <img
                      v-for="(medal, j) in activity.medals"
                      :key="j"
                      :src="medal.urlImage"
                      :alt="'Medalla de ' + medal.name"
                      style="height: 2.5rem; width: 2.5rem"
                      v-tooltip="'Medalla de ' + medal.name"
                    />
                  </div>
                </template>
                <template #footer>
                  <AppButton @click="openActivitySummaryModal(activity)" v-tooltip="'Resumen de la actividad'" icon="eye" outlined />
                </template>
              </AppCard>
            </template>
            <AppEmptyResponse v-else-if="activitiesStudent?.activities" size="sm" :subtitle="false" />
          </section>

          <!-- 2. ACTIVIDADES POR DESEMPEÑO -->
          <section v-if="activitiesStudent?.learningOutcomes !== undefined" class="mb-4">
            <h5 class="under__line">Actividades por desempeño</h5>

            <!-- Si tengo al menos 1 desempeño -->
            <template v-if="activitiesStudent.learningOutcomes.length">
              <AppAccordion class="mt-2" v-slot="{ accordionId }">
                <AppAccordionItem v-for="lo in activitiesStudent.learningOutcomes" :key="lo.id" :accordion-id="accordionId">
                  <template #head>
                    <div class="containerAcordeon" style="display: flex; gap: 10px">
                      {{ lo.name }} – {{ lo.percentage }}%
                      <AppBadge :variant="'primary'" :label="`Calificación final: ${lo.finalScore}`" />
                    </div>
                  </template>
                  <template #content>
                    <!-- 2.1 Con categorías -->
                    <template v-if="lo.activityCategories?.length">
                      <AppAccordion class="mt-2" v-slot="{ accordionId: catId }">
                        <AppAccordionItem v-for="cat in lo.activityCategories" :key="cat.id" :accordion-id="catId">
                          <template #head> {{ cat.name }} – {{ cat.percentage }}% </template>
                          <template #content>
                            <section class="grid-cards mb-4">
                              <AppCard v-for="(activity, idx) in cat.activities" :key="idx">
                                <template #body>
                                  <div class="border-bottom pb-1 d-flex justify-content-between align-items-center mb-3">
                                    <span
                                      :class="{
                                        'text-danger': activity.status.includes('Sin entrega'),
                                        'text-success': activity.status.includes('Calificado'),
                                        'text-secondary': activity.status.includes('Entregado'),
                                      }"
                                    >
                                      {{ activity.status }}
                                    </span>
                                    <span class="fs-8 text-muted">
                                      {{ activity.dayName }}
                                      {{ dayjs(activity.dateUntil, 'YYYY-MM-DD HH:mm:ss').format('h:mm A') }}
                                    </span>
                                  </div>
                                  <h5 class="mb-1" style="font-weight: 500">
                                    {{ activity.courseName }}
                                  </h5>
                                  <p class="m-0 mb-2">{{ activity.name }}</p>
                                  <p v-if="activity.attachmentUrl" @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">
                                    Archivo adjunto
                                  </p>
                                  <div v-if="activity.medals.length" class="d-flex flex-wrap justify-content-center">
                                    <img
                                      v-for="(medal, k) in activity.medals"
                                      :key="k"
                                      :src="medal.urlImage"
                                      :alt="'Medalla de ' + medal.name"
                                      style="height: 2.5rem; width: 2.5rem"
                                      v-tooltip="'Medalla de ' + medal.name"
                                    />
                                  </div>
                                </template>
                                <template #footer>
                                  <AppButton @click="openActivitySummaryModal(activity)" v-tooltip="'Resumen de la actividad'" icon="eye" outlined />
                                </template>
                              </AppCard>
                            </section>
                          </template>
                        </AppAccordionItem>
                      </AppAccordion>
                    </template>

                    <!-- 2.2 Sin categorías pero con actividades sueltas -->
                    <section class="grid-cards mb-4" v-else-if="lo.activities?.length">
                      <AppCard v-for="(activity, idx) in lo.activities" :key="idx">
                        <template #body>
                          <div class="border-bottom pb-1 d-flex justify-content-between align-items-center mb-3">
                            <span
                              :class="{
                                'text-danger': activity.status.includes('Sin entrega'),
                                'text-success': activity.status.includes('Calificado'),
                                'text-secondary': activity.status.includes('Entregado'),
                              }"
                            >
                              {{ activity.status }}
                            </span>
                            <span class="fs-8 text-muted">
                              {{ activity.dayName }}
                              {{ dayjs(activity.dateUntil, 'YYYY-MM-DD HH:mm:ss').format('h:mm A') }}
                            </span>
                          </div>
                          <h5 class="mb-1" style="font-weight: 500">
                            {{ activity.courseName }}
                          </h5>
                          <p class="m-0 mb-2">{{ activity.name }}</p>
                          <p v-if="activity.attachmentUrl" @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">Archivo adjunto</p>
                          <div v-if="activity.medals.length" class="d-flex flex-wrap justify-content-center">
                            <img
                              v-for="(medal, k) in activity.medals"
                              :key="k"
                              :src="medal.urlImage"
                              :alt="'Medalla de ' + medal.name"
                              style="height: 2.5rem; width: 2.5rem"
                              v-tooltip="'Medalla de ' + medal.name"
                            />
                          </div>
                        </template>
                        <template #footer>
                          <AppButton @click="openActivitySummaryModal(activity)" v-tooltip="'Resumen de la actividad'" icon="eye" outlined />
                        </template>
                      </AppCard>
                    </section>

                    <!-- 2.3 Si ninguna de las anteriores -->
                    <AppEmptyResponse v-else size="sm" subtitle="No hay actividades en este desempeño" />
                  </template>
                </AppAccordionItem>
              </AppAccordion>
            </template>

            <!-- Si está definido pero no tengo ningún desempeño -->
            <AppEmptyResponse v-else size="sm" subtitle="No hay desempeños para mostrar" />
          </section>

          <!-- 3. ACTIVIDADES POR COMPETENCIAS -->
          <section v-if="activitiesStudent?.competencies !== undefined" class="mb-4">
            <h5 class="under__line">Actividades por competencias</h5>

            <!-- Si tengo al menos 1 competencia -->
            <template v-if="activitiesStudent.competencies.length">
              <AppAccordion class="mt-2" v-slot="{ accordionId }">
                <AppAccordionItem v-for="c in activitiesStudent.competencies" :key="c.id" :accordion-id="accordionId">
                  <template #head> {{ c.name }} – {{ c.percentage }}% </template>
                  <template #content>
                    <!-- 3.1 Con sub-desempeños -->
                    <template v-if="c.learningOutcomes?.length">
                      <AppAccordion class="mt-2" v-slot="{ accordionId: loId }">
                        <AppAccordionItem v-for="lo in c.learningOutcomes" :key="lo.id" :accordion-id="loId">
                          <template #head> {{ lo.name }} – {{ lo.percentage }}% </template>
                          <template #content>
                            <section class="grid-cards mb-4">
                              <AppCard v-for="(activity, idx) in lo.activities" :key="idx">
                                <template #body>
                                  <div class="border-bottom pb-1 d-flex justify-content-between align-items-center mb-3">
                                    <span
                                      :class="{
                                        'text-danger': activity.status.includes('Sin entrega'),
                                        'text-success': activity.status.includes('Calificado'),
                                        'text-secondary': activity.status.includes('Entregado'),
                                      }"
                                    >
                                      {{ activity.status }}
                                    </span>
                                    <span class="fs-8 text-muted">
                                      {{ activity.dayName }}
                                      {{ dayjs(activity.dateUntil, 'YYYY-MM-DD HH:mm:ss').format('h:mm A') }}
                                    </span>
                                  </div>
                                  <h5 class="mb-1" style="font-weight: 500">
                                    {{ activity.courseName }}
                                  </h5>
                                  <p class="m-0 mb-2">{{ activity.name }}</p>
                                  <p v-if="activity.attachmentUrl" @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">
                                    Archivo adjunto
                                  </p>
                                  <div v-if="activity.medals.length" class="d-flex flex-wrap justify-content-center">
                                    <img
                                      v-for="(medal, k) in activity.medals"
                                      :key="k"
                                      :src="medal.urlImage"
                                      :alt="'Medalla de ' + medal.name"
                                      style="height: 2.5rem; width: 2.5rem"
                                      v-tooltip="'Medalla de ' + medal.name"
                                    />
                                  </div>
                                </template>
                                <template #footer>
                                  <AppButton @click="openActivitySummaryModal(activity)" v-tooltip="'Resumen de la actividad'" icon="eye" outlined />
                                </template>
                              </AppCard>
                            </section>
                          </template>
                        </AppAccordionItem>
                      </AppAccordion>
                    </template>

                    <!-- 3.2 Sin sub-desempeños pero con actividades -->
                    <section class="grid-cards mb-4" v-else-if="c.activities?.length">
                      <AppCard v-for="(activity, idx) in c.activities" :key="idx">
                        <template #body>
                          <div class="border-bottom pb-1 d-flex justify-content-between align-items-center mb-3">
                            <span
                              :class="{
                                'text-danger': activity.status.includes('Sin entrega'),
                                'text-success': activity.status.includes('Calificado'),
                                'text-secondary': activity.status.includes('Entregado'),
                              }"
                            >
                              {{ activity.status }}
                            </span>
                            <span class="fs-8 text-muted">
                              {{ activity.dayName }}
                              {{ dayjs(activity.dateUntil, 'YYYY-MM-DD HH:mm:ss').format('h:mm A') }}
                            </span>
                          </div>
                          <h5 class="mb-1" style="font-weight: 500">
                            {{ activity.courseName }}
                          </h5>
                          <p class="m-0 mb-2">{{ activity.name }}</p>
                          <p v-if="activity.attachmentUrl" @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">Archivo adjunto</p>
                          <div v-if="activity.medals.length" class="d-flex flex-wrap justify-content-center">
                            <img
                              v-for="(medal, k) in activity.medals"
                              :key="k"
                              :src="medal.urlImage"
                              :alt="'Medalla de ' + medal.name"
                              style="height: 2.5rem; width: 2.5rem"
                              v-tooltip="'Medalla de ' + medal.name"
                            />
                          </div>
                        </template>
                        <template #footer>
                          <AppButton @click="openActivitySummaryModal(activity)" v-tooltip="'Resumen de la actividad'" icon="eye" outlined />
                        </template>
                      </AppCard>
                    </section>

                    <!-- 3.3 Ni una ni otra -->
                    <AppEmptyResponse v-else size="sm" subtitle="No hay actividades en esta competencia" />
                  </template>
                </AppAccordionItem>
              </AppAccordion>
            </template>

            <!-- Si está definido pero no hay ninguna competencia -->
            <AppEmptyResponse v-else size="sm" subtitle="Sin competencias disponibles" />
          </section>

          <!-- 4. ACTIVIDADES POR CATEGORÍAS -->
          <section v-if="activitiesStudent?.activityCategories !== undefined" class="mb-4">
            <h5 class="under__line">Actividades por categorías</h5>

            <!-- Si tengo al menos 1 categoría -->
            <template v-if="activitiesStudent.activityCategories.length">
              <AppAccordion class="mt-2" v-slot="{ accordionId }">
                <AppAccordionItem v-for="cat in activitiesStudent.activityCategories" :key="cat.id" :accordion-id="accordionId">
                  <template #head> {{ cat.name }} – {{ cat.percentage }}% </template>
                  <template #content>
                    <section class="grid-cards mb-4" v-if="cat.activities?.length">
                      <AppCard v-for="(activity, idx) in cat.activities" :key="idx">
                        <template #body>
                          <div class="border-bottom pb-1 d-flex justify-content-between align-items-center mb-3">
                            <span
                              :class="{
                                'text-danger': activity.status.includes('Sin entrega'),
                                'text-success': activity.status.includes('Calificado'),
                                'text-secondary': activity.status.includes('Entregado'),
                              }"
                            >
                              {{ activity.status }}
                            </span>
                            <span class="fs-8 text-muted">
                              {{ activity.dayName }}
                              {{ dayjs(activity.dateUntil, 'YYYY-MM-DD HH:mm:ss').format('h:mm A') }}
                            </span>
                          </div>
                          <h5 class="mb-1" style="font-weight: 500">
                            {{ activity.courseName }}
                          </h5>
                          <p class="m-0 mb-2">{{ activity.name }}</p>
                          <p v-if="activity.attachmentUrl" @click="downloadFile(activity.attachmentUrl)" class="text-decoration-underline text-primary m-0 mt-2 pointer fs-7">Archivo adjunto</p>
                          <div v-if="activity.medals.length" class="d-flex flex-wrap justify-content-center">
                            <img
                              v-for="(medal, k) in activity.medals"
                              :key="k"
                              :src="medal.urlImage"
                              :alt="'Medalla de ' + medal.name"
                              style="height: 2.5rem; width: 2.5rem"
                              v-tooltip="'Medalla de ' + medal.name"
                            />
                          </div>
                        </template>
                        <template #footer>
                          <AppButton @click="openActivitySummaryModal(activity)" v-tooltip="'Resumen de la actividad'" icon="eye" outlined />
                        </template>
                      </AppCard>
                    </section>
                    <AppEmptyResponse v-else size="sm" subtitle="Sin actividades en esta categoría" />
                  </template>
                </AppAccordionItem>
              </AppAccordion>
            </template>

            <!-- Si está definido pero no hay ninguna categoría -->
            <AppEmptyResponse v-else size="sm" subtitle="No hay categorías de actividad" />
          </section>
        </template>

        <!-- Modal de detalle -->
        <AppModal v-model="activitySummaryModal" size="lg">
          <ActivitySummary v-if="activitySummaryModal" :activity="currentActivity" />
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, watch, onMounted } from 'vue';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useTabsStudentStore } from '../../../stores/tabsStudent.store';
import dayjs from 'dayjs';

import ActivitySummary from '../components/ActivitySummary.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import TabsStudent from '../components/TabsStudent.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';
import AppDatatableFilters from '../../../shared/components/Datatable/AppDatatableFilters.vue';

import { mimeTypesConstant } from '../../../shared/constant/mimeTypes.constant';

import { GetStudentActivitiesService } from '../services/getStudentActivities.service';
import { GetRelatedDataHomeStudentService } from '../services/getRelatedDataHomeStudent.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';

const getRelatedDataHomeStudentService = new GetRelatedDataHomeStudentService();
const getStudentActivitiesService = new GetStudentActivitiesService();

dayjs.extend(isoWeek);

export default defineComponent({
  name: 'studentActivities',
  components: {
    SelectionStudentsByParent,
    AppDatatableFilters,
    AppEmptyResponse,
    AppAutocomplete,
    ActivitySummary,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    TabsStudent,
    AppButtonBack,
    AppAccordion,
    AppAccordionItem,
    AppBadge,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.studentActivities.title');
    const subtitle = t('classroom.studentActivities.subtitle');
    const router = useRouter();

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Salón de clases', url: '' };
    headerStorage.moduleItem = { name: 'Inicio Estudiante', url: '' };
    headerStorage.moduleSubItem = { name: title, url: '' };

    const routes = [{ name: title }];
    useMeta({ title: title });

    const currentActivity: Ref<any> = ref(null);
    const relatedData: Ref<any> = ref(null);
    const activitiesStudent: Ref<any> = ref();
    const filter = ref(0);

    const medals: Ref<any[]> = ref([
      {
        id: 5,
        institutionId: 0,
        name: 'Autodisciplina',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1650990343530.png',
        description: null,
        createdAt: '2022-04-26 16:25:47',
        updatedAt: null,
      },
      {
        id: 6,
        institutionId: 0,
        name: 'Compromiso',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001176600.png',
        description: null,
        createdAt: '2022-04-26 19:26:18',
        updatedAt: null,
      },
      {
        id: 7,
        institutionId: 0,
        name: 'Constancia',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001316461.png',
        description: null,
        createdAt: '2022-04-26 19:28:37',
        updatedAt: null,
      },
      {
        id: 8,
        institutionId: 0,
        name: 'Creatividad',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001338044.png',
        description: null,
        createdAt: '2022-04-26 19:28:59',
        updatedAt: null,
      },
      {
        id: 9,
        institutionId: 0,
        name: 'Determinacion',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001365600.png',
        description: null,
        createdAt: '2022-04-26 19:29:26',
        updatedAt: null,
      },
      {
        id: 10,
        institutionId: 0,
        name: 'Eficiencia',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001390045.png',
        description: null,
        createdAt: '2022-04-26 19:29:51',
        updatedAt: null,
      },
      {
        id: 11,
        institutionId: 0,
        name: 'Excelencia',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001415074.png',
        description: null,
        createdAt: '2022-04-26 19:30:16',
        updatedAt: null,
      },
      {
        id: 12,
        institutionId: 0,
        name: 'Innovacion',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001442781.png',
        description: null,
        createdAt: '2022-04-26 19:30:44',
        updatedAt: null,
      },
      {
        id: 13,
        institutionId: 0,
        name: 'Laboriosidad',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001476113.png',
        description: null,
        createdAt: '2022-04-26 19:31:17',
        updatedAt: null,
      },
      {
        id: 14,
        institutionId: 0,
        name: 'Servicio',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001502768.png',
        description: null,
        createdAt: '2022-04-26 19:31:44',
        updatedAt: null,
      },
      {
        id: 15,
        institutionId: 0,
        name: 'Solidaridad',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001530526.png',
        description: null,
        createdAt: '2022-04-26 19:32:11',
        updatedAt: null,
      },
      {
        id: 16,
        institutionId: 0,
        name: 'Trabajo en Equipo',
        urlImage: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/dev/2/2022/medal/1651001558441.png',
        description: null,
        createdAt: '2022-04-26 19:32:39',
        updatedAt: null,
      },
    ]);

    const tabsStore = useTabsStudentStore();
    const courseId = ref();
    const periodId = ref();
    const userId = ref();

    const activitySummaryModal = ref(false);
    const notFound = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      tabsStore.persistState();
    });
    // función para volver atrás
    const goBack = () => {
      // --> Opción A: leerlo desde el store
      const tab = tabsStore.activities.active ? tabsStore.activities : tabsStore.atendence;

      if (tab.returnTo) {
        router.push(tab.returnTo);
      } else {
        router.go(-1);
      }

      // --> Opción B: si prefieres leerlo directamente de la query:
      // const returnTo = route.query.returnTo as string;
      // if (returnTo) router.push(returnTo);
      // else router.go(-1);
    };
    const params: any = computed(() => {
      const params: any = {};

      // const date: any = calculateFilterDate();

      // if (date.dateSince) {
      //   params.fecIni = date.dateSince;
      // }

      // if (date.dateUntil) {
      //   params.fecFin = date.dateUntil;
      // }

      params.userId = userId.value;
      params.courseId = courseId.value;
      params.periodId = periodId.value;

      return params;
    });

    watch(periodId, async () => {
      await getActivities();
    });
    watch(courseId, async () => {
      await getActivities();
    });
    watch(filter, async () => {
      await getActivities();
    });

    const updateStudentUserId = async (studentUserId: any) => {
      loading.value = true;
      console.log('studentUserId', studentUserId);

      {
        // courseId.value = parseInt(route.query.courseId as string, 10);
        courseId.value = tabsStore.activities.params?.courseId;
      }
      {
        periodId.value = tabsStore.activities.params?.academicPeriodGroupId;
      }
      if (studentUserId) {
        userId.value = studentUserId as number;
      }

      if (userId.value) {
        const params = { userId: userId.value as number };

        relatedData.value = await getRelatedDataHomeStudentService.run(params);
      } else {
        relatedData.value = await getRelatedDataHomeStudentService.run();
      }

      await getActivities();
      tabsStore.persistState();
      loading.value = false;
    };

    // const calculateFilterDate = () => {
    //   const filterC = filter.value;
    //   const currentDate = dayjs();

    //   let weekStart = currentDate.clone().startOf('isoWeek');
    //   let weekEnd = currentDate.clone().endOf('isoWeek').subtract(1, 'day');

    //   if (filterC === 0) {
    //     return {
    //       dateSince: weekStart.toISOString().split('T')[0],
    //       dateUntil: weekEnd.toISOString().split('T')[0],
    //     };
    //   } else if (filterC >= 1 && filterC <= 2) {
    //     weekStart = weekStart.subtract(filterC, 'week');
    //     weekEnd = weekEnd.subtract(filterC, 'week');
    //     weekEnd.subtract(1, 'day');

    //     return {
    //       dateSince: weekStart.toISOString().split('T')[0],
    //       dateUntil: weekEnd.toISOString().split('T')[0],
    //     };
    //   } else if (filterC < 0) {
    //     weekStart = weekStart.add(Math.abs(filterC), 'week');
    //     weekEnd = weekEnd.add(Math.abs(filterC), 'week');

    //     return {
    //       dateSince: weekStart.toISOString().split('T')[0],
    //       dateUntil: weekEnd.toISOString().split('T')[0],
    //     };
    //   }

    //   return {
    //     dateSince: null,
    //     dateUntil: null,
    //   };
    // };

    const getActivities = async () => {
      try {
        tabsStore.activities.params.courseId = courseId.value;
        tabsStore.activities.params.academicPeriodGroupId = periodId.value;

        const response = await getStudentActivitiesService.run(params.value);
        activitiesStudent.value = response;

        tabsStore.persistState();
      } catch (e) {
        console.log(e);
      }
    };

    const changeFilter = async () => {
      await getActivities();
    };

    const downloadFile = (urlFile: string) => {
      fetch(urlFile)
        .then((response) => response.blob())
        .then((blob) => {
          const extension = mimeTypesConstant[blob.type];
          const time = new Date().getTime();

          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;

          link.setAttribute('download', `file_${time}.${extension}`);
          document.body.appendChild(link);

          link.click();
          document.body.removeChild(link);
        });
    };

    const openActivitySummaryModal = (activity: any) => {
      currentActivity.value = activity;
      activitySummaryModal.value = true;
    };

    return {
      subtitle,
      routes,
      title,
      t,

      activitySummaryModal,
      currentActivity,
      relatedData,
      activitiesStudent,
      notFound,
      courseId,
      periodId,
      loading,
      filter,
      // medals,

      openActivitySummaryModal,
      updateStudentUserId,
      downloadFile,
      changeFilter,
      goBack,
      dayjs,
    };
  },
});
</script>

<style scoped>
.content-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.content-icon {
  width: 100px;
  height: 100px;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
}
.contentIconFinalPeriod {
  width: 60px;
  height: 60px;
}
.gridFinalPeriod {
  display: grid;
  gap: 1rem;

  width: 300px;
}
.contentFilter div {
  background: #fff;
  margin-right: 1rem;
  padding: 0.3rem 1rem;
  border-radius: 28px;
  cursor: pointer;
}

.fs-8 {
  font-size: 0.8rem;
}
.fs-7 {
  font-size: 0.9rem;
}

.fw-bolder {
  font-weight: 600 !important;
}
.focus {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.focus:hover {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.pointer {
  cursor: pointer;
}
@media (max-width: 650px) {
  .grid-cards {
    padding-bottom: 3rem;
  }
}
.under__line {
  border-bottom: 1px solid;
  border-radius: 0px 0px 4px 4px;
}

.under__line::first-letter {
  text-transform: uppercase;
}
@media (max-width: 750px) {
  .containerAcordeon {
    flex-direction: column;
  }
}
</style>
