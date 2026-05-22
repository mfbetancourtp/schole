<template>
  <div class="table-responsive d-flex mb- container-tabs" style="background-color: white; gap: 10px">
    <AppCheckPermission permission="classroom.activitiesTeacher.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: tabsStore.activities.router,
          params: { courseId: tabsStore.activities.params.courseId },
        }"
      >
        <div class="button-tabs activities" @click="selectTabsStore('activities')" :class="tabsStore.activities.active === true ? ' selecterActivities active-tab' : 'activities'">
          <AppGetIcon class="icon-tabs" name="activities" />
          Actividades
        </div>
      </router-link>
    </AppCheckPermission>
    <AppCheckPermission permission="classroom.attendance.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: tabsStore.atendence.router,
          params: { courseId: tabsStore.atendence.params.courseId },
        }"
      >
        <div class="button-tabs atendence" @click="selectTabsStore('atendence')" :class="tabsStore.atendence.active === true ? ' selecterAtendence active-tab' : 'atendence'">
          <AppGetIcon class="icon-tabs" name="attendance" />
          Asistencia
        </div>
      </router-link>
    </AppCheckPermission>
    <AppCheckPermission permission="classroom.competencies.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: `${tabsStore.settingStudy.router}`,
          params: {
            courseId: tabsStore.settingStudy.params.courseId,
            academicPeriodGroupId: tabsStore.settingStudy.params.academicPeriodGroupId,
          },
        }"
      >
        <div class="button-tabs settingStudy" @click="selectTabsStore('settingStudy')" :class="tabsStore.settingStudy.active === true ? 'selecterSettingStudy active-tab' : 'settingStudy'">
          <AppGetIcon class="icon-tabs" name="settings" />
          Competencias
        </div>
      </router-link>
    </AppCheckPermission>
    <AppCheckPermission permission="classroom.activitiesClassification.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: `${tabsStore.activitiesClassification.router}`,
          params: {
            courseId: tabsStore.activitiesClassification.params.courseId,
          },
        }"
      >
        <div
          class="button-tabs activitiesClassification"
          @click="selectTabsStore('activitiesClassification')"
          :class="tabsStore.activitiesClassification.active === true ? 'selecterActivitiesClassification active-tab' : 'activitiesClassification'"
        >
          <AppGetIcon class="icon-tabs" name="classification" />
          Clasificación de Actividades
        </div>
      </router-link>
    </AppCheckPermission>
    <AppCheckPermission permission="classroom.planningWeeks.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: `${tabsStore.planingClassrom.router}`,
          params: {
            academicPeriodGroupId: tabsStore.planingClassrom.params.academicPeriodGroupId,
          },
        }"
      >
        <div
          class="button-tabs planingClassrom"
          @click="selectTabsStore('planingClassrom')"
          :class="tabsStore.planingClassrom.active === true ? ' selecterPlaningClassrom active-tab' : 'planingClassrom'"
        >
          <AppGetIcon class="icon-tabs" name="calendar" />
          Planeador de Clases
        </div>
      </router-link>
    </AppCheckPermission>
    <!-- <AppCheckPermission permission="classroom.followUpToTopics.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: tabsStore.reports.router,
          params: { courseId: tabsStore.reports.params.courseId },
        }"
      >
        <div class="button-tabs reports" @click="selectTabsStore('reports')" :class="tabsStore.reports.active === true ? ' selecterReports active-tab' : 'reports'">
          <AppGetIcon class="icon-tabs" name="reports" />
          Reportes
        </div>
      </router-link>
    </AppCheckPermission> -->
    <AppCheckPermission permission="classroom.newSletters.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: tabsStore.newSletters.router,
          params: { courseId: tabsStore.newSletters.params.courseId },
        }"
      >
        <div class="button-tabs newSletters" @click="selectTabsStore('newSletters')" :class="tabsStore.newSletters.active === true ? ' selecterNewSletters active-tab' : 'newSletters'">
          <AppGetIcon class="icon-tabs" name="certificateFile" fillColor="#000" />
          Observaciones
        </div>
      </router-link>
    </AppCheckPermission>
    <AppCheckPermission permission="classroom.homeTeacher.leveling.list" :notSee="true">
      <router-link
        class="tabs-router"
        :to="{
          name: tabsStore.leveling.router,
          params: {
            courseId: tabsStore.newSletters.params.courseId,
            subjectAssignmentId: tabsStore.leveling.params.subjectAssignmentId,
          },
        }"
      >
        <div class="button-tabs leveling" @click="selectTabsStore('leveling')" :class="tabsStore.leveling.active === true ? ' selecterLeveling active-tab' : 'leveling'">
          <AppGetIcon class="icon-tabs" name="leveling" strokeColor="#000" />
          Nivelación
        </div>
      </router-link>
    </AppCheckPermission>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { useTabsTeacherStore } from '../../../stores/tabsTeacher.store ';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

