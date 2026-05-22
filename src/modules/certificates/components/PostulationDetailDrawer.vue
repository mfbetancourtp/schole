<template>
  <div class="postulation-detail">
    <!-- Header -->
    <div class="postulation-detail__header">
      <h3 class="postulation-detail__title">{{ detail.name }}</h3>
      <p class="postulation-detail__students-label">{{ studentsLabel }}</p>
      <div class="postulation-detail__status-row">
        <AppBadge :label="detail.status" :variant="statusVariant" />
      </div>
    </div>

    <!-- Team pending confirmation alert -->
    <div v-if="hasPendingMembers" class="postulation-detail__alert postulation-detail__alert--warning">
      <AppIcon icon="exclamation-circle" class="alert-icon" />
      <div class="alert-content">
        <strong>{{ t('Esperando confirmación del equipo') }}</strong>
        <p>
          {{ t('El compañero debe aceptar la invitación antes de poder aprobar esta postulación.') }}
        </p>
      </div>
    </div>

    <!-- Students section -->
    <div class="postulation-detail__section">
      <h4 class="postulation-detail__section-title">
        {{ allStudents.length > 1 ? t('Integrantes del Equipo') : t('Estudiante') }}
      </h4>
      <div v-for="student in allStudents" :key="student.id" class="student-card" :class="{ 'student-card--pending': student.pendingConfirmation }">
        <AppAvatar :name="`${student.people.names} ${student.people.lastnames}`" />
        <div class="student-card__info">
          <div class="student-card__name-row">
            <span class="student-card__name">{{ student.people.names }} {{ student.people.lastnames }}</span>
            <AppBadge v-if="student.pendingConfirmation" label="Pendiente de confirmar" variant="warning" />
          </div>
          <span class="student-card__email">{{ student.people.email }}</span>
        </div>
      </div>
    </div>

    <!-- Info card -->
    <div class="postulation-detail__info-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-item__label">{{ t('Facultad') }}</span>
          <span class="info-item__value">{{ detail.faculty.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-item__label">{{ t('Modalidad') }}</span>
          <span class="info-item__value">{{ detail.scheduleSettings.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-item__label">{{ t('Fecha de Envío') }}</span>
          <span class="info-item__value">{{ formatDate(detail.createdAt) }}</span>
        </div>
        <div class="info-item">
          <span class="info-item__label">{{ t('Tipo') }}</span>
          <span class="info-item__value">{{ detail.applicationType }}</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="postulation-detail__section">
      <h4 class="postulation-detail__section-title">
        {{ t('Descripción del Proyecto') }}
      </h4>
      <div class="postulation-detail__description-box">
        <p>{{ detail.description }}</p>
      </div>
    </div>

    <!-- Tutor assignment -->
    <div class="postulation-detail__section">
      <h4 class="postulation-detail__section-title">
        {{ t('Asignación de Tutor') }}
      </h4>

      <!-- Tutor requested by student -->
      <div v-if="detail.tutor && !detail.unsupervised" class="tutor-requested">
        <div class="tutor-requested__info">
          <AppIcon icon="user-tie" class="tutor-requested__icon" />
          <div class="tutor-requested__text">
            <div class="tutor-requested__name-row">
              <span class="tutor-requested__name">
                {{ detail.tutor.people.names }}
                {{ detail.tutor.people.lastnames }}
              </span>
              <AppBadge label="Solicitado por estudiante" variant="warning" />
            </div>
          </div>
        </div>
      </div>

      <!-- Needs tutor assignment alert -->
      <div v-if="detail.unsupervised" class="postulation-detail__alert postulation-detail__alert--info">
        <AppIcon icon="exclamation-circle" class="alert-icon" />
        <div class="alert-content">
          <strong>{{ t('Requiere asignación de tutor por coordinación') }}</strong>
          <p>
            {{ t('El estudiante no seleccionó un tutor específico. La facultad debe asignar un tutor según el tema del proyecto.') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tutor final assigned (only when pending) -->
    <div v-if="detail.status === 'Pendiente'" class="postulation-detail__section">
      <h4 class="postulation-detail__section-title">{{ t('Tutor Final Asignado') }} *</h4>
      <p class="postulation-detail__section-subtitle">
        {{ t('Confirme el tutor solicitado o seleccione uno nuevo') }}
      </p>
      <AppFormField :label="t('Seleccione un tutor')">
        <AppAutocomplete input-id="tutor-assign" :options="tutorOptions" label="fullName" :reduce="(o: any) => o.id" v-model="selectedTutorId" :clearable="true" @search="onSearchTutor" />
      </AppFormField>
    </div>

    <!-- Documents -->
    <div class="postulation-detail__section">
      <h4 class="postulation-detail__section-title">
        {{ t('Documentos Adjuntos') }}
      </h4>
      <div v-if="detail.documents.length" class="postulation-detail__documents">
        <div v-for="doc in detail.documents" :key="doc.id" class="document-item">
          <div class="document-item__info">
            <AppIcon icon="file-pdf" class="document-item__icon" />
            <div class="document-item__text">
              <span class="document-item__name">{{ doc.documentType }}</span>
              <span class="document-item__size">{{ formatDate(doc.createdAt) }}</span>
            </div>
          </div>
          <AppButton :label="t('Ver')" variant="primary" outlined size="sm" @click="openDoc(doc.documentUrl)" />
        </div>
      </div>
      <p v-else class="postulation-detail__no-docs">
        {{ t('Sin documentos adjuntos') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ApplicationProjectDto, ApplicationProjectStatus } from '../dtos/applicationProject.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import { GetUsersForSelectService } from '../../../shared/services/getUsersForSelect.service';

const statusVariantMap: Record<ApplicationProjectStatus, VariantsConstant> = {
  Pendiente: 'warning',
  Aprobado: 'success',
  Rechazado: 'danger',
  Cancelado: 'secondary',
};

interface StudentEntry {
  id: number;
  people: { names: string; lastnames: string; email: string };
  pendingConfirmation: boolean;
}

export default defineComponent({
  name: 'PostulationDetailDrawer',
  components: {
    AppBadge,
    AppIcon,
    AppButton,
    AppAutocomplete,
    AppFormField,
    AppAvatar,
  },
  props: {
    detail: {
      type: Object as PropType<ApplicationProjectDto>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const selectedTutorId = ref<number | null>(null);
    const tutorOptions = ref<any[]>([]);

    watch(
      () => props.detail,
      () => {
        selectedTutorId.value = null;
        tutorOptions.value = [];
      }
    );

    const statusVariant = computed(() => statusVariantMap[props.detail.status] ?? 'secondary');

    const allStudents = computed<StudentEntry[]>(() => {
      const main: StudentEntry = {
        ...props.detail.user,
        pendingConfirmation: false,
      };
      const members: StudentEntry[] = props.detail.members.map((m) => ({
        ...m.user,
        pendingConfirmation: m.status !== 'Aceptado',
      }));
      return [main, ...members];
    });

    const hasPendingMembers = computed(() => props.detail.members.some((m) => m.status !== 'Aceptado'));

    const studentsLabel = computed(() => {
      const names = allStudents.value.map((s) => `${s.people.names} ${s.people.lastnames}`);
      return names.join(' · ');
    });

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const openDoc = (url: string) => window.open(url, '_blank');

    const onSearchTutor = async (query: string, setLoading: (v: boolean) => void) => {
      if (!query || query.length < 2) return;
      setLoading(true);
      try {
        const result = await new GetUsersForSelectService().run({
          search: query,
        });
        const mapped = (result.data ?? []).map((u: any) => ({
          ...u,
          fullName: `${u.people.names} ${u.people.lastnames}`,
        }));

        if (selectedTutorId.value) {
          const stillInList = mapped.some((u: any) => u.id === selectedTutorId.value);
          if (!stillInList) {
            const current = tutorOptions.value.find((u: any) => u.id === selectedTutorId.value);
            if (current) mapped.unshift(current);
          }
        }

        tutorOptions.value = mapped;
      } finally {
        setLoading(false);
      }
    };

    const getSelectedTutorId = () => selectedTutorId.value;

    return {
      t,
      statusVariant,
      allStudents,
      hasPendingMembers,
      studentsLabel,
      selectedTutorId,
      tutorOptions,
      formatDate,
      openDoc,
      onSearchTutor,
      getSelectedTutorId,
    };
  },
});
</script>

<style scoped>
.postulation-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.postulation-detail__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.postulation-detail__title {
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.postulation-detail__students-label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
}

.postulation-detail__status-row {
  display: flex;
  margin-top: 4px;
}

.postulation-detail__alert {
  display: flex;
  gap: 12px;
  border-radius: 8px;
  padding: 16px;
}

.postulation-detail__alert--warning {
  background: #fff8e1;
  border: 1px solid #ffe082;
}

.postulation-detail__alert--info {
  background: #fff3e0;
  border: 1px solid #ffcc80;
}

.alert-icon {
  font-size: 18px;
  color: #e65100;
  margin-top: 2px;
  flex-shrink: 0;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-content strong {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.alert-content p {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
}

.postulation-detail__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.postulation-detail__section-title {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.postulation-detail__section-subtitle {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: -4px 0 0 0;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 16px;
}

.student-card--pending {
  border-color: #ffe082;
  background: #fffde7;
}

.student-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-card__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #212b36;
}

.student-card__email {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
}

.postulation-detail__info-card {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item__label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #919eab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item__value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.postulation-detail__description-box {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 8px;
  padding: 16px;
}

.postulation-detail__description-box p {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #637381;
  margin: 0;
  line-height: 1.6;
}

.tutor-requested {
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 16px;
}

.tutor-requested__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tutor-requested__icon {
  font-size: 20px;
  color: #637381;
}

.tutor-requested__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tutor-requested__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tutor-requested__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.postulation-detail__documents {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border: 1px solid rgba(145, 158, 171, 0.16);
  border-radius: 12px;
  padding: 14px 16px;
}

.document-item__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.document-item__icon {
  font-size: 20px;
  color: #ff5630;
}

.document-item__text {
  display: flex;
  flex-direction: column;
}

.document-item__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.document-item__size {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  color: #919eab;
}

.postulation-detail__no-docs {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #919eab;
  margin: 0;
}
</style>
