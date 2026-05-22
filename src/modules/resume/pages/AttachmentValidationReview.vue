<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton style="color: white" type="button" outlined @click="closeDetail">Volver al listado</AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="attachmentValidationPage">
        <div class="detailPage">
          <AppLoading v-if="detailLoading" />

          <template v-else-if="cvDetail">
            <div class="detailHero">
              <div class="detailHero__main">
                <div class="detailHero__avatar">
                  {{ getInitials(detailFullName) }}
                </div>

                <div class="detailHero__content">
                  <div class="detailHero__heading">
                    <div>
                      <h2 class="detailHero__title">{{ detailFullName }}</h2>
                      <p class="detailHero__subtitle">
                        Identificación
                        {{ displayValue(cvDetail.identification) }} ·
                        {{ displayValue(cvDetail.email) }}
                      </p>
                    </div>

                    <div class="detailHero__badges">
                      <AppBadge :label="reviewRecord?.overallStatus ?? 'Pendiente'" :variant="getStatusVariant(reviewRecord?.status ?? 'pending')" />
                      <AppBadge :label="`${allAllowedDocuments.length} registros visibles`" variant="ghost" />
                    </div>
                  </div>

                  <div class="detailHero__meta">
                    <span>{{ displayValue(cvDetail.mobile) }}</span>
                    <span>{{ displayValue(getLocationLabel(cvDetail.city)) }}</span>
                    <span>{{ displayValue(getLocationLabel(cvDetail.country)) }}</span>
                  </div>
                </div>
              </div>

              <div class="detailStatsGrid">
                <AppStatCard v-for="card in detailStats" :key="card.label" :label="card.label" :value="card.value" :caption="card.caption" :variant="card.variant" />
              </div>
            </div>

            <AppCard>
              <template #body>
                <div class="cvSectionFilter">
                  <button
                    type="button"
                    class="cvSectionFilter__chip"
                    :class="{
                      'cvSectionFilter__chip--active': !selectedSectionKey,
                    }"
                    @click="changeSection('')"
                  >
                    Todas las secciones
                  </button>

                  <button
                    v-for="option in cvSectionOptions"
                    :key="option.value"
                    type="button"
                    class="cvSectionFilter__chip"
                    :class="{
                      'cvSectionFilter__chip--active': selectedSectionKey === option.value,
                    }"
                    @click="changeSection(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </template>
            </AppCard>

            <div v-if="detailError" class="integrationNotice integrationNotice--error">
              <AppIcon icon="exclamation-circle" />
              <div>
                <strong>No pudimos cargar la hoja de vida</strong>
                <p>{{ detailError }}</p>
              </div>
            </div>

            <div ref="reviewGridRef" class="reviewGrid">
              <div ref="reviewLeftRef" class="reviewLeft">
                <AppCard>
                  <template #title>
                    <div class="reviewTitle">
                      <div class="reviewTitle__icon">
                        <AppIcon icon="address-card" />
                      </div>
                      <div>
                        <h3 class="reviewTitle__main">Datos del docente</h3>
                        <p class="reviewTitle__sub">Información básica para contextualizar la validación.</p>
                      </div>
                    </div>
                  </template>

                  <template #body>
                    <div class="detailGrid">
                      <div class="infoBlock">
                        <label>Nombres</label>
                        <p>{{ displayValue(cvDetail.names) }}</p>
                      </div>

                      <div class="infoBlock">
                        <label>Apellidos</label>
                        <p>{{ displayValue(cvDetail.lastnames) }}</p>
                      </div>

                      <div class="infoBlock">
                        <label>Identificación</label>
                        <p>{{ displayValue(cvDetail.identification) }}</p>
                      </div>

                      <div class="infoBlock">
                        <label>Celular</label>
                        <p>{{ displayValue(cvDetail.mobile) }}</p>
                      </div>

                      <div class="infoBlock">
                        <label>Correo</label>
                        <p>{{ displayValue(cvDetail.email) }}</p>
                      </div>

                      <div class="infoBlock">
                        <label>Ubicación</label>
                        <p>
                          {{ displayValue(buildLocationSummary(cvDetail.city, cvDetail.country)) }}
                        </p>
                      </div>

                      <div class="infoBlock infoBlock--full">
                        <label>Dirección</label>
                        <p>{{ displayValue(cvDetail.direction) }}</p>
                      </div>
                    </div>
                  </template>
                </AppCard>

                <AppCard v-for="section in visibleSections" :key="section.key">
                  <template #title>
                    <div class="sectionCardHead">
                      <div class="sectionCardHead__main">
                        <div class="sectionCardHead__icon">
                          <AppIcon :icon="section.icon" />
                        </div>

                        <div>
                          <h3 class="sectionCardHead__title">
                            {{ section.label }}
                          </h3>
                          <p class="sectionCardHead__subtitle">{{ section.items.length }} registros en esta sección.</p>
                        </div>
                      </div>

                      <div class="sectionCardHead__actions">
                        <AppBadge :label="`${section.items.length} registros`" variant="ghost" />
                        <AppButton type="button" outlined icon="chevron-left" :disabled="section.items.length <= 1" @click="scrollSection(section.key, 'left')" />
                        <AppButton type="button" outlined icon="chevron-right" :disabled="section.items.length <= 1" @click="scrollSection(section.key, 'right')" />
                      </div>
                    </div>
                  </template>

                  <template #body>
                    <Swiper
                      v-if="section.items.length"
                      :key="`carousel-${section.key}-${section.items.length}`"
                      :modules="carouselModules"
                      :slides-per-view="'auto'"
                      :space-between="14"
                      :grab-cursor="section.items.length > 1"
                      :allow-touch-move="section.items.length > 1"
                      :autoplay="
                        section.items.length > 1
                          ? {
                              delay: 3200,
                              disableOnInteraction: false,
                              pauseOnMouseEnter: true,
                            }
                          : false
                      "
                      :loop="section.items.length > 2"
                      :speed="700"
                      :breakpoints="{
                        0: { spaceBetween: 10 },
                        768: { spaceBetween: 14 },
                      }"
                      class="sectionCarousel"
                      @swiper="(swiper) => setCarouselRef(section.key, swiper)"
                    >
                      <SwiperSlide v-for="document in section.items" :key="document.uid" class="sectionCarousel__slide">
                        <article
                          class="documentCard"
                          :class="{
                            'documentCard--active': activeDocument?.uid === document.uid,
                          }"
                          @click="selectDocument(document)"
                        >
                          <div class="documentCard__head">
                            <AppBadge :label="document.documentStatus" :variant="getDocumentStatusVariant(document.documentStatus)" />
                            <span class="documentCard__date">{{ formatDateTime(document.updatedAt || document.createdAt) }}</span>
                          </div>

                          <h4 class="documentCard__title">
                            {{ document.title }}
                          </h4>
                          <p class="documentCard__subtitle">
                            {{ document.subtitle }}
                          </p>

                          <div class="documentCard__meta">
                            <div v-for="meta in document.metadata.slice(0, 4)" :key="`${document.uid}-${meta.label}`" class="documentCard__metaItem">
                              <span>{{ meta.label }}</span>
                              <strong>{{ meta.value }}</strong>
                            </div>
                          </div>

                          <div class="documentCard__footer">
                            <span class="documentCard__footerLabel">Haz clic para revisar el detalle completo</span>

                            <AppButton v-if="document.certificateUrl" type="button" outlined @click.stop="openSupport(document.certificateUrl)" icon="eye"></AppButton>
                          </div>
                        </article>
                      </SwiperSlide>
                    </Swiper>

                    <div v-else class="emptySectionState">
                      <AppIcon icon="folder-open" />
                      <div>
                        <strong>Sin registros cargados</strong>
                        <p>Esta sección todavía no tiene información disponible para validar.</p>
                      </div>
                    </div>
                  </template>
                </AppCard>
              </div>

              <div class="reviewRight">
                <div class="reviewRight__viewerSticky">
                  <AppCard class="reviewRight__viewerCard">
                    <template #title>
                      <div class="documentHeader">
                        <div class="documentHeader__left">
                          <AppIcon icon="file-alt" />
                          <span>{{ activeDocument ? activeDocument.title : 'Selecciona un registro' }}</span>
                        </div>
                      </div>
                    </template>

                    <template #body>
                      <div v-if="activeDocument" class="documentPreview">
                        <div class="documentPreview__summary">
                          <div class="documentPreview__summaryCopy">
                            <p class="documentPreview__section">
                              {{ activeDocument.sectionLabel }}
                            </p>
                            <p class="documentPreview__hint">
                              {{
                                hasActiveDocumentViewer
                                  ? `Soporte ${activeDocumentViewer.extension ? activeDocumentViewer.extension.toUpperCase() : 'adjunto'} listo para revisión.`
                                  : 'Este registro no tiene un soporte adjunto para visualizar.'
                              }}
                            </p>
                          </div>

                          <AppBadge :label="activeDocument.documentStatus" :variant="getDocumentStatusVariant(activeDocument.documentStatus)" />
                        </div>

                        <div v-if="hasActiveDocumentViewer" class="documentViewer documentViewer--loaded">
                          <img v-if="activeDocumentViewer.kind === 'image'" :key="activeDocumentViewer.src" :src="activeDocumentViewer.src" :alt="activeDocument.title" class="documentViewer__image" />
                          <iframe v-else :key="activeDocumentViewer.src" :src="activeDocumentViewer.src" :title="`Soporte de ${activeDocument.title}`"></iframe>
                        </div>

                        <div v-else class="documentViewer documentViewer--empty">
                          <AppIcon icon="file-alt" class="documentMock__icon" />
                          <p class="documentMock__text">Este registro todavía no tiene un soporte disponible para visualización.</p>
                        </div>

                        <div class="documentPreview__actions">
                          <AppButton v-if="hasActiveDocumentViewer" type="button" outlined @click="openPreviewModal">
                            <AppIcon icon="expand" class="me-2" />
                            Expandir
                          </AppButton>

                          <AppButton v-if="activeDocument.certificateUrl" type="button" outlined @click="openSupport(activeDocument.certificateUrl)">
                            <AppIcon icon="eye" class="me-2" />
                            Abrir soporte
                          </AppButton>

                          <AppButton type="button" variant="success" :outlined="false" :disabled="isSubmittingStatus" @click="openApproveModal(activeDocument)">
                            <AppIcon icon="check-circle" class="me-2" />
                            Aprobar
                          </AppButton>

                          <AppButton type="button" variant="danger" :outlined="false" :disabled="isSubmittingStatus" @click="openRejectModal(activeDocument)">
                            <AppIcon icon="times-circle" class="me-2" />
                            Rechazar
                          </AppButton>
                        </div>
                      </div>

                      <div v-else class="documentViewer documentViewer--empty">
                        <AppIcon icon="file-alt" class="documentMock__icon" />
                        <p class="documentMock__text">Selecciona un registro del carrusel para revisar su detalle y actualizar el estado del documento.</p>
                      </div>
                    </template>
                  </AppCard>
                </div>
              </div>
            </div>
          </template>

          <AppCard v-else>
            <template #body>
              <div class="emptySectionState emptySectionState--standalone">
                <AppIcon icon="folder-open" />
                <div>
                  <strong>No hay información disponible</strong>
                  <p>Intenta de nuevo más tarde o vuelve al listado para refrescar la consulta.</p>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
      </div>

      <AppModal v-model="rejectModalVisible" size="lg">
        <AttachmentValidationRejectModal v-if="rejectModalVisible" :target="rejectTarget" :is-submitting-status="isSubmittingStatus" @confirm-reject="confirmReject" />
      </AppModal>

      <AppModal v-model="approveModalVisible">
        <AppConfirmModal v-if="approveModalVisible && approveTarget" entity="soporte" textButton="Aprobar" :textContent="approveModalText" @confirmDelete="confirmApprove" />
      </AppModal>

      <AppModal v-model="previewModalVisible" size="xl">
        <AttachmentValidationPreviewModal
          v-if="previewModalVisible"
          :document="activeDocument"
          :viewer="activeDocumentViewer"
          :has-viewer="hasActiveDocumentViewer"
          :status-variant="activeDocument ? getDocumentStatusVariant(activeDocument.documentStatus) : 'secondary'"
          :is-submitting-status="isSubmittingStatus"
          @open-support="handlePreviewSupport"
          @approve="openApproveModal"
          @reject="openRejectModal"
        />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppConfirmModal from '../../../shared/components/Modal/AppConfirmModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AttachmentValidationPreviewModal from '../components/AttachmentValidationPreviewModal.vue';
