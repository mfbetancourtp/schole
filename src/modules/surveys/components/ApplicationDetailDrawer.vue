<template>
  <AppDrawer :isVisible="isVisible" size="xl" @update:isVisible="$emit('update:isVisible', $event)">
    <template #head>
      <div class="applicationDetailDrawer__drawerHead" v-if="application">
        <div class="applicationDetailDrawer__drawerHeadMain">
          <div class="applicationDetailDrawer__avatar">
            {{ applicationInitials }}
          </div>

          <div class="applicationDetailDrawer__drawerHeadContent">
            <h2 class="applicationDetailDrawer__drawerHeadTitle">
              {{ application.fullName }}
            </h2>
            <p class="applicationDetailDrawer__drawerHeadSubtitle">{{ application.document }} · {{ application.program }}</p>

            <div class="applicationDetailDrawer__drawerHeadMeta">
              <AppBadge :label="getApplicationStatusLabel(application.status)" :variant="getApplicationStatusVariant(application.status)" />
              <AppBadge :label="getApplicationStudentTypeLabel(application.studentType)" :variant="getApplicationStudentTypeVariant(application.studentType)" />
              <AppBadge :label="application.academicPeriod" variant="ghost" />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="applicationDetailDrawer__drawerHead">
        <div class="applicationDetailDrawer__drawerHeadMain">
          <div class="applicationDetailDrawer__avatar">P</div>

          <div class="applicationDetailDrawer__drawerHeadContent">
            <h2 class="applicationDetailDrawer__drawerHeadTitle">Detalle del postulante</h2>
            <p class="applicationDetailDrawer__drawerHeadSubtitle">Revisa el progreso completo del postulante</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="application" class="applicationDetailDrawer">
        <div class="applicationDetailDrawer__quickStats">
          <div v-for="stat in quickStats" :key="stat.label" class="applicationDetailDrawer__quickStat">
            <p class="applicationDetailDrawer__quickStatLabel">
              {{ stat.label }}
            </p>
            <strong class="applicationDetailDrawer__quickStatValue">{{ stat.value }}</strong>
            <span class="applicationDetailDrawer__quickStatCaption">{{ stat.caption }}</span>
          </div>
        </div>

        <div class="applicationDetailDrawer__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="applicationDetailDrawer__tab"
            :class="{
              'applicationDetailDrawer__tab--active': activeTab === tab.id,
            }"
            @click="activeTab = tab.id"
          >
            <AppIcon :icon="tab.icon" class="me-2" />
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'info'" class="applicationDetailDrawer__panel">
          <div class="applicationDetailDrawer__sectionBanner applicationDetailDrawer__sectionBanner--slate">
            <div>
              <h4>Información personal</h4>
              <p>Consulta los datos básicos y académicos del postulante tal como aparecen en su registro.</p>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-12 col-xl-6">
              <AppCard>
                <template #title>Datos personales</template>
                <template #body>
                  <div class="applicationDetailDrawer__infoGrid">
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Nombre completo</span>
                      <span class="applicationDetailDrawer__infoValue">{{ application.fullName }}</span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Documento</span>
                      <span class="applicationDetailDrawer__infoValue">
                        <AppIcon icon="id-card" class="me-2" />
                        {{ application.document }}
                      </span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Correo electrónico</span>
                      <span class="applicationDetailDrawer__infoValue">
                        <AppIcon icon="envelope" class="me-2" />
                        {{ application.email }}
                      </span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Teléfono</span>
                      <span class="applicationDetailDrawer__infoValue">
                        <AppIcon icon="phone" class="me-2" />
                        {{ application.phone }}
                      </span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Fecha de nacimiento</span>
                      <span class="applicationDetailDrawer__infoValue">
                        <AppIcon icon="calendar-alt" class="me-2" />
                        {{ formatDate(application.birthDate) }}
                      </span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Ciudad</span>
                      <span class="applicationDetailDrawer__infoValue">
                        <AppIcon icon="map-marker-alt" class="me-2" />
                        {{ application.city }}
                      </span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem applicationDetailDrawer__infoItem--full">
                      <span class="applicationDetailDrawer__infoLabel">Dirección</span>
                      <span class="applicationDetailDrawer__infoValue">{{ application.address }}</span>
                    </div>
                  </div>
                </template>
              </AppCard>
            </div>

            <div class="col-12 col-xl-6">
              <AppCard>
                <template #title>Datos académicos</template>
                <template #body>
                  <div class="applicationDetailDrawer__infoGrid">
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Programa</span>
                      <span class="applicationDetailDrawer__infoValue">
                        <AppIcon icon="graduation-cap" class="me-2" />
                        {{ application.program }}
                      </span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Periodo académico</span>
                      <span class="applicationDetailDrawer__infoValue">{{ application.academicPeriod }}</span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Colegio de procedencia</span>
                      <span class="applicationDetailDrawer__infoValue">{{ application.school }}</span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Año de egreso</span>
                      <span class="applicationDetailDrawer__infoValue">{{ application.graduationYear }}</span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Promedio general</span>
                      <span class="applicationDetailDrawer__infoValue">{{ application.average }}</span>
                    </div>
                    <div class="applicationDetailDrawer__infoItem">
                      <span class="applicationDetailDrawer__infoLabel">Tipo de estudiante</span>
                      <AppBadge :label="getApplicationStudentTypeLabel(application.studentType)" :variant="getApplicationStudentTypeVariant(application.studentType)" />
                    </div>
                  </div>
                </template>
              </AppCard>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'process'" class="applicationDetailDrawer__panel">
          <div class="applicationDetailDrawer__hero">
            <div>
              <p class="applicationDetailDrawer__eyebrow">Proceso de admisión</p>
              <h4 class="applicationDetailDrawer__heroTitle">
                {{ application.process }}
              </h4>
              <p class="applicationDetailDrawer__heroText">
                Registrado el
                {{ formatDate(application.registrationDate) }} para el periodo {{ application.academicPeriod }}.
              </p>
            </div>

            <div class="applicationDetailDrawer__heroBadges">
              <AppBadge :label="getApplicationStatusLabel(application.status)" :variant="getApplicationStatusVariant(application.status)" />
              <AppBadge :label="`${completedWorkflowSteps}/${application.workflowSteps.length} pasos`" variant="ghost" />
            </div>
          </div>

          <AppCard>
            <template #title>Estado actual del proceso</template>
            <template #body>
              <div class="applicationDetailDrawer__progressHeader">
                <span>Avance general</span>
                <strong>{{ application.progress }}%</strong>
              </div>
              <div class="applicationDetailDrawer__progressTrack">
                <div class="applicationDetailDrawer__progressFill" :class="progressClass" :style="{ width: `${application.progress}%` }"></div>
              </div>
              <p class="applicationDetailDrawer__progressCaption">El postulante ha completado {{ application.progress }}% del proceso de admisión.</p>
            </template>
          </AppCard>

          <div class="row g-3 mt-1">
            <div class="col-12 col-md-4">
              <AppStatCard label="Pasos completados" :value="`${completedWorkflowSteps}/${application.workflowSteps.length}`" caption="Workflow configurado" icon="check-circle" variant="green" />
            </div>
            <div class="col-12 col-md-4">
              <AppStatCard label="Días transcurridos" :value="application.elapsedDays" caption="Desde el registro" icon="clock" variant="blue" />
            </div>
            <div class="col-12 col-md-4">
              <AppStatCard label="Días restantes" :value="application.remainingDays" caption="Para cierre del proceso" icon="calendar-alt" variant="yellow" />
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'workflow'" class="applicationDetailDrawer__panel">
          <div class="applicationDetailDrawer__sectionBanner applicationDetailDrawer__sectionBanner--purple">
            <div>
              <h4>Timeline del workflow</h4>
              <p>Progreso de los pasos configurados dentro del proceso de admisión.</p>
            </div>
          </div>

          <AppCard>
            <template #title>Timeline del workflow</template>
            <template #body>
              <p class="applicationDetailDrawer__sectionHint">Consulta el avance de cada paso del proceso de admisión del aspirante.</p>

              <div v-if="application.workflowSteps.length" class="applicationDetailDrawer__timeline">
                <div v-for="step in application.workflowSteps" :key="step.id" class="applicationDetailDrawer__timelineItem">
                  <div class="applicationDetailDrawer__timelineDot" :class="`applicationDetailDrawer__timelineDot--${step.estado}`"></div>

                  <div class="applicationDetailDrawer__timelineCard">
                    <div class="applicationDetailDrawer__timelineHead">
                      <div class="applicationDetailDrawer__timelineMain">
                        <div class="applicationDetailDrawer__timelineTypeIcon" :class="`applicationDetailDrawer__timelineTypeIcon--${step.estado}`">
                          <AppIcon :icon="getWorkflowTypeIcon(step.tipo)" />
                        </div>

                        <div>
                          <p class="applicationDetailDrawer__timelineType">
                            {{ step.tipo }}
                          </p>
                          <h5 class="applicationDetailDrawer__timelineTitle">
                            {{ step.nombre }}
                          </h5>
                        </div>
                      </div>

                      <AppBadge :label="getApplicationWorkflowStatusLabel(step.estado)" :variant="getApplicationWorkflowStatusVariant(step.estado)" />
                    </div>

                    <p class="applicationDetailDrawer__timelineDescription">
                      {{ step.descripcion }}
                    </p>

                    <span v-if="step.fecha" class="applicationDetailDrawer__timelineDate">
                      <AppIcon icon="calendar-alt" class="me-2" />
                      {{ step.fecha }}
                    </span>
                  </div>
                </div>
              </div>

              <AppEmptyResponse v-else />
            </template>
          </AppCard>
        </div>

        <div v-else-if="activeTab === 'payments'" class="applicationDetailDrawer__panel">
          <div class="applicationDetailDrawer__sectionBanner applicationDetailDrawer__sectionBanner--green">
            <div>
              <h4>Estado de pagos</h4>
              <p>Gestiona los conceptos cobrados y consulta el saldo pendiente del postulante.</p>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-12 col-md-6">
              <AppStatCard label="Total pagado" :value="formatCurrency(totalPaid)" caption="Conceptos confirmados" icon="dollar-sign" variant="green" />
            </div>
            <div class="col-12 col-md-6">
              <AppStatCard label="Saldo pendiente" :value="formatCurrency(totalPending)" caption="Conceptos por recaudar" icon="clock" variant="yellow" />
            </div>
          </div>

          <div v-if="application.payments.length" class="applicationDetailDrawer__list">
            <AppCard v-for="payment in application.payments" :key="payment.id">
              <template #body>
                <div class="applicationDetailDrawer__listCardHead">
                  <div class="applicationDetailDrawer__listCardMain">
                    <div class="applicationDetailDrawer__listCardIcon" :class="`applicationDetailDrawer__listCardIcon--${payment.estado}`">
                      <AppIcon icon="dollar-sign" />
                    </div>

                    <div>
                      <h5 class="applicationDetailDrawer__listCardTitle">
                        {{ payment.concepto }}
                      </h5>
                      <p class="applicationDetailDrawer__listCardMeta">
                        {{ payment.fecha ? `Registrado el ${payment.fecha}` : 'Pendiente de pago' }}
                      </p>
                      <p v-if="payment.metodoPago" class="applicationDetailDrawer__listCardMeta">Método: {{ payment.metodoPago }}</p>
                    </div>
                  </div>

                  <div class="applicationDetailDrawer__listCardAside">
                    <strong>{{ formatCurrency(payment.monto) }}</strong>
                    <AppBadge :label="getApplicationPaymentStatusLabel(payment.estado)" :variant="getApplicationPaymentStatusVariant(payment.estado)" />
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <AppEmptyResponse v-else />
        </div>

        <div v-else-if="activeTab === 'documents'" class="applicationDetailDrawer__panel">
          <div class="applicationDetailDrawer__sectionBanner applicationDetailDrawer__sectionBanner--blue">
            <div>
              <h4>Documentos y adjuntos</h4>
              <p>Archivos cargados por el postulante y estado de validación administrativa.</p>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-12 col-md-4">
              <AppStatCard label="Aprobados" :value="approvedDocuments" caption="Documentos validados" icon="check-circle" variant="green" />
            </div>
            <div class="col-12 col-md-4">
              <AppStatCard label="Pendientes" :value="pendingDocuments" caption="Documentos por revisar" icon="clock" variant="yellow" />
            </div>
            <div class="col-12 col-md-4">
              <AppStatCard label="Rechazados" :value="rejectedDocuments" caption="Documentos con observación" icon="times-circle" variant="red" />
            </div>
          </div>

          <div v-if="application.documents.length" class="applicationDetailDrawer__list">
            <AppCard v-for="document in application.documents" :key="document.id">
              <template #body>
                <div class="applicationDetailDrawer__listCardHead">
                  <div class="applicationDetailDrawer__listCardMain">
                    <div class="applicationDetailDrawer__listCardIcon" :class="`applicationDetailDrawer__listCardIcon--${document.estado}`">
                      <AppIcon icon="paperclip" />
                    </div>

                    <div>
                      <h5 class="applicationDetailDrawer__listCardTitle">
                        {{ document.nombre }}
                      </h5>
                      <p class="applicationDetailDrawer__listCardMeta">
                        {{ document.tipo }}
                      </p>
                      <p class="applicationDetailDrawer__listCardMeta">
                        Cargado el {{ document.fechaCarga }} ·
                        {{ document.tamano }}
                      </p>
                    </div>
                  </div>

                  <div class="applicationDetailDrawer__documentActions">
                    <AppBadge :label="getApplicationDocumentStatusLabel(document.estado)" :variant="getApplicationDocumentStatusVariant(document.estado)" />

                    <div class="applicationDetailDrawer__iconActions">
                      <AppButton outlined icon="eye" v-tooltip="'Vista previa'" @click="noop" />
                      <AppButton outlined icon="download" v-tooltip="'Descargar'" @click="noop" />
                    </div>
                  </div>
                </div>
              </template>
            </AppCard>
          </div>

          <AppEmptyResponse v-else />
        </div>

        <div v-else class="applicationDetailDrawer__panel">
          <div class="applicationDetailDrawer__sectionBanner applicationDetailDrawer__sectionBanner--amber">
            <div>
              <h4>Resultado del proceso</h4>
              <p>Resumen de la decisión actual y actividad reciente relacionada con la postulación.</p>
            </div>
          </div>

          <AppCard>
            <template #title>Resultado del proceso</template>
            <template #body>
              <div class="applicationDetailDrawer__resultHero">
                <div>
                  <p class="applicationDetailDrawer__eyebrow">Decisión actual</p>
                  <h4 class="applicationDetailDrawer__heroTitle">
                    {{ application.result.decision }}
                  </h4>
                  <p class="applicationDetailDrawer__heroText">
                    {{ application.result.summary }}
                  </p>
                </div>

                <AppBadge :label="getApplicationStatusLabel(application.status)" :variant="getApplicationStatusVariant(application.status)" />
              </div>

              <div v-if="application.result.finalDate" class="applicationDetailDrawer__resultDate">
                <AppIcon icon="calendar-alt" class="me-2" />
                Fecha de decisión:
                {{ formatDate(application.result.finalDate) }}
              </div>

              <div class="applicationDetailDrawer__observations">
                <h5>Observaciones</h5>
                <ul>
                  <li v-for="observation in application.result.observations" :key="observation">
                    {{ observation }}
                  </li>
                </ul>
              </div>
            </template>
          </AppCard>

          <AppCard>
            <template #title>Actividad reciente</template>
            <template #body>
              <div v-if="application.recentActivities.length" class="applicationDetailDrawer__activityList">
                <div v-for="activity in application.recentActivities" :key="activity.id" class="applicationDetailDrawer__activityItem">
                  <div class="applicationDetailDrawer__activityIcon">
                    <AppIcon :icon="getActivityIcon(activity.type)" />
                  </div>

                  <div class="applicationDetailDrawer__activityContent">
                    <h5>{{ activity.title }}</h5>
                    <p>{{ activity.description }}</p>
                    <span>{{ activity.date }}</span>
                  </div>
                </div>
              </div>

              <AppEmptyResponse v-else />
            </template>
          </AppCard>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="applicationDetailDrawer__footer">
        <AppButton variant="ghost" @click="$emit('update:isVisible', false)">Cerrar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

