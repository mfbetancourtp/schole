<template>
  <Swiper
    :modules="[Navigation, Pagination, Autoplay]"
    navigation
    :pagination="{ clickable: true }"
    :autoplay="{ delay: 3000, disableOnInteraction: false }"
    grabCursor
    slidesPerView="auto"
    :spaceBetween="20"    
    :breakpoints="{ 0: { spaceBetween: 12 }, 500: { spaceBetween: 20 } }"
    class="course-slider"
  >

    <SwiperSlide v-for="course in coursesList" :key="course.courseId" class="slide">
      <AppCardSubjects :titleCard="course.courseName" :nameTeacherName="course.teacherNames" titleProgress="Mi Progreso">
        <!-- ICON-TEACHER -->
        <template #icon-teacher>
          <AppAvatar :avatar="course.teacherAvatar" size="lg" :name="course.teacherNames" />
        </template>

        <!-- BUTTONS-ACTIVITYS -->
        <template #buttons-activitys>
          <!-- Actividades -->
          <AppCheckPermission permission="classroom.activitiesStudent.list" notSee>
            <router-link
              :to="{
                name: 'administration.studentActivities',
                query: {
                  courseId: course.courseId,
                  academicPeriodGroupId: course.periodId,
                },
              }"
              replace
              @click="
                selectTabsStore(
                  'activities',
                  {
                    courseId: course.courseId,
                    academicPeriodGroupId: course.periodId,
                  },
                  'administration.studentActivities'
                )
              "
            >
              <div class="earring-container activities-earring">
                <span v-if="course.notEvaluatedActivitiesQuantity" class="badge rounded-pill text-bg-primary bg-primary" style="position: absolute; left: 67%; top: -19%; z-index: 5">
                  {{ course.notEvaluatedActivitiesQuantity }}
                  <span class="hover-activity">{{ t('core.administration.activites.not.calification') }}</span>
                </span>
              </div>

              <div class="button-container buttons-activitys button__activity">
                <AppGetIcon name="activities" />
                <span class="hover-text">{{ t('classroom.studentActivities.title') }}</span>
              </div>
            </router-link>
          </AppCheckPermission>

          <!-- Asistencia -->
          <AppCheckPermission permission="classroom.attendanceStudent.list" notSee>
            <router-link
              :to="{
                name: 'administration.studentAttendance',
                query: {
                  courseId: course.courseId,
                  periodId: course.periodId,
                },
              }"
              replace
              @click="selectTabsStore('atendence', { courseId: course.courseId }, 'administration.studentAttendance')"
            >
              <div class="button-container buttons-activitys button__course">
                <AppGetIcon name="attendance" />
                <span class="hover-text">{{ t('classroom.homeTeacher.attendance') }}</span>
              </div>
            </router-link>
          </AppCheckPermission>
          <div v-if="course.lmsInstitutionPlatformId && course.lmsCourseId">
            <div v-if="course.sso === true">
              <a style="cursor: pointer" class="text-decoration-none p-2 pe-1 text-dark" target="_blank" @click="goToSingleSignOn(course.courseId)"
                ><div class="button-container buttons-activitys button__house">
                  <AppGetIcon name="iconHose" />
                  <span class="hover-text">Abrir Curso LMS</span>
                </div></a
              >
            </div>
            <div v-else>
              <a style="cursor: pointer" class="text-decoration-none p-2 pe-1 text-dark" :href="course.urlLms" target="_blank">
                <div class="button-container buttons-activitys button__house">
                  <AppGetIcon name="iconHose" />
                  <span class="hover-text">Abrir Curso LMS</span>
                </div></a
              >
            </div>
          </div>
        </template>

        <!-- GRAPH -->
        <template #graph>
          <div class="container-info mb-3 mt-3">
            <div class="information text-center" style="border-right: 1px solid #9ea1a5">
              <span>{{ course.evaluatedActivitiesQuantity }} / {{ course.activitiesQuantity }}</span>
              <span class="title-card">{{ t('core.administration.activities.period') }}</span>
            </div>
            <AppCheckPermission permission="classroom.qualifiedActivities.list" notSee>
              <div class="information" style="border-right: 1px solid #9ea1a5">
                <span>{{ course.periodNote || 0 }}</span>
                <span class="title-card">
                  {{ t('classroom.qualifiedActivities.title') }} -
                  {{ course.periodName }}
                </span>
              </div>
            </AppCheckPermission>
            <AppCheckPermission permission="classroom.overallAverage.list" notSee>
              <div class="information">
                <span>{{ course.finalQuality }}</span>
                <span class="title-card">{{ t('classroom.overallAverage.title') }}</span>
              </div>
            </AppCheckPermission>
          </div>

          <div class="graph__container">
            <span class="title-graph">{{ t('core.administration.progres.activities') }}</span>
            <div class="bar__container">
              <div class="bar__progress progress">
                <div :style="{ width: course.activitiesPercentage + '%' }" class="progress-bar">{{ course.activitiesPercentage.split('.')[0] }}%</div>
                <span class="text__hover">{{ t('core.administration.avance.activities') }}</span>
              </div>
            </div>
          </div>
        </template>
      </AppCardSubjects>
    </SwiperSlide>
  </Swiper>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import dayjs from 'dayjs';