import AttachmentValidationRejectModal from '../components/AttachmentValidationRejectModal.vue';

import { useHeaderStore } from '../../../stores/header.store';
import type {
  AttachmentValidationCvSectionKey,
  AttachmentValidationDecisionStatus,
  AttachmentValidationPeopleDetailResponseDto,
  AttachmentValidationRecordDto,
  AttachmentValidationSectionOptionDto,
  AttachmentValidationStatus,
} from '../dtos/attachmentValidation.dto';
import { CreateAttachmentValidationLogService } from '../services/createAttachmentValidationLog.service';
import { GetAttachmentValidationPeopleDetailService } from '../services/getAttachmentValidationPeopleDetail.service';

interface DetailMetaItem {
  label: string;
  value: string;
}

interface DetailDocumentCard {
  uid: string;
  id: number;
  sectionKey: AttachmentValidationCvSectionKey;
  sectionLabel: string;
  title: string;
  subtitle: string;
  documentStatus: string;
  certificateUrl: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  metadata: DetailMetaItem[];
}

interface DetailSectionCard extends AttachmentValidationSectionOptionDto {
  icon: string;
  items: DetailDocumentCard[];
}

const carouselModules = [Autoplay];

const getAttachmentValidationPeopleDetailService = new GetAttachmentValidationPeopleDetailService();
const createAttachmentValidationLogService = new CreateAttachmentValidationLogService();

