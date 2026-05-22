<template>
  <transition name="drawer">
    <div class="drawer-overlay" v-if="visible" @click.self="closeDrawer">
      <div class="drawer">
        <div class="drawer-header">
          <button class="close-btn" @click="closeDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 class="drawer-title">{{ data.nameDrawer }}</h2>
          <AppButton
            v-if="planningWeekWithDetail"
            :disabled="!planningWeekWithDetail"
            :label="planningWeekWithDetail.isApproved ? 'Desaprobar Planeación' : 'Aprobar Planeación'"
            @click="ApproveDisapprovePlanning"
          ></AppButton>
        </div>

        <div class="drawer-tabs">
          <button v-for="tab in tabs" :key="tab.id" :class="['tab-button', { active: activeTab === tab.id }]" @click="activeTab = tab.id">
            <span class="tab-icon" v-html="tab.icon"></span>
            <span class="tab-text">{{ tab.label }}</span>
          </button>
        </div>

        <div class="drawer-content">
          <transition mode="out-in">
            <div :key="activeTab">
              <div v-if="activeTab === 'config'">
                <!-- Mantenemos exactamente igual que en el original para evitar problemas -->
                <SettingsPlanningWeeks :planningWeekWithDetail="planningWeekWithDetail" :academicPeriodGroupId="$props.academicPeriodGroupId" @planning-saved="handlePlanningSaved" />
              </div>
              <div v-else-if="activeTab === 'plan'">
                <!-- Pestaña de Plan de Clases -->
                <div class="form-group">
                  <LessonPlan :courseId="courseId" :planningWeekWithDetail="planningWeekWithDetail" @planning-saved="handleLessonSaved" />
                </div>
              </div>
              <div v-else-if="activeTab === 'activities'">
                <!-- Pestaña de Actividades -->
                <div class="form-group">
                  <ActivitiesTeacherFormDrawer :planningWeekWithDetail="planningWeekWithDetail" :activities="planningWeekWithDetail?.activities" :comments="planningWeekWithDetail?.comments" />
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="drawer-footer"></div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, PropType, computed } from 'vue';

// components
import SettingsPlanningWeeks from './SettingsPlanningWeeks.vue';
import LessonPlan from './LessonPlan.vue';
import ActivitiesTeacherFormDrawer from './ActivitiesTeacherFormDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

// dto
import { PlanningWeekWithDetailDto } from '../dtos/planningWeek.dto';

// services
import { ApproveOrDisapprovePlanningService } from '../services/approveOrDisapprovePlanning.service';

const approveOrDisapprovePlanningService = new ApproveOrDisapprovePlanningService();

export default defineComponent({
  name: 'PlanningWeeksDrawer',
  components: {
    AppButton,
    ActivitiesTeacherFormDrawer,
    SettingsPlanningWeeks,
    LessonPlan,
  },
  props: {
    nameDrawer: { type: String, required: true },
    visible: { type: Boolean, default: false },
    academicPeriodGroupId: { type: Number, required: false },
    courseId: { type: Number, required: true },
    planningWeekId: { type: Number, required: false, default: null },
    planningWeekWithDetail: {
      type: Object as PropType<PlanningWeekWithDetailDto | null>,
      default: null,
    },
  },
  emits: ['update:visible', 'reload-data'],
  setup(props, { emit }) {
    const data = props;
    const activeTab = ref('config');
    // Bandera que indica que la configuración fue guardada con éxito
    const configSaved = ref(false);
    const formData = reactive({
      name: '',
      classPlan: '',
      activity: '',
    });

    const tabs = computed(() => [
      {
        id: 'config',
        label: 'Configuración',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
        disabled: false,
      },
      {
        id: 'plan',
        label: 'Plan de Clases',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        disabled: !configSaved.value,
      },
      {
        id: 'activities',
        label: 'Actividades',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
        disabled: !configSaved.value,
      },
    ]);

    const closeDrawer = () => {
      localStorage.removeItem('planningWeekId');
      localStorage.removeItem('dataSendPW');
      localStorage.removeItem('curriculumSubjectIdLS');
      emit('update:visible', false);
      emit('reload-data');
    };

    // Función que se ejecuta cuando se recibe el evento del hijo
    const handlePlanningSaved = () => {
      configSaved.value = true;
      activeTab.value = 'plan';
    };

    const handleLessonSaved = () => {
      activeTab.value = 'activities';
    };

    const ApproveDisapprovePlanning = async () => {
      try {
        if (props.planningWeekWithDetail?.id) {
          await approveOrDisapprovePlanningService.run(props.planningWeekWithDetail.id);
        }
        localStorage.removeItem('planningWeekId');
        localStorage.removeItem('dataSendPW');
        localStorage.removeItem('curriculumSubjectIdLS');
        emit('update:visible', false);
        emit('reload-data');
      } catch (error) {
        console.error('Error', error);
      }
    };

    return {
      data,
      activeTab,
      formData,
      closeDrawer,
      tabs,
      handlePlanningSaved,
      handleLessonSaved,
      ApproveDisapprovePlanning,
    };
  },
});
</script>

<style scoped>
/* Variables para personalización */
:root {
  --primary-color: #4361ee;
  --primary-hover: #3a56d4;
  --secondary-color: #f8f9fa;
  --text-color: #333;
  --border-color: #e9ecef;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
  --border-radius: 8px;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}

.drawer {
  background: #fff;
  width: 510px;
  height: 100%;
  box-shadow: -2px 0 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

/* Encabezado del drawer - Invertido como solicitaste */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.drawer-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  text-align: right;
}

.close-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed);
}

.close-btn:hover {
  background-color: rgba(108, 117, 125, 0.1);
}

/* Pestañas */
.drawer-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: #f8f9fa;
}

.tab-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.tab-button:hover {
  color: var(--primary-color);
  background-color: rgba(67, 97, 238, 0.05);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 500;
}

.tab-icon {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
}

.tab-text {
  font-size: 0.875rem;
}

/* Contenido */
.drawer-content {
  flex: 1;
  padding: 1rem;
  overflow-y: scroll;
  overflow-x: hidden;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color var(--transition-speed);
}

.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

/* Footer */
.drawer-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.primary-button,
.secondary-button {
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: var(--primary-hover);
}

.secondary-button {
  background-color: white;
  color: #6c757d;
  border: 1px solid #ced4da;
}

.secondary-button:hover {
  background-color: #f8f9fa;
}

.button-icon {
  display: flex;
  align-items: center;
}

/* Animaciones */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter,
.drawer-leave-to {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .drawer {
    width: 100%;
  }

  .tab-text {
    font-size: 0.75rem;
  }
}
</style>
