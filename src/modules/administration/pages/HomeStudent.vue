<template>
  <AppBaseList :title="title">
    <template #content>
      <div class="cards">
        <div class="card__subjects">
          <AppCard>
            <template #title>
              <div class="title-header d-flex justify-content-between">
                <h3 class="title-content" style="color: black">Materias</h3>
                <!-- <div class="icono-notificaciones dropdown show" v-if="windowWidth <= 800" @click="toggleNotifications">
                  <a class="opc text-decoration-none p-2 ps-3 pe-3 text-dark" href="#" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                    <AppButton icon="bell" v-tooltip="'Notificaciones'"></AppButton>
                  </a>
                  <ul class="dropdown-menu p-0" aria-labelledby="navbarDropdown">
                    <div class="dropdown-text">
                      <div class="dropdown-title">
                        <h3 class="title__content">Notificaciones</h3>
                      </div>
                      <AppEmptyResponse style="font-size: 5px" v-if="!notificationsNotOpen.length" :subtitle="false"> </AppEmptyResponse>
                      <div class="container-items" v-for="(item, index) in notificationsNotOpen" :key="index">
                        <AppCardNotification
                          :textNotification="item.description"
                          :iconoName="item.title === '' ? 'iconAlert' : item.title === '' ? 'iconSee' : item.title === '' ? 'iconTime' : 'iconMessage'"
                        >
                        </AppCardNotification>
                      </div>
                    </div>
                  </ul>
                </div> -->
              </div>
            </template>
            <template #body>
              <SelectionStudentsByParent @update-student-user-id="updateStudentUserId"></SelectionStudentsByParent>
              <AppLoading v-if="loadingActivities"></AppLoading>
              <template v-else>
                <AppEmptyResponse v-if="!activitiesByCourse.length" :show-image="true"></AppEmptyResponse>
                <div v-else class="card-container">
                  <div class="container-items" v-for="(activity, index) in activitiesByCourse" :key="index">
                    <AppCardSubjects :titleCard="activity.name" :nameTeacherName="activity.teacherName" :titleProgress="'Mi Progreso'">
                      <template #icon-teacher>
                        <div>
                          <AppAvatar :size="'lg'" :name="`${activity?.teacherName}`" :avatar="activity.teacherAvatar"> </AppAvatar>
                        </div>
                      </template>
                      <template #buttons-activitys>
                        <AppCheckPermission permission="classroom.activitiesStudent.list" notSee>
                          <router-link
                            :to="{
                              name: 'administration.studentActivities',
                              query: {
                                courseId: activity.id,
                                academicPeriodGroupId: activity.periodId,
                              },
                            }"
                            replace
                            @click="
                              selectTabsStore(
                                'activities',
                                {
                                  courseId: activity.id,
                                  academicPeriodGroupId: activity.periodId,
                                },
                                'administration.studentActivities'
                              )
                            "
                          >
                            <div class="earring-container activities-earring">
                              <span style="position: absolute; left: 67%; top: -19%; z-index: 5" v-if="activity.totalActivities" class="badge rounded-pill text-bg-primary bg-primary">
                                {{ activity.totalActivities - activity.totalEvaluatedActivities }}
                                <span class="hover-activity">Actividades sin calificar</span>
                              </span>
                            </div>

                            <div class="button-container buttons-activitys button__activity">
                              <AppGetIcon name="activities" />
                              <span class="hover-text">Actividades</span>
                            </div>
                          </router-link>
                        </AppCheckPermission>
                        <AppCheckPermission permission="classroom.attendanceStudent.list" notSee>
                          <router-link
                            :to="{
                              name: 'administration.studentAttendance',
                              query: {
                                courseId: activity.id,
                                academicPeriodGroupId: activity.periodId,
                              },
                            }"
                            replace
                            @click="
                              selectTabsStore(
                                'atendence',
                                {
                                  courseId: activity.id,
                                },
                                'administration.studentAttendance'
                              )
                            "
                          >
                            <div class="button-container buttons-activitys button__course">
                              <AppGetIcon name="attendance" />
                              <span class="hover-text">Asistencia</span>
                            </div>
                          </router-link>
                        </AppCheckPermission>
                        <div v-if="activity.lmsInstitutionPlatformId && activity.lmsCourseId">
                          <div v-if="activity.sso === true">
                            <a style="cursor: pointer" class="text-decoration-none p-2 pe-1 text-dark" target="_blank" @click="goToSingleSignOn(activity.id)"
                              ><div class="button-container buttons-activitys button__house">
                                <AppGetIcon name="iconHose" />
                                <span class="hover-text">Abrir Curso LMS</span>
                              </div></a
                            >
                          </div>
                          <div v-else>
                            <a style="cursor: pointer" class="text-decoration-none p-2 pe-1 text-dark" :href="activity.urlLms" target="_blank">
                              <div class="button-container buttons-activitys button__house">
                                <AppGetIcon name="iconHose" />
                                <span class="hover-text">Abrir Curso LMS</span>
                              </div></a
                            >
                          </div>
                        </div>
                      </template>
                      <template #graph>
                        <div class="container-info mb-3 mt-3" :titleProgress="'Mi Progreso'">
                          <div class="information text-center" style="border-right: 1px solid rgb(158, 161, 165)">
                            <span>{{ activity.totalEvaluatedActivities }} / {{ activity.totalActivities }}</span>
                            <span class="title-card">Actividades del periodo</span>
                          </div>
                          <AppCheckPermission permission="classroom.qualifiedActivities.list" notSee>
                            <div class="information" style="border-right: 1px solid rgb(158, 161, 165)">
                              <span>{{ activity.finalPeriod || 0 }}</span>
                              <span class="title-card">{{ t('classroom.qualifiedActivities.title') + ' - ' + activity.periodName }}</span>
                            </div>
                          </AppCheckPermission>
                          <AppCheckPermission permission="classroom.overallAverage.list" notSee>
                            <div class="information">
                              <span>{{ activity.finalQuality }}</span>
                              <span class="title-card">{{ t('classroom.overallAverage.title') }}</span>
                            </div>
                          </AppCheckPermission>
                        </div>
                        <div class="graph__container">
                          <span class="title-graph">Progreso de actividades</span>
                          <div class="bar__container">
                            <div class="bar__progress progress">
                              <div
                                :style="{
                                  width: activity.activitiesPercentage + '%',
                                }"
                                class="progress-bar"
                              >
                                {{ activity.activitiesPercentage.split('.')[0] }}%
                              </div>
                              <span class="text__hover">Porcentaje Avance de actividades</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </AppCardSubjects>
                  </div>
                </div>
              </template>
            </template>
          </AppCard>
        </div>
        <!-- <div class="card__notification">
          <AppCard>
            <template #title>
              <h3 class="title__content">Notificaciones</h3>
            </template>

            <template #body>
              <div class="container-items" v-for="(item, index) in notificationsNotOpen" :key="index">
                <AppCardNotification :textNotification="item.description" :iconoName="item.title === '' ? 'iconAlert' : item.title === '' ? 'iconSee' : item.title === '' ? 'iconTime' : 'iconMessage'">
                </AppCardNotification>
              </div>
            </template>
          </AppCard>
        </div> -->
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useTabsStudentStore } from '../../../stores/tabsStudent.store';