import type {
  Application,
  ApplicationDocumentStatus,
  ApplicationPaymentStatus,
  ApplicationRecentActivityType,
  ApplicationStatus,
  ApplicationStudentType,
  ApplicationWorkflowStepStatus,
} from '../dtos/application.dto';

type DrawerTabId = 'info' | 'process' | 'workflow' | 'payments' | 'documents' | 'result';

const applicationStatusLabelMap: Record<ApplicationStatus, string> = {
  interesado: 'Interesado',
  postulante: 'Postulante',
  ingresante: 'Ingresante',
  matriculado: 'Matriculado',
  en_proceso: 'En proceso',
  admitido: 'Admitido',
  rechazado: 'Rechazado',
  en_espera: 'En espera',
  retirado: 'Retirado',
};

const applicationStatusVariantMap: Record<ApplicationStatus, 'ghost' | 'primary-20' | 'success' | 'danger' | 'warning' | 'dark'> = {
  interesado: 'ghost',
  postulante: 'ghost',
  ingresante: 'primary-20',
  matriculado: 'success',
  en_proceso: 'primary-20',
  admitido: 'success',
  rechazado: 'danger',
  en_espera: 'warning',
  retirado: 'dark',
};

const studentTypeVariantMap: Record<ApplicationStudentType, 'success' | 'primary-20'> = {
  nuevo: 'success',
  antiguo: 'primary-20',
};