const cvSectionOptions: AttachmentValidationSectionOptionDto[] = [
  { label: 'Formación académica', value: 'academicBackground' },
  { label: 'Formación complementaria', value: 'supplementaryTraining' },
  { label: 'Experiencia laboral', value: 'workExperience' },
  { label: 'Producción intelectual', value: 'intellectualProduction' },
  { label: 'Eventos académicos', value: 'academicEvents' },
  { label: 'Reconocimientos', value: 'recognition' },
];

const cvSectionIcons: Record<AttachmentValidationCvSectionKey, string> = {
  academicBackground: 'graduation-cap',
  supplementaryTraining: 'certificate',
  workExperience: 'briefcase',
  intellectualProduction: 'book-open',
  academicEvents: 'calendar-alt',
  recognition: 'award',
};

const attachmentValidationRouteNames = {
  list: 'resume.attachmentvalidation',
  review: 'resume.attachmentvalidationReview',
} as const;

const reviewWorkspaceTopOffset = 12;

const defaultStatusLabelMap: Record<AttachmentValidationStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export default defineComponent({
  name: 'AttachmentValidationReviewPage',
  components: {
    AppBaseList,
    AppBadge,
    AppButton,
    AppCard,
    AppStatCard,
    Swiper,
    SwiperSlide,
    AppIcon,
    AppLoading,
    AppConfirmModal,
    AppModal,
    AttachmentValidationPreviewModal,
    AttachmentValidationRejectModal,
  },
  setup() {
    const title = 'Validación de Adjuntos';
    useMeta({ title });
    const route = useRoute();
    const router = useRouter();

    const loading = ref(true);
    const detailLoading = ref(false);
    const detailError = ref('');
    const isSubmittingStatus = ref(false);

    const reviewRecord = ref<AttachmentValidationRecordDto | null>(null);
    const cvDetail = ref<AttachmentValidationPeopleDetailResponseDto | null>(null);

    const selectedSectionKey = ref<AttachmentValidationCvSectionKey | ''>('');
    const activeDocumentUid = ref('');

    const approveModalVisible = ref(false);
    const approveTarget = ref<DetailDocumentCard | null>(null);
    const rejectModalVisible = ref(false);
    const rejectTarget = ref<DetailDocumentCard | null>(null);
    const previewModalVisible = ref(false);

    const carouselRefs = ref<Record<string, any>>({});
    const reviewGridRef = ref<HTMLElement | null>(null);
    const reviewLeftRef = ref<HTMLElement | null>(null);
    const reviewScrollContainerRef = ref<HTMLElement | null>(null);

    const detailFullName = computed(() => {
      if (!cvDetail.value) return reviewRecord.value?.teacherName ?? '';
      return [cvDetail.value.names, cvDetail.value.lastnames].filter(Boolean).join(' ').trim();
    });

    const getStatusVariant = (status: AttachmentValidationStatus) => {
      const variants: Record<AttachmentValidationStatus, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
      };

      return variants[status] || 'secondary';
    };

    const mapLabelToStatus = (value: string): AttachmentValidationStatus => {
      const normalizedValue = normalizeText(value);

      if (normalizedValue.includes('aprob')) {
        return 'approved';
      }

      if (normalizedValue.includes('rechaz')) {
        return 'rejected';
      }

      return 'pending';
    };

    const getDocumentStatusVariant = (value: string) => getStatusVariant(mapLabelToStatus(value));

    const getInitials = (name: string) => {
      if (!name) return 'HV';

      const names = name.split(' ').filter(Boolean).slice(0, 2);

      if (!names.length) {
        return 'HV';
      }

      return names
        .map((value) => value.charAt(0))
        .join('')
        .toUpperCase();
    };

    const formatDate = (date: string) => {
      if (!date) return 'No registra';

      const normalizedDate = date.includes('T') ? date : date.replace(' ', 'T');
      const parsedDate = new Date(normalizedDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const formatDateTime = (date: string) => {
      if (!date) return 'No registra';

      const normalizedDate = date.includes('T') ? date : date.replace(' ', 'T');
      const parsedDate = new Date(normalizedDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const displayValue = (value: string | null | undefined, fallback = 'No registra') => {
      if (value == null) return fallback;

      const trimmedValue = String(value).trim();
      return trimmedValue ? trimmedValue : fallback;
    };

    const getRouteStatus = (value: unknown): AttachmentValidationStatus => {
      const normalizedValue = String(value ?? '').trim();

      if (normalizedValue === 'approved' || normalizedValue === 'rejected') {
        return normalizedValue;
      }

      return 'pending';
    };

    const getRouteSectionKey = (value: unknown): AttachmentValidationCvSectionKey | '' => {
      const sectionKey = String(value ?? '').trim() as AttachmentValidationCvSectionKey;
      return cvSectionOptions.some((option) => option.value === sectionKey) ? sectionKey : '';
    };

    const buildRecordFromRoute = (): AttachmentValidationRecordDto | null => {
      const peopleId = Number(route.params.peopleId);

      if (!Number.isFinite(peopleId) || peopleId <= 0) {
        return null;
      }

      const status = getRouteStatus(route.query.status);
      const teacherName = String(route.query.teacherName ?? '').trim();
      const teacherPosition = String(route.query.teacherPosition ?? '').trim();
      const totalDocuments = Number(route.query.totalDocuments ?? 0);
      const lastUpdate = String(route.query.lastUpdate ?? '').trim();
      const overallStatus = String(route.query.overallStatus ?? defaultStatusLabelMap[status]).trim() || defaultStatusLabelMap[status];

      return {
        id: `attachment-validation-${peopleId}`,
        peopleId,
        fullName: teacherName,
        teacherName,
        teacherPhoto: undefined,
        teacherPosition,
        totalDocuments,
        documentsCount: totalDocuments,
        lastUpdate,
        createdDate: lastUpdate,
        overallStatus,
        status,
        recordTitle: teacherName || `Docente ${peopleId}`,
      };
    };

    const normalizeViewerUrl = (url: string | null | undefined) => {
      if (!url) return '';

      try {
        return url.includes(' ') ? encodeURI(url) : url;
      } catch {
        return url;
      }
    };

    const getFileExtension = (url: string) => {
      const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
      const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
      return match?.[1]?.toLowerCase() ?? '';
    };

    const resolveDocumentViewer = (url: string | null | undefined) => {
      const normalizedUrl = normalizeViewerUrl(url);

      if (!normalizedUrl) {
        return {
          src: '',
          kind: '' as '' | 'iframe' | 'image',
          extension: '',
        };
      }

      const extension = getFileExtension(normalizedUrl);
      const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']);
      const officeExtensions = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);

      if (imageExtensions.has(extension)) {
        return {
          src: normalizedUrl,
          kind: 'image' as const,
          extension,
        };
      }

      if (officeExtensions.has(extension)) {
        return {
          src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(normalizedUrl)}`,
          kind: 'iframe' as const,
          extension,
        };
      }

      return {
        src: normalizedUrl,
        kind: 'iframe' as const,
        extension,
      };
    };

    const getLocationLabel = (value: any) => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      return value.name ?? '';
    };

    const buildLocationSummary = (city: any, country: any) => {
      const values = [getLocationLabel(city), getLocationLabel(country)].filter(Boolean);
      return values.length ? values.join(' / ') : '';
    };

    const createMetaItem = (label: string, value: string | null | undefined): DetailMetaItem | null => {
      const formattedValue = displayValue(value, '');
      return formattedValue ? { label, value: formattedValue } : null;
    };

    const buildDateRange = (startDate: string | null | undefined, endDate: string | null | undefined) => {
      const values = [startDate ? formatDate(startDate) : '', endDate ? formatDate(endDate) : ''].filter(Boolean);
      return values.join(' - ');
    };

    const buildDocumentCard = (sectionKey: AttachmentValidationCvSectionKey, rawItem: any, data: Partial<DetailDocumentCard>): DetailDocumentCard => ({
      uid: `${sectionKey}-${rawItem.id}`,
      id: Number(rawItem.id),
      sectionKey,
      sectionLabel: cvSectionOptions.find((option) => option.value === sectionKey)?.label ?? sectionKey,
      title: data.title ?? 'Registro sin título',
      subtitle: data.subtitle ?? 'Sin información complementaria',
      documentStatus: data.documentStatus ?? displayValue(rawItem.documentStatus, 'Pendiente'),
      certificateUrl: data.certificateUrl ?? rawItem.certificateUrl ?? null,
      description: data.description ?? '',
      createdAt: data.createdAt ?? rawItem.createdAt ?? '',
      updatedAt: data.updatedAt ?? rawItem.updatedAt ?? rawItem.createdAt ?? '',
      metadata: (data.metadata ?? []).filter((item): item is DetailMetaItem => Boolean(item && item.value)),
    });

    const normalizeSectionDocuments = (sectionKey: AttachmentValidationCvSectionKey, rawItems: any[]): DetailDocumentCard[] => {
      return rawItems.map((item) => {
        switch (sectionKey) {
          case 'academicBackground':
            return buildDocumentCard(sectionKey, item, {
              title: displayValue(item.degreeObtained, 'Formación académica'),
              subtitle: displayValue(item.institution, 'Institución no registrada'),
              documentStatus: displayValue(item.documentStatus, 'Pendiente'),
              metadata: [
                createMetaItem('Nivel', item.academicLevel?.name),
                createMetaItem('Estado', item.status),
                createMetaItem('Periodo', buildDateRange(item.startDate, item.endDate)),
                createMetaItem('País', getLocationLabel(item.country)),
                createMetaItem('Registro', item.registrationNumber),
              ],
            });

          case 'supplementaryTraining':
            return buildDocumentCard(sectionKey, item, {
              title: displayValue(item.courseName, 'Formación complementaria'),
              subtitle: displayValue(item.institution, 'Institución no registrada'),
              documentStatus: displayValue(item.documentStatus, 'Pendiente'),
              metadata: [
                createMetaItem('Tipo', item.levelType?.name),
                createMetaItem('Intensidad', item.hourlyIntensity ? `${item.hourlyIntensity} horas` : ''),
                createMetaItem('Finalización', item.dateCompletion ? formatDate(item.dateCompletion) : ''),
                createMetaItem('País', getLocationLabel(item.country)),
                createMetaItem('Código', item.certifiedCode),
              ],
            });

          case 'workExperience':
            return buildDocumentCard(sectionKey, item, {
              title: displayValue(item.role, 'Experiencia laboral'),
              subtitle: displayValue(item.companyName, 'Empresa no registrada'),
              documentStatus: displayValue(item.documentStatus, 'Pendiente'),
              description: stripHtml(displayValue(item.functions, '')),
              metadata: [
                createMetaItem('Periodo', buildDateRange(item.startDate, item.endDate)),
                createMetaItem('Supervisor', item.directSupervisor),
                createMetaItem('Contacto', item.contactNumber),
                createMetaItem('Ubicación', buildLocationSummary(item.municipality, item.country)),
              ],
            });

          case 'intellectualProduction':
            return buildDocumentCard(sectionKey, item, {
              title: displayValue(item.title, 'Producción intelectual'),
              subtitle: displayValue(item.publisher || item.publicationMedium, 'Medio no registrado'),
              documentStatus: displayValue(item.documentStatus, 'Pendiente'),
              description: stripHtml(displayValue(item.description, '')),
              metadata: [
                createMetaItem('Tipo', item.typeProduction?.name),
                createMetaItem('Año', item.year ? String(item.year) : ''),
                createMetaItem('Medio', item.publicationMedium),
                createMetaItem('Enlace', item.link),
              ],
            });

          case 'academicEvents':
            return buildDocumentCard(sectionKey, item, {
              title: displayValue(item.eventName, 'Evento académico'),
              subtitle: displayValue(item.organizingInstitution, 'Institución organizadora no registrada'),
              documentStatus: displayValue(item.documentStatus, 'Pendiente'),
              description: stripHtml(displayValue(item.description, '')),
              metadata: [createMetaItem('Tipo', item.eventType?.name), createMetaItem('Rol', item.role?.name), createMetaItem('Año', item.year ? String(item.year) : '')],
            });

          case 'recognition':
            return buildDocumentCard(sectionKey, item, {
              title: displayValue(item.recognitionName, 'Reconocimiento'),
              subtitle: displayValue(item.awardingEntity, 'Entidad no registrada'),
              documentStatus: displayValue(item.documentStatus, 'Pendiente'),
              description: stripHtml(displayValue(item.description, '')),
              metadata: [createMetaItem('Año', item.year ? String(item.year) : '')],
            });

          default:
            return buildDocumentCard(sectionKey, item, {});
        }
      });
    };

    const visibleSections = computed<DetailSectionCard[]>(() => {
      const visibleKeys = selectedSectionKey.value ? [selectedSectionKey.value] : cvSectionOptions.map((option) => option.value);

      return visibleKeys.map((sectionKey) => ({
        ...cvSectionOptions.find((option) => option.value === sectionKey)!,
        icon: cvSectionIcons[sectionKey],
        items: normalizeSectionDocuments(sectionKey, cvDetail.value?.cv?.[sectionKey] ?? []),
      }));
    });

    const allAllowedDocuments = computed(() => visibleSections.value.flatMap((section) => section.items));

    const activeDocument = computed(() => allAllowedDocuments.value.find((document) => document.uid === activeDocumentUid.value) ?? allAllowedDocuments.value[0] ?? null);
    const activeDocumentViewer = computed(() => resolveDocumentViewer(activeDocument.value?.certificateUrl));
    const hasActiveDocumentViewer = computed(() => Boolean(activeDocumentViewer.value.src));

    const detailStats = computed(() => {
      const documents = allAllowedDocuments.value;
      const pendingDocuments = documents.filter((document) => mapLabelToStatus(document.documentStatus) === 'pending').length;
      const approvedDocuments = documents.filter((document) => mapLabelToStatus(document.documentStatus) === 'approved').length;
      const rejectedDocuments = documents.filter((document) => mapLabelToStatus(document.documentStatus) === 'rejected').length;

      return [
        {
          label: 'Secciones visibles',
          value: visibleSections.value.length,
          caption: selectedSectionKey.value ? 'Filtro aplicado' : 'Vista completa',
          variant: 'blue',
        },
        {
          label: 'Registros visibles',
          value: documents.length,
          caption: 'Documentos listados',
          variant: 'gray',
        },
        {
          label: 'Pendientes',
          value: pendingDocuments,
          caption: 'Por validar',
          variant: 'yellow',
        },
        {
          label: 'Validados',
          value: approvedDocuments + rejectedDocuments,
          caption: 'Con decisión tomada',
          variant: 'green',
        },
      ];
    });

    const canUseReviewWorkspace = () => {
      if (typeof window === 'undefined') return false;
      return window.innerWidth > 1200 && Boolean(reviewRecord.value);
    };

    const detachReviewWorkspaceScroll = () => {
      const container = reviewScrollContainerRef.value;

      if (container) {
        container.removeEventListener('wheel', handleReviewWorkspaceWheel);
      }

      reviewScrollContainerRef.value = null;
    };

    const shouldRedirectReviewScroll = (deltaY: number) => {
      const reviewGridElement = reviewGridRef.value;
      const reviewLeftElement = reviewLeftRef.value;
      const scrollContainer = reviewScrollContainerRef.value;

      if (!canUseReviewWorkspace() || !reviewGridElement || !reviewLeftElement || !scrollContainer) {
        return false;
      }

      const reviewGridRect = reviewGridElement.getBoundingClientRect();
      const scrollContainerRect = scrollContainer.getBoundingClientRect();
      const pinnedTop = scrollContainerRect.top + reviewWorkspaceTopOffset;
      const isPinnedWorkspace = Math.abs(reviewGridRect.top - pinnedTop) <= 2;

      if (!isPinnedWorkspace) {
        return false;
      }

      const maxScrollTop = reviewLeftElement.scrollHeight - reviewLeftElement.clientHeight;

      if (maxScrollTop <= 0) {
        return false;
      }

      if (deltaY > 0) {
        return reviewLeftElement.scrollTop < maxScrollTop - 1;
      }

      if (deltaY < 0) {
        return reviewLeftElement.scrollTop > 1;
      }

      return false;
    };

    function handleReviewWorkspaceWheel(event: WheelEvent) {
      const reviewLeftElement = reviewLeftRef.value;

      if (!reviewLeftElement || !shouldRedirectReviewScroll(event.deltaY)) {
        return;
      }

      event.preventDefault();
      reviewLeftElement.scrollTop += event.deltaY;
    }

    const bindReviewWorkspaceScroll = async () => {
      detachReviewWorkspaceScroll();

      if (!canUseReviewWorkspace()) {
        return;
      }

      await nextTick();

      const reviewGridElement = reviewGridRef.value;

      if (!reviewGridElement) {
        return;
      }

      const scrollContainer = reviewGridElement.closest('.container-content');

      if (!(scrollContainer instanceof HTMLElement)) {
        return;
      }

      reviewScrollContainerRef.value = scrollContainer;
      scrollContainer.addEventListener('wheel', handleReviewWorkspaceWheel, {
        passive: false,
      });
    };

    watch(
      allAllowedDocuments,
      (documents) => {
        if (!documents.length) {
          activeDocumentUid.value = '';
          return;
        }

        const existsCurrentDocument = documents.some((document) => document.uid === activeDocumentUid.value);

        if (!existsCurrentDocument) {
          activeDocumentUid.value = documents[0].uid;
        }
      },
      { immediate: true }
    );

    const loadCvDetail = async (sectionKey?: AttachmentValidationCvSectionKey) => {
      if (!reviewRecord.value) return;

      detailLoading.value = true;
      detailError.value = '';

      try {
        cvDetail.value = await getAttachmentValidationPeopleDetailService.run({
          peopleId: reviewRecord.value.peopleId,
          ...(sectionKey ? { key: sectionKey } : {}),
        });
      } catch (error) {
        cvDetail.value = null;
        detailError.value = 'No fue posible consultar la hoja de vida del docente con la selección actual.';
        console.log('error', error);
      } finally {
        detailLoading.value = false;
      }
    };

    const resetDetailState = () => {
      detachReviewWorkspaceScroll();
      reviewRecord.value = null;
      cvDetail.value = null;
      detailError.value = '';
      selectedSectionKey.value = '';
      activeDocumentUid.value = '';
      approveModalVisible.value = false;
      approveTarget.value = null;
      previewModalVisible.value = false;
      rejectModalVisible.value = false;
      rejectTarget.value = null;
    };

    const closeDetail = async () => {
      resetDetailState();
      await router.push({ name: attachmentValidationRouteNames.list });
    };

    const changeSection = async (sectionKey: AttachmentValidationCvSectionKey | '') => {
      if (!reviewRecord.value) return;
      if (selectedSectionKey.value === sectionKey && cvDetail.value) return;

      const nextQuery = { ...route.query };

      if (sectionKey) {
        nextQuery.section = sectionKey;
      } else {
        delete nextQuery.section;
      }

      await router.replace({
        name: attachmentValidationRouteNames.review,
        params: { peopleId: reviewRecord.value.peopleId },
        query: nextQuery,
      });
    };

    const selectDocument = (document: DetailDocumentCard) => {
      activeDocumentUid.value = document.uid;
    };

    const setCarouselRef = (sectionKey: AttachmentValidationCvSectionKey, swiper: any) => {
      carouselRefs.value[sectionKey] = swiper ?? null;
    };

    const scrollSection = (sectionKey: AttachmentValidationCvSectionKey, direction: 'left' | 'right') => {
      const carouselElement = carouselRefs.value[sectionKey];

      if (!carouselElement) return;

      if (direction === 'left') {
        carouselElement.slidePrev();
        return;
      }

      carouselElement.slideNext();
    };

    const openSupport = (url: string | null) => {
      if (!url) return;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openPreviewModal = () => {
      if (!hasActiveDocumentViewer.value) return;
      previewModalVisible.value = true;
    };

    const closePreviewModal = () => {
      previewModalVisible.value = false;
    };

    const handlePreviewSupport = (document: DetailDocumentCard | null) => {
      if (!document?.certificateUrl) return;
      openSupport(document.certificateUrl);
    };

    const openApproveModal = (document: DetailDocumentCard | null) => {
      if (!document) return;

      closePreviewModal();
      approveTarget.value = document;
      approveModalVisible.value = true;
    };

    const closeApproveModal = () => {
      approveModalVisible.value = false;
      approveTarget.value = null;
    };

    const toApiLogKey = (sectionKey: AttachmentValidationCvSectionKey) => `${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}`;

    const submitDocumentStatus = async (document: DetailDocumentCard, newStatus: AttachmentValidationDecisionStatus, observation: string) => {
      if (!reviewRecord.value) return;

      isSubmittingStatus.value = true;

      try {
        await createAttachmentValidationLogService.run({
          key: toApiLogKey(document.sectionKey),
          documentId: document.id,
          peopleId: reviewRecord.value.peopleId,
          newStatus,
          observation,
        });

        await loadCvDetail(selectedSectionKey.value || undefined);
      } catch (error) {
        console.log('error', error);
      } finally {
        isSubmittingStatus.value = false;
      }
    };

    const confirmApprove = async () => {
      if (!approveTarget.value) return;

      await submitDocumentStatus(approveTarget.value, 'Aprobado', '');
      closeApproveModal();
    };

    const openRejectModal = (document: DetailDocumentCard | null) => {
      if (!document) return;

      closePreviewModal();
      rejectTarget.value = document;
      rejectModalVisible.value = true;
    };

    const closeRejectModal = () => {
      rejectModalVisible.value = false;
      rejectTarget.value = null;
    };

    const confirmReject = async ({ document, observation }: { document: DetailDocumentCard; observation: string }) => {
      if (!document || !observation.trim()) return;

      await submitDocumentStatus(document, 'Rechazado', observation.trim());
      closeRejectModal();
    };

    watch(
      () => route.fullPath,
      async () => {
        const routeRecord = buildRecordFromRoute();

        if (!routeRecord) {
          resetDetailState();
          return;
        }

        const nextSectionKey = getRouteSectionKey(route.query.section);
        const shouldReload = reviewRecord.value?.peopleId !== routeRecord.peopleId || selectedSectionKey.value !== nextSectionKey || !cvDetail.value;

        reviewRecord.value = routeRecord;

        if (selectedSectionKey.value !== nextSectionKey) {
          selectedSectionKey.value = nextSectionKey;
          activeDocumentUid.value = '';
        }

        if (shouldReload) {
          await loadCvDetail(nextSectionKey || undefined);
        }

        await bindReviewWorkspaceScroll();
      },
      { immediate: true }
    );

    const handleWindowResize = () => {
      void bindReviewWorkspaceScroll();
    };

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración General', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        window.addEventListener('resize', handleWindowResize);
      } catch (error) {
        console.log('error', error);
      } finally {
        loading.value = false;
      }
    });

    onBeforeUnmount(() => {
      detachReviewWorkspaceScroll();
      window.removeEventListener('resize', handleWindowResize);
    });

    return {
      title,
      loading,
      detailLoading,
      detailError,
      reviewRecord,
      carouselModules,
      cvDetail,
      cvSectionOptions,
      selectedSectionKey,
      visibleSections,
      detailFullName,
      detailStats,
      allAllowedDocuments,
      activeDocument,
      activeDocumentViewer,
      hasActiveDocumentViewer,
      reviewGridRef,
      reviewLeftRef,
      approveModalVisible,
      approveTarget,
      rejectModalVisible,
      rejectTarget,
      previewModalVisible,
      isSubmittingStatus,
      getInitials,
      getStatusVariant,
      getDocumentStatusVariant,
      formatDateTime,
      displayValue,
      getLocationLabel,
      buildLocationSummary,
      closeDetail,
      changeSection,
      selectDocument,
      setCarouselRef,
      scrollSection,
      openSupport,
      handlePreviewSupport,
      openPreviewModal,
      closePreviewModal,
      openApproveModal,
      closeApproveModal,
      confirmApprove,
      openRejectModal,
      closeRejectModal,
      confirmReject,
    };
  },
});
</script>

<style scoped>
.attachmentValidationPage {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.contentIconTitle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sectionHead__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.14), rgba(var(--color-primary-rgb), 0.05));
  color: var(--color-primary);
}

.sectionHead__title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-dark, #1f2937);
}

.sectionHead__subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--color-gray-600, #6b7280);
  font-size: 0.95rem;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.attachmentValidationPage__tableHead {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachmentValidationPage__tableTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.attachmentValidationPage__tableTitleLabel {
  display: flex;
  align-items: center;
  color: #111827;
  font-weight: 700;
}

.attachmentValidationPage__tableHint {
  margin: 0;
  color: #667085;
  font-size: 0.9rem;
}

.teacherCell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teacherAvatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #344054;
  font-weight: 700;
  flex-shrink: 0;
}

.teacherAvatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teacherName {
  font-weight: 700;
  color: #111827;
}

.teacherMeta {
  font-size: 12px;
  color: #6b7280;
}

.documentsCount {
  color: #344054;
}

.actionsCell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.detailPage {
  --review-grid-top: 12px;
  --review-grid-height: calc(100vh - 143px - 24px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detailHero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dbeafe;
  border-radius: 22px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%);
}

.detailHero__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.detailHero__content {
  flex: 1;
  min-width: 280px;
}

.detailHero__avatar {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
}

.detailHero__heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.detailHero__title {
  margin: 0;
  font-size: 1.85rem;
  color: #0f172a;
}

.detailHero__subtitle {
  margin: 0.35rem 0 0;
  color: #475569;
}

.detailHero__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detailHero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.85rem;
  color: #475569;
  font-size: 0.92rem;
}

.detailStatsGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.cvSectionFilter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cvSectionFilter__chip {
  border: 1px solid #d0d5dd;
  background: #ffffff;
  color: #344054;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  min-height: 36px;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.1;
  transition: all 0.2s ease;
}

.cvSectionFilter__chip:hover {
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.cvSectionFilter__chip--active {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.16);
}

.integrationNotice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e3a8a;
}

.integrationNotice p {
  margin: 0.35rem 0 0;
}

.integrationNotice--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.reviewGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(380px, 31vw, 470px);
  gap: 1.25rem;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
}

.reviewLeft,
.reviewRight {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
}

.reviewRight {
  align-self: stretch;
}

.reviewRight__viewerSticky {
  width: 100%;
  height: 100%;
}

.reviewRight__viewerCard {
  width: 100%;
}

.reviewSummaryCard {
  margin-top: 1rem;
}

.reviewTitle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewTitle__icon,
.sectionCardHead__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewTitle__main,
.sectionCardHead__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
}

.reviewTitle__sub,
.sectionCardHead__subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
}

.detailGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.infoBlock {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.infoBlock--full {
  grid-column: 1 / -1;
}

.infoBlock label {
  font-size: 13px;
  color: #667085;
}

.infoBlock p {
  margin: 0;
  color: #111827;
  font-weight: 500;
}

.sectionCardHead {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.sectionCardHead__main,
.sectionCardHead__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sectionCarousel {
  width: 100%;
  padding: 0.6rem 0 1rem;
  overflow: hidden;
}

.sectionCarousel :deep(.swiper-wrapper) {
  align-items: stretch;
}

.sectionCarousel__slide {
  width: clamp(280px, 34vw, 380px);
  height: auto;
}

.sectionCarousel :deep(.swiper-slide) {
  height: auto;
}

.sectionCarousel :deep(.swiper-slide-active) .documentCard {
  border-color: #2563eb;
  box-shadow: 0 14px 35px rgba(37, 99, 235, 0.08);
}

.documentCard {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 0.85rem;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  scroll-snap-align: start;
}

.documentCard:hover {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
}

.documentCard--active {
  border-color: #2563eb;
  box-shadow: 0 14px 35px rgba(37, 99, 235, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.documentCard__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.documentCard__date {
  color: #64748b;
  font-size: 0.72rem;
  white-space: nowrap;
}

.documentCard__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.documentCard__subtitle {
  margin: 0;
  color: #475569;
  font-size: 0.83rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.documentCard__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem 0.6rem;
}

.documentCard__metaItem {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: 0.35rem;
  padding: 0.5rem 0.65rem;
  border-radius: 12px;
  background: #f8fafc;
}

.documentCard__metaItem span {
  color: #64748b;
  font-size: 0.68rem;
  white-space: nowrap;
}

.documentCard__metaItem strong {
  color: #0f172a;
  font-size: 0.76rem;
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.documentCard__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
}

.documentCard__footerLabel {
  color: #64748b;
  font-size: 0.73rem;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.documentHeader {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.documentHeader__left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 600;
}

.documentPreview {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 0;
}

.documentPreview__summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.documentPreview__summaryCopy {
  min-width: 0;
}

.documentPreview__section {
  margin: 0;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.documentPreview__hint {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.5;
}

.documentPreview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  margin-top: auto;
}

:deep(.documentPreview__actions .o-btn) {
  min-height: 36px;
  padding: 0.45rem 0.75rem;
  font-size: 0.82rem;
}

:deep(.documentPreview__actions .o-btn .me-2) {
  margin-right: 0.35rem !important;
}

.sectionSummary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sectionSummary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.sectionSummary__left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #1f2937;
  font-weight: 600;
}

.emptySectionState {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: #f8fafc;
  color: #475569;
}

.emptySectionState strong {
  display: block;
  color: #0f172a;
}

.emptySectionState p {
  margin: 0.35rem 0 0;
}

.emptySectionState--standalone {
  justify-content: center;
}

.documentViewer {
  min-height: 280px;
  background: #f8fafc;
  border: 1px solid #eaecf0;
  border-radius: 16px;
  padding: 20px;
}

.documentViewer--loaded {
  min-height: 20rem;
  padding: 0;
  overflow: hidden;
  background: #ffffff;
}

.documentViewer--loaded iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
}

.documentViewer__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #ffffff;
}

.documentViewer--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 20rem;
  text-align: center;
}

.documentMock__icon {
  font-size: 3rem;
  color: #98a2b3;
}

.documentMock__text,
.emptyStateText {
  margin: 0;
  color: #667085;
  font-size: 14px;
}

:deep(.form-control) {
  width: 100%;
  min-height: 44px;
}

@media (min-width: 1201px) {
  .reviewGrid {
    position: sticky;
    top: var(--review-grid-top);
    height: var(--review-grid-height);
    max-height: var(--review-grid-height);
    align-items: stretch;
  }

  .reviewLeft,
  .reviewRight {
    height: 100%;
    max-height: 100%;
  }

  .reviewLeft {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: 0.35rem;
    scrollbar-gutter: stable;
  }

  .reviewRight {
    overflow: hidden;
  }

  .reviewRight__viewerSticky {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .reviewRight__viewerCard {
    height: 100%;
  }

  :deep(.reviewRight__viewerCard .content) {
    height: 100%;
    min-height: 0;
  }

  :deep(.reviewRight__viewerCard .o-card-body) {
    flex: 1 1 auto;
    min-height: 0;
  }

  .documentPreview {
    height: 100%;
  }

  .reviewRight :deep(*) {
    max-width: 100%;
  }

  .documentViewer--loaded {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    height: auto;
    max-height: none;
  }

  .documentViewer--loaded iframe,
  .documentViewer__image {
    height: 100%;
    min-height: 0;
  }

  .documentViewer--empty {
    flex: 1 1 auto;
    min-height: 0;
  }
}

@media (max-width: 1200px) {
  .reviewGrid {
    grid-template-columns: 1fr;
  }

  .reviewRight {
    align-self: flex-start;
  }

  .reviewRight__viewerSticky {
    height: auto;
  }
}

@media (max-width: 992px) {
  .statsGrid,
  .detailStatsGrid,
  .detailGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sectionHead__title,
  .detailHero__title {
    font-size: 1.45rem;
  }

  .documentCard__meta {
    grid-template-columns: 1fr;
  }

  .sectionCarousel__slide {
    width: min(84vw, 340px);
  }

  .detailHero__main,
  .documentPreview__summary,
  .sectionCardHead,
  .sectionCardHead__main,
  .sectionCardHead__actions,
  .documentCard__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .cvSectionFilter__chip {
    width: auto;
    text-align: center;
  }

  .documentViewer--loaded {
    height: min(28rem, 62vh);
  }

  .documentViewer--empty {
    min-height: min(22rem, 56vh);
  }
}
</style>