import isoWeek from 'dayjs/plugin/isoWeek';
import dayjs from 'dayjs';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import SelectionStudentsByParent from '../components/SelectionStudentsByParent.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';

import { GetHomeStudentService } from '../services/getHomeStudent.service';
// import { GetNotificationsNotOpenService } from '../services/getNotificationsNotOpenMessages.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppCardSubjects from '../../../shared/components/Card/AppCardSubjects.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
// import AppCardNotification from '../../../shared/components/Card/AppCardNotification.vue';
// import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { PostLoginSSOService } from '../services/postLoginSSO.service';

// const getNotificationsNotOpenService = new GetNotificationsNotOpenService();
const getHomeStudentService = new GetHomeStudentService();
const postLoginSSOService = new PostLoginSSOService();

dayjs.extend(isoWeek);
export default defineComponent({
  name: 'HomeStudent',
  components: {
    AppCheckPermission,
    SelectionStudentsByParent,
    AppEmptyResponse,
    AppBaseList,
    AppLoading,
    AppCard,
    AppCardSubjects,
    AppAvatar,
    AppGetIcon,
    // AppCardNotification,
    // AppButton,
  },

  setup() {
    const { t } = useI18n();
    const windowWidth = ref(window.innerWidth);
    const title = 'core.menu.home-student';

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Salón de clases', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const notificationsNotOpen: Ref<any[]> = ref([]);
    const activitiesByCourse: Ref<any[]> = ref([]);
    const showNotifications = ref(false);

    const loadingActivities = ref(false);

    const tabsStore = useTabsStudentStore();
    const selectTabsStore = (selectTabs: string, params: any, router: string) => {
      (tabsStore.activities = {
        active: selectTabs === 'activities',
        params: params,
        router: (router = 'administration.studentActivities'),
        returnTo: (router = 'home-student'),
      }),
        (tabsStore.atendence = {
          active: selectTabs === 'atendence',
          params: params,
          router: (router = 'administration.studentAttendance'),
          returnTo: (router = 'home-student'),
        });
    };

    const updateStudentUserId = async (studentUserId: any) => {
      loadingActivities.value = true;

      if (studentUserId) {
        const params = { userId: studentUserId as number };

        // notificationsNotOpen.value = await getNotificationsNotOpenService.run(params);
        activitiesByCourse.value = await getHomeStudentService.run(params);
      } else {
        // notificationsNotOpen.value = await getNotificationsNotOpenService.run();
        activitiesByCourse.value = await getHomeStudentService.run();
      }

      loadingActivities.value = false;
    };
    onMounted(() => {
      window.addEventListener('resize', () => {
        windowWidth.value = window.innerWidth;
      });
    });
    const openLmsCourse = (url: string) => {
      window.open(url, '_blank');
    };
    const toggleNotifications = () => {
      if (windowWidth.value <= 500) {
        showNotifications.value = true;
      } else {
        showNotifications.value = !showNotifications.value;
      }
    };

    const goToSingleSignOn = async (id: number) => {
      if (activitiesByCourse.value.length > 0) {
        const response = await postLoginSSOService.run({ courseId: id });
        if (response) {
          openLmsCourse(response);
        }
      }
    };

    return {
      routes,
      title,
      t,

      notificationsNotOpen,
      activitiesByCourse,
      loadingActivities,

      updateStudentUserId,
      selectTabsStore,
      dayjs,
      windowWidth,
      showNotifications,
      toggleNotifications,
      goToSingleSignOn,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.opc:hover {
  background-color: unset;
}
.o-btn--icon:active {
  color: var(--color-light);
  background-color: var(--color-secondary);
}
.cards {
  width: 100%;
  gap: 10px;
  display: flex;
}
.card__subjects {
  width: 100%;
  /* display: flex;
  flex-direction: column;
  gap: 18px; */
}

.card-container {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}

.button-container:hover .hover-text {
  display: block;
}
.number-container:hover .hover-number {
  display: block;
}
.earring-container:hover .hover-activity {
  display: block;
}

.button-container,
.earring-container {
  display: flex;
  justify-content: center;
}
.buttons-activitys {
  position: relative;
}

.button__activity {
  background: #bcedcc;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 12px;
}

.button__activity:hover {
  background: #91deaa;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.4);
}
.button__course {
  background: #fbe2ff;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 12px;
}

.button__course:hover {
  background: #efb3f9;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}
.button__house {
  background: #ffefc4;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 12px;
}

.button__house:hover {
  background: #ffe399;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}
.hover-text,
.hover-activity {
  position: absolute;
  left: 25%;
  top: -40%;
  z-index: 99;
  display: none;
  width: auto;
  padding: 6px 10px;
  white-space: nowrap;
  transform: translateY(-50%);
  background: white;
  color: black;
  border-radius: 4px;
  box-shadow: 1px 2px 6px #0006;
}
.container-info {
  background-color: white;
  display: flex;
  justify-content: center;
  padding: 10px 22px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  gap: 10px;
}

.information {
  display: flex;
  flex-direction: column;
  padding-right: 10px;
  /* border-right: 1px solid #9ea1a5; */
  align-items: center;
  font-weight: 800;
  text-align: center;
  font-size: 17px;
}
.title-card {
  font-family: Roboto;
  font-style: italic;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: #3c4248;
}

.tasks-container {
  justify-content: space-between;
  align-items: start;
  width: 100%;
  gap: 8px;
  padding: 10px;
}
.tasks-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.title-tasks {
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: #656c72;
}
.title-tasks:hover {
  color: black;
}
.date-tasks {
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.4px;
  color: #8a8c8d;
}
.tasks-number {
  background-color: #bcedcc;
  border-radius: 50%;
  padding: 4px 13px;
}
.hover-number {
  position: absolute;
  left: -171%;
  top: -40%;
  z-index: 99;
  width: auto;
  padding: 6px 10px;
  display: none;
  white-space: nowrap;
  transform: translateY(-71%);
  background: white;
  color: black;
  border-radius: 4px;
  box-shadow: 1px 2px 6px #0006;
}
.content-number {
  color: #0d953a;
  font-weight: 900;
  font-size: 17px;
}
.card__notification {
  width: 100%;
  max-width: 296px;
}

.title__content {
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: #2e3135;
}

@media (max-width: 800px) {
  .card__notification {
    display: none;
  }
  .dropdown-text {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
    border-radius: 4px;
    padding: 17px 24px;
    width: 100%;
    gap: 12px;
    justify-content: space-between;
  }
  .dropdown-menu {
    width: 300px;
    max-height: 400px;
    overflow: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    z-index: 2;
    gap: 10px;
  }
}
.bar__container:hover .text__hover {
  display: block;
}
.text__hover {
  position: absolute;
  left: 35%;
  top: -10%;
  z-index: 99;
  display: none;
  width: auto;
  padding: 6px 10px;
  white-space: nowrap;
  transform: translateY(-100%);
  background: white;
  color: black;
  border-radius: 4px;
  box-shadow: 1px 2px 6px #0006;
}
</style>