const workflowStatusLabelMap: Record<ApplicationWorkflowStepStatus, string> = {
  completado: 'Completado',
  en_curso: 'En curso',
  pendiente: 'Pendiente',
};

const workflowStatusVariantMap: Record<ApplicationWorkflowStepStatus, 'success' | 'primary-20' | 'ghost'> = {
  completado: 'success',
  en_curso: 'primary-20',
  pendiente: 'ghost',
};

const paymentStatusLabelMap: Record<ApplicationPaymentStatus, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
};

const paymentStatusVariantMap: Record<ApplicationPaymentStatus, 'success' | 'warning' | 'danger'> = {
  pagado: 'success',
  pendiente: 'warning',
  vencido: 'danger',
};

const documentStatusLabelMap: Record<ApplicationDocumentStatus, string> = {
  aprobado: 'Aprobado',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
};

const documentStatusVariantMap: Record<ApplicationDocumentStatus, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'danger',
};

const getApplicationStatusLabel = (status: ApplicationStatus) => applicationStatusLabelMap[status];
const getApplicationStatusVariant = (status: ApplicationStatus) => applicationStatusVariantMap[status];
const getApplicationStudentTypeLabel = (studentType: ApplicationStudentType) => (studentType === 'nuevo' ? 'Nuevo' : 'Antiguo');
const getApplicationStudentTypeVariant = (studentType: ApplicationStudentType) => studentTypeVariantMap[studentType];
const getApplicationWorkflowStatusLabel = (status: ApplicationWorkflowStepStatus) => workflowStatusLabelMap[status];
const getApplicationWorkflowStatusVariant = (status: ApplicationWorkflowStepStatus) => workflowStatusVariantMap[status];
const getApplicationPaymentStatusLabel = (status: ApplicationPaymentStatus) => paymentStatusLabelMap[status];
const getApplicationPaymentStatusVariant = (status: ApplicationPaymentStatus) => paymentStatusVariantMap[status];
const getApplicationDocumentStatusLabel = (status: ApplicationDocumentStatus) => documentStatusLabelMap[status];
const getApplicationDocumentStatusVariant = (status: ApplicationDocumentStatus) => documentStatusVariantMap[status];

