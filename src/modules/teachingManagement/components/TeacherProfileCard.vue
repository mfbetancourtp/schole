<template>
  <div class="teacher-card">
    <AppAvatar :avatar="teacher.avatarUrl" :name="teacher.name" size="md" />
    <div class="teacher-card__info">
      <h3 class="teacher-card__name">{{ teacher.name }}</h3>
      <p class="teacher-card__details">{{ teacher.department }} • {{ teacher.code }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TeacherProfileDto } from '../dtos/classSchedule.dto';
import AppAvatar from '../../../shared/components/AppAvatar.vue';

export default defineComponent({
  name: 'TeacherProfileCard',
  components: { AppAvatar },
  props: {
    teacher: {
      type: Object as PropType<TeacherProfileDto>,
      required: true,
    },
  },
});
</script>

<style scoped>
.teacher-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #e5f0fe;
  /* Light blue matching image */
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 1.5rem;
}

.teacher-card__avatar {
  width: 48px;
  height: 48px;
  background-color: #1877f2;
  /* Primary Blue */
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.teacher-card__name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.teacher-card__details {
  font-size: 0.9rem;
  color: #475569;
  margin: 0.2rem 0 0;
}
</style>
