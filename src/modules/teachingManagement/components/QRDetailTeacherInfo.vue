<template>
  <div class="info">
    <!-- Teacher Info Section -->
    <div class="info__section">
      <h3 class="info__section-title">Información del Docente</h3>

      <div class="info__teacher">
        <AppAvatar :avatar="data.teacher.avatarUrl" :name="data.teacher.fullName" size="md" />
        <div class="info__teacher-details">
          <h4 class="info__teacher-name">{{ data.teacher.fullName }}</h4>
          <p class="info__teacher-role">{{ data.teacher.role }}</p>
          <p class="info__teacher-email">{{ data.teacher.email }}</p>
        </div>
      </div>

      <div class="info__fields">
        <div class="info__field">
          <div class="info__field-icon info__field-icon--blue">
            <AppIcon icon="hashtag" />
          </div>
          <div>
            <span class="info__field-label">Código Docente</span>
            <span class="info__field-value">{{ data.teacher.code }}</span>
          </div>
        </div>
        <div class="info__field">
          <div class="info__field-icon info__field-icon--orange">
            <AppIcon icon="building" />
          </div>
          <div>
            <span class="info__field-label">Facultad</span>
            <span class="info__field-value">{{ data.teacher.faculty }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Info Section -->
    <div class="info__section">
      <h3 class="info__section-title">Información del Código QR</h3>

      <div class="info__fields info__fields--qr">
        <div class="info__field">
          <div class="info__field-icon info__field-icon--purple">
            <AppIcon icon="calendar-alt" />
          </div>
          <div>
            <span class="info__field-label">Fecha de Creación</span>
            <span class="info__field-value">{{ data.qr.creationDate }}</span>
          </div>
        </div>
        <div class="info__field">
          <div class="info__field-icon info__field-icon--red">
            <AppIcon icon="calendar-times" />
          </div>
          <div>
            <span class="info__field-label">Fecha de Expiración</span>
            <span class="info__field-value info__field-value--red">{{ data.qr.expirationDate }}</span>
          </div>
        </div>
        <div class="info__field">
          <div class="info__field-icon info__field-icon--teal">
            <AppIcon icon="clock" />
          </div>
          <div>
            <span class="info__field-label">Última Marcación</span>
            <span class="info__field-value">{{ data.qr.lastScan }}</span>
          </div>
        </div>
        <div class="info__field">
          <div class="info__field-icon info__field-icon--green">
            <AppIcon icon="check-circle" />
          </div>
          <div>
            <span class="info__field-label">Estado Actual</span>
            <span class="info__field-value info__field-value--green">{{ data.qr.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Info -->
    <div class="info__important">
      <div class="info__important-header">
        <AppIcon icon="exclamation-circle" class="info__important-icon" />
        <h4 class="info__important-title">Información Importante</h4>
      </div>
      <ul class="info__important-list">
        <li v-for="(note, index) in data.importantNotes" :key="index" class="info__important-item">
          {{ note }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import { TeacherQRDetailDto } from '../dtos/teacherQRDetail.dto';

export default defineComponent({
  name: 'QRDetailTeacherInfo',
  components: { AppIcon, AppAvatar },
  props: {
    data: {
      type: Object as PropType<TeacherQRDetailDto>,
      required: true,
    },
  },
});
</script>

<style scoped>
.info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section */
.info__section {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.info__section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px;
}

/* Teacher */
.info__teacher {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.info__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info__teacher-details {
  flex: 1;
}

.info__teacher-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.info__teacher-role {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 2px;
}

.info__teacher-email {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

/* Fields */
.info__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info__fields--qr {
  grid-template-columns: 1fr 1fr;
}

.info__field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info__field-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.info__field-icon--blue {
  background: #dbeafe;
  color: #3b82f6;
}
.info__field-icon--orange {
  background: #ffedd5;
  color: #f97316;
}
.info__field-icon--purple {
  background: #f3e8ff;
  color: #9333ea;
}
.info__field-icon--red {
  background: #fee2e2;
  color: #ef4444;
}
.info__field-icon--teal {
  background: #ccfbf1;
  color: #14b8a6;
}
.info__field-icon--green {
  background: #dcfce7;
  color: #22c55e;
}

.info__field-label {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-bottom: 2px;
}

.info__field-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.info__field-value--red {
  color: #ef4444;
}

.info__field-value--green {
  color: #22c55e;
}

/* Important Info */
.info__important {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 20px;
}

.info__important-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.info__important-icon {
  color: #f59e0b;
  font-size: 1.1rem;
}

.info__important-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.info__important-list {
  margin: 0;
  padding: 0 0 0 20px;
  list-style: disc;
}

.info__important-item {
  font-size: 0.8rem;
  color: #78716c;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .info__fields {
    grid-template-columns: 1fr;
  }
}
</style>