export default defineComponent({
  name: 'ApplicationDetailDrawer',
  components: {
    AppBadge,
    AppButton,
    AppCard,
    AppStatCard,
    AppDrawer,
    AppEmptyResponse,
    AppIcon,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    application: {
      type: Object as PropType<Application | null>,
      default: null,
    },
  },
  emits: ['update:isVisible'],
  setup(props) {
    const activeTab = ref<DrawerTabId>('info');
    const tabs = [
      { id: 'info' as DrawerTabId, label: 'Información', icon: 'user' },
      {
        id: 'process' as DrawerTabId,
        label: 'Proceso',
        icon: 'graduation-cap',
      },
      { id: 'workflow' as DrawerTabId, label: 'Workflow', icon: 'sitemap' },
      { id: 'payments' as DrawerTabId, label: 'Pagos', icon: 'dollar-sign' },
      {
        id: 'documents' as DrawerTabId,
        label: 'Documentos',
        icon: 'paperclip',
      },
      { id: 'result' as DrawerTabId, label: 'Resultado', icon: 'award' },
    ];

    watch(
      () => props.application,
      () => {
        activeTab.value = 'info';
      }
    );

    const applicationInitials = computed(() => {
      if (!props.application?.fullName) return 'P';

      return props.application.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    });

    const completedWorkflowSteps = computed(() => props.application?.workflowSteps?.filter((step) => step.estado === 'completado').length ?? 0);
    const approvedDocuments = computed(() => props.application?.documents?.filter((document) => document.estado === 'aprobado').length ?? 0);
    const pendingDocuments = computed(() => props.application?.documents?.filter((document) => document.estado === 'pendiente').length ?? 0);
    const rejectedDocuments = computed(() => props.application?.documents?.filter((document) => document.estado === 'rechazado').length ?? 0);
    const totalPaid = computed(() => props.application?.payments?.filter((payment) => payment.estado === 'pagado').reduce((sum, payment) => sum + payment.monto, 0) ?? 0);
    const totalPending = computed(() => props.application?.payments?.filter((payment) => payment.estado !== 'pagado').reduce((sum, payment) => sum + payment.monto, 0) ?? 0);

    const quickStats = computed(() => {
      if (!props.application) return [];

      return [
        {
          label: 'Tipo de estudiante',
          value: getApplicationStudentTypeLabel(props.application.studentType),
          caption: props.application.process,
        },
        {
          label: 'Progreso',
          value: `${props.application.progress}%`,
          caption: `${completedWorkflowSteps.value}/${props.application.workflowSteps?.length ?? 0} pasos completados`,
        },
        {
          label: 'Última actividad',
          value: props.application.lastActivity,
          caption: getApplicationStatusLabel(props.application.status),
        },
      ];
    });

    const progressClass = computed(() => {
      const progress = props.application?.progress ?? 0;

      if (progress >= 85) return 'applicationDetailDrawer__progressFill--success';
      if (progress >= 45) return 'applicationDetailDrawer__progressFill--warning';

      return 'applicationDetailDrawer__progressFill--danger';
    });

    const getActivityIcon = (type: ApplicationRecentActivityType) => {
      switch (type) {
        case 'documento':
          return 'paperclip';
        case 'pago':
          return 'dollar-sign';
        case 'resultado':
          return 'award';
        default:
          return 'sitemap';
      }
    };

    const getWorkflowTypeIcon = (type: string) => {
      const normalizedType = type.toLowerCase();

      if (normalizedType.includes('cobro') || normalizedType.includes('pago')) return 'dollar-sign';
      if (normalizedType.includes('adjunto')) return 'paperclip';
      if (normalizedType.includes('documento') || normalizedType.includes('formulario')) return 'file-alt';
      if (normalizedType.includes('examen') || normalizedType.includes('resultado')) return 'award';

      return 'sitemap';
    };

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value);

    const formatDate = (value?: string) => {
      if (!value) return '—';

      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));
    };

    const noop = () => undefined;

    return {
      activeTab,
      tabs,
      applicationInitials,
      quickStats,
      completedWorkflowSteps,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
      totalPaid,
      totalPending,
      progressClass,
      getActivityIcon,
      getWorkflowTypeIcon,
      getApplicationDocumentStatusLabel,
      getApplicationDocumentStatusVariant,
      getApplicationPaymentStatusLabel,
      getApplicationPaymentStatusVariant,
      getApplicationStatusLabel,
      getApplicationStatusVariant,
      getApplicationStudentTypeLabel,
      getApplicationStudentTypeVariant,
      getApplicationWorkflowStatusLabel,
      getApplicationWorkflowStatusVariant,
      formatCurrency,
      formatDate,
      noop,
    };
  },
});
</script>