import { useTabsStudentStore } from '../../../stores/tabsStudent.store';
import AppCardSubjects from '../../../shared/components/Card/AppCardSubjects.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import { useI18n } from 'vue-i18n';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import { PostLoginSSOService } from '../services/postLoginSSO.service';

const postLoginSSOService = new PostLoginSSOService();

type Course = {
  courseId: string | number;
  courseName: string;
  periodName: string;
  teacherAvatar: string;
  teacherNames: string;
  periodNote: number;
  finalQuality: number;
  activitiesQuantity: number;
  notEvaluatedActivitiesQuantity: number;
  evaluatedActivitiesQuantity: number;
  activitiesPercentage: string;
  periodId: string | number;
  lmsInstitutionPlatformId: string | number;
  lmsCourseId: string | number;
  sso: string | boolean;
  urlLms: string;
};

export default defineComponent({
  name: 'CourseSlider',
  components: {
    Swiper,
    SwiperSlide,
    AppCardSubjects,
    AppAvatar,
    AppGetIcon,
    AppCheckPermission,
  },
  props: {
    courses: {
      type: Array as PropType<Course[]>,
      required: true,
    },
  },
  setup(props) {
    const tabsStore = useTabsStudentStore();
    const coursesList = ref<Course[]>([]);
    const { t } = useI18n();

    onMounted(() => {
      coursesList.value = props.courses;
    });

    const selectTabsStore = (selectTabs: string, params: any, router: string) => {
      (tabsStore.activities = {
        active: selectTabs === 'activities',
        params: params,
        router: (router = 'administration.studentActivities'),
        returnTo: (router = 'dashboardStudent'),
      }),
        (tabsStore.atendence = {
          active: selectTabs === 'atendence',
          params: params,
          router: (router = 'administration.studentAttendance'),
          returnTo: (router = 'dashboardStudent'),
        });
    };
    const openLmsCourse = (url: string) => {
      window.open(url, '_blank');
    };
    const goToSingleSignOn = async (id: any) => {
      if (coursesList.value.length > 0) {
        const response = await postLoginSSOService.run({ courseId: id });
        if (response) {
          openLmsCourse(response);
        }
      }
    };
    return {
      t,
      coursesList,
      selectTabsStore,
      Navigation,
      Pagination,
      Autoplay,
      goToSingleSignOn,
    };
  },
});
</script>

<style scoped>
.course-slider {
  padding: 1rem 0;
}
.slide {
  padding-bottom: 1.5rem;
  width: 355px;
  height: unset;
}

.tasks-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tasks-number {
  font-weight: bold;
  margin-left: auto;
}

.button-container:hover .hover-text {
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
.number-container:hover .hover-number {
  display: block;
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
.earring-container:hover .hover-activity {
  display: block;
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
.title-graph {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: #3c4248;
}
.bar__container {
  position: relative;
  width: 100%;
}

.bar__container:hover .text__hover {
  display: block;
}

.bar__progress {
  background: #cdecf4;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  margin-bottom: 0.5rem;
}

.bar__progress:hover {
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
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
/* Puntos de paginación */
.swiper-pagination-bullet {
  width: 10px;
  height: 10px;
  background: #ccc;
  opacity: 1;
}
.swiper-pagination-bullet-active {
  background: var(--color-primary);
}

/* Personalización del color de las flechas de navegación */
.swiper-button-next,
.swiper-button-prev {
  color: var(--color-primary) !important;
}
/* Ataca los botones inyectados por Swiper */
::v-deep .swiper-button-next,
::v-deep .swiper-button-prev {
  color: var(--color-primary) !important;
}

/* Y también sus pseudo-elementos que dibujan la flecha */
::v-deep .swiper-button-next::after,
::v-deep .swiper-button-prev::after {
  color: var(--color-primary) !important;
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


/* < 500px: cada slide de 100px de ancho */
@media (max-width: 500px) {
  .slide {
    width: 100%;

  }
}
</style>