export default defineComponent({
  name: 'tabsIcons',
  components: {
    AppGetIcon,
    AppCheckPermission,
  },

  setup() {
    const tabsStore = useTabsTeacherStore();

    onUnmounted(() => {
      tabsStore.persistState();
    });
    const selectTabsStore = (selectTabs: any) => {
      tabsStore.planingClassrom.active = selectTabs === 'planingClassrom';
      tabsStore.activitiesClassification.active = selectTabs === 'activitiesClassification';
      tabsStore.settingStudy.active = selectTabs === 'settingStudy';
      tabsStore.activities.active = selectTabs === 'activities';
      tabsStore.atendence.active = selectTabs === 'atendence';
      // tabsStore.reports.active = selectTabs === 'reports';
      tabsStore.newSletters.active = selectTabs === 'newSletters';
      tabsStore.leveling.active = selectTabs === 'leveling';

      tabsStore.persistState(); // Llama a persistState después de cambiar el estado
    };
    return {
      tabsStore,
      selectTabsStore,
    };
  },
});
</script>

<style scoped>
.container-tabs {
  position: sticky;
  top: 3px;
  z-index: 5;
  backdrop-filter: blur(1px); /* Aplica el desenfoque */
  -webkit-backdrop-filter: blur(1px);
  border-radius: 8px;
  max-width: min-content;
  width: auto;
}
.container-tabs a {
  filter: none;
}
.tabs-router {
  display: flex;
  align-items: center;
  /*gap: 6px; /* Espaciado uniforme entre botones */
  padding: 4px;
  text-decoration: none;
}

.button-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 2px solid #ccc; /* Borde definido */
  background: #e4e4e4;
  color: #5b5f62;
  font-family: Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 28px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.3s ease, transform 0.2s ease, border-color 0.3s ease;
}
.active-tab {
  transition: transform 0.3s ease-in-out, color 0.3s ease-in-out;
}
.button-tabs:hover,
.active-tab {
  transform: scale(1.03);
  color: #000;
  font-weight: bold;
  /* font-size: 15px; /*Revisar tiempo de transicion*/
  /*border-color: #999; /* Cambia el borde al hacer hover */
}

.button-tabs .icon-tabs {
  width: 28x;
  height: 28px;
  transition: transform 0.3s ease;
}

.button-tabs:hover .icon-tabs,
.active-tab .icon-tabs {
  transform: scale(1.1);
}
.active-tab:hover {
  filter: brightness(0.9);
}

/* Estilos para cada pestaña con su hover */
.planingClassrom {
  background: #ffefc4;
  border-color: #ffc107;
}
.planingClassrom:hover,
.selecterPlaningClassrom {
  background: #ffe399;
}
.settingStudy {
  background: #ffaeae;
  border-color: #ff5252;
}
.settingStudy:hover,
.selecterSettingStudy {
  background: #fd8686;
}
.activitiesClassification {
  background: #fbe2ff;
  border-color: #d94fd9;
}
.activitiesClassification:hover,
.selecterActivitiesClassification {
  background: #efb3f9;
}
.activities {
  background: #bcedcc;
  border-color: #52b788;
}
.activities:hover,
.selecterActivities {
  background: #91deaa;
}
.activities:hover,
.selecterActivities {
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}
.atendence {
  background: #f1f1f1;
  border-color: #bdbdbd;
}
.atendence:hover,
.selecterAtendence {
  background: #dfdfdf;
}
.reports {
  background: #ace6f1;
  border-color: #29b6f6;
}
.reports:hover,
.selecterReports {
  background: #7ecddf;
}
.newSletters {
  background: #f9a9ea;
  border-color: #d164a5;
}
.newSletters:hover,
.selecterNewSletters {
  background: #eb7ae9;
}
.leveling {
  background: #ace6f1;
  border-color: #29b6f6;
}
.leveling:hover,
.selecterLeveling {
  background: #8ae1ef;
}
</style>