<style scoped>
:deep(.drawer-head) {
  align-items: flex-start;
  padding: 1.4rem 1.5rem;
  background: linear-gradient(135deg, #4338ca, #6d28d9);
}

:deep(.drawer-body) {
  background: #f8fafc;
}

:deep(.drawer-footer) {
  background: #ffffff;
}

:deep(.icon-close) {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.applicationDetailDrawer__drawerHead {
  width: 100%;
}

.applicationDetailDrawer__drawerHeadMain {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.applicationDetailDrawer__avatar {
  width: 3.6rem;
  height: 3.6rem;
  min-width: 3.6rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.applicationDetailDrawer__drawerHeadContent {
  min-width: 0;
}

.applicationDetailDrawer__drawerHeadTitle {
  margin: 0;
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 700;
}

.applicationDetailDrawer__drawerHeadSubtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.95rem;
}

.applicationDetailDrawer__drawerHeadMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.applicationDetailDrawer {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100%;
}

.applicationDetailDrawer__quickStats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem 1.1rem;
  margin-bottom: 1.25rem;
}

.applicationDetailDrawer__quickStat {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
}

.applicationDetailDrawer__quickStatLabel {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.applicationDetailDrawer__quickStatValue {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
}

.applicationDetailDrawer__quickStatCaption {
  color: #64748b;
  font-size: 0.83rem;
  line-height: 1.35;
}

.applicationDetailDrawer__tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  padding: 0 0.35rem;
}

.applicationDetailDrawer__tab {
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #475569;
  border-radius: 0;
  padding: 0.95rem 1rem 0.85rem;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.applicationDetailDrawer__tab--active {
  border-bottom-color: #2563eb;
  background: rgba(37, 99, 235, 0.03);
  color: #1d4ed8;
}

.applicationDetailDrawer__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailDrawer__sectionBanner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 18px;
  padding: 1rem 1.15rem;
  border: 1px solid transparent;
}

.applicationDetailDrawer__sectionBanner h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.applicationDetailDrawer__sectionBanner p {
  margin: 0.3rem 0 0;
  color: #64748b;
  line-height: 1.45;
}

.applicationDetailDrawer__sectionBanner--slate {
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  border-color: #e2e8f0;
}

.applicationDetailDrawer__sectionBanner--purple {
  background: linear-gradient(135deg, #faf5ff, #eef2ff);
  border-color: #ddd6fe;
}

.applicationDetailDrawer__sectionBanner--green {
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border-color: #bbf7d0;
}

.applicationDetailDrawer__sectionBanner--blue {
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border-color: #bfdbfe;
}

.applicationDetailDrawer__sectionBanner--amber {
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
  border-color: #fde68a;
}

.applicationDetailDrawer__infoGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.applicationDetailDrawer__infoItem {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.applicationDetailDrawer__infoItem--full {
  grid-column: 1 / -1;
}

.applicationDetailDrawer__infoLabel {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.applicationDetailDrawer__infoValue {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  color: #0f172a;
  font-weight: 500;
  line-height: 1.45;
}

.applicationDetailDrawer__hero,
.applicationDetailDrawer__resultHero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #bfdbfe;
  background: linear-gradient(135deg, #eff6ff, #e0e7ff);
  border-radius: 18px;
  padding: 1.15rem 1.25rem;
}

.applicationDetailDrawer__heroBadges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.applicationDetailDrawer__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #1d4ed8;
}

.applicationDetailDrawer__heroTitle {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.applicationDetailDrawer__heroText {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.5;
}

.applicationDetailDrawer__progressHeader {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.applicationDetailDrawer__progressTrack {
  width: 100%;
  height: 0.85rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.applicationDetailDrawer__progressFill {
  height: 100%;
  border-radius: inherit;
}

.applicationDetailDrawer__progressFill--success {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.applicationDetailDrawer__progressFill--warning {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.applicationDetailDrawer__progressFill--danger {
  background: linear-gradient(90deg, #fb7185, #ef4444);
}

.applicationDetailDrawer__progressCaption,
.applicationDetailDrawer__sectionHint {
  margin: 0;
  color: #64748b;
  line-height: 1.45;
}

.applicationDetailDrawer__timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailDrawer__timelineItem {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: stretch;
}

.applicationDetailDrawer__timelineDot {
  width: 14px;
  min-width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: 1.1rem;
}

.applicationDetailDrawer__timelineDot--completado {
  background: #22c55e;
}

.applicationDetailDrawer__timelineDot--en_curso {
  background: #3b82f6;
}

.applicationDetailDrawer__timelineDot--pendiente {
  background: #cbd5e1;
}

.applicationDetailDrawer__timelineCard {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 1rem 1.1rem;
}

.applicationDetailDrawer__timelineHead,
.applicationDetailDrawer__listCardHead,
.applicationDetailDrawer__activityItem {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.applicationDetailDrawer__timelineMain,
.applicationDetailDrawer__listCardMain {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  min-width: 0;
}

.applicationDetailDrawer__timelineTypeIcon,
.applicationDetailDrawer__listCardIcon {
  width: 2.4rem;
  height: 2.4rem;
  min-width: 2.4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.applicationDetailDrawer__timelineTypeIcon--completado,
.applicationDetailDrawer__listCardIcon--pagado,
.applicationDetailDrawer__listCardIcon--aprobado {
  background: #dcfce7;
  color: #16a34a;
}

.applicationDetailDrawer__timelineTypeIcon--en_curso,
.applicationDetailDrawer__listCardIcon--pendiente {
  background: #dbeafe;
  color: #2563eb;
}

.applicationDetailDrawer__timelineTypeIcon--pendiente {
  background: #f1f5f9;
  color: #94a3b8;
}

.applicationDetailDrawer__listCardIcon--vencido,
.applicationDetailDrawer__listCardIcon--rechazado {
  background: #fee2e2;
  color: #dc2626;
}

.applicationDetailDrawer__timelineType {
  margin: 0 0 0.2rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.applicationDetailDrawer__timelineTitle,
.applicationDetailDrawer__listCardTitle,
.applicationDetailDrawer__activityContent h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.applicationDetailDrawer__timelineDescription,
.applicationDetailDrawer__listCardMeta,
.applicationDetailDrawer__activityContent p {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.45;
}

.applicationDetailDrawer__timelineDate,
.applicationDetailDrawer__activityContent span {
  display: inline-flex;
  align-items: center;
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: #64748b;
}

.applicationDetailDrawer__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailDrawer__listCardAside,
.applicationDetailDrawer__documentActions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  text-align: right;
}

.applicationDetailDrawer__iconActions {
  display: flex;
  gap: 0.4rem;
}

.applicationDetailDrawer__resultDate {
  display: inline-flex;
  align-items: center;
  color: #475569;
  font-weight: 500;
}

.applicationDetailDrawer__observations h5 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.applicationDetailDrawer__observations ul {
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
}

.applicationDetailDrawer__observations li + li {
  margin-top: 0.4rem;
}

.applicationDetailDrawer__activityList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailDrawer__activityIcon {
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.applicationDetailDrawer__activityContent {
  flex: 1;
}

.applicationDetailDrawer__footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 992px) {
  .applicationDetailDrawer__quickStats {
    grid-template-columns: 1fr;
  }

  .applicationDetailDrawer__infoGrid {
    grid-template-columns: 1fr;
  }

  .applicationDetailDrawer__hero,
  .applicationDetailDrawer__resultHero,
  .applicationDetailDrawer__timelineHead,
  .applicationDetailDrawer__listCardHead,
  .applicationDetailDrawer__activityItem {
    flex-direction: column;
    align-items: flex-start;
  }

  .applicationDetailDrawer__heroBadges,
  .applicationDetailDrawer__listCardAside,
  .applicationDetailDrawer__documentActions {
    align-items: flex-start;
    text-align: left;
  }
}

@media (max-width: 768px) {
  .applicationDetailDrawer {
    padding: 1rem;
  }

  .applicationDetailDrawer__drawerHeadMain {
    align-items: flex-start;
  }

  .applicationDetailDrawer__tab {
    white-space: nowrap;
  }
}
</style>
