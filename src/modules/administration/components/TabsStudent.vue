<template>
  <div class="table-responsive d-flex mb-3 container-tabs" style="background-color: white">
    <router-link
      class="tabs-router"
      :to="{
        name: tabsStore.activities.router,
        params: { courseId: tabsStore.activities.params.courseId },
      }"
    >
      <div class="button-tabs activities" @click="selectTabsStudentStore('activities')" :class="tabsStore.activities.active === true ? ' selecterActivities' : 'activities'">
        <AppGetIcon class="icon-tabs" name="activities" />
        Actividades
      </div>
    </router-link>
    <router-link
      class="tabs-router"
      :to="{
        name: tabsStore.atendence.router,
        params: { courseId: tabsStore.activities.params.courseId },
      }"
    >
      <div class="button-tabs atendence" @click="selectTabsStudentStore('atendence')" :class="tabsStore.atendence.active === true ? ' selecterAtendence' : 'atendence'">
        <AppGetIcon class="icon-tabs" name="attendance" />
        Asistencia
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import { useTabsStudentStore } from '../../../stores/tabsStudent.store';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

export default defineComponent({
  name: 'tabsIcons',
  components: {
    AppGetIcon,
  },
  setup() {
    const tabsStore = useTabsStudentStore();

    onUnmounted(() => {
      tabsStore.persistState();
    });
    const selectTabsStudentStore = (selectTabs: any) => {
      tabsStore.activities.active = selectTabs === 'activities';
      tabsStore.atendence.active = selectTabs === 'atendence';

      tabsStore.persistState(); // Llama a persistState después de cambiar el estado
    };
    return {
      tabsStore,
      selectTabsStudentStore,
    };
  },
});
</script>

<style scoped>
.button-tabs {
  /* display: inline-flex; */
  padding: 4px 28px;
  align-items: flex-start;
  gap: 10px;
  border-radius: 4px;
  background: #e4e4e4;
  color: #5b5f62;
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
  cursor: pointer;
  white-space: nowrap;
  border-right: 1px solid #9ea1a5;
}

.planingClassrom:hover,
.selecterPlaningClassrom {
  background: white;
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}

.settingStudy:hover,
.selecterSettingStudy {
  background: white;
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}
.activitiesClassification:hover,
.selecterActivitiesClassification {
  background: white;
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}

.activities:hover,
.selecterActivities {
  background: white;
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}

.atendence:hover,
.selecterAtendence {
  background: white;
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}

.reports:hover,
.selecterReports {
  background: white;
  border-right: 1px solid #9ea1a5;
  padding-top: 10px;
  color: #000;
  font-size: 16px;
  font-weight: 700;
}

.tabs-router {
  display: flex;
  align-items: center;
  /*gap: 6px; /* Espaciado uniforme entre botones */
  padding: 4px;
  text-decoration: none;
}
.atendence {
  background: #f1f1f1;
  border-color: #bdbdbd;
}
.atendence:hover,
.selecterAtendence {
  background: #dfdfdf;
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

.activities {
  background: #bcedcc;
  border-color: #52b788;
}
.activities:hover,
.selecterActivities {
  background: #91deaa;
}
</style>
